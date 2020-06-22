import { IAppDataType, logger } from "..";
import React from "react";
import express from "express";
import { ISSRRule, ISSRRuleDynamic, ISSRRuleSetCb } from ".";
import { GUEST_METAROLE, PREFIX_GET, UNSPECIFIED_OWNER } from "../../constants";
import { getCookie } from "../mode";
import { ISSRContextType, ISSRCollectedQueryType } from "../../client/internal/providers/ssr-provider";
import { initializeItemizeApp } from "../../client";
import { StaticRouter } from "react-router-dom";
import ReactDOMServer from 'react-dom/server';
import { IGQLRequestFields } from "../../gql-querier";
import { ItemDefinitionIOActions } from "../../base/Root/Module/ItemDefinition";
import { filterAndPrepareGQLValue } from "../resolvers/basic";
import { ISQLTableRowValue } from "../../base/Root/sql";
import Root from "../../base/Root";

const developmentISSSRMode = process.env.NODE_ENV !== "production";

const MEMOIZED_ANSWERS: {
  [memId: string]: {
    html: string,
    collectionSignature: string,
  }
} = {}
export async function ssrGenerator(
  req: express.Request,
  res: express.Response,
  html: string,
  appData: IAppDataType,
  mode: "development" | "production",
  rule: ISSRRuleDynamic | ISSRRuleSetCb,
): Promise<void> {
  // first we need a root instance, because this will be used
  // like an UI thread we need a clean instance from the pool
  let root: Root;
  try {
    root = await appData.rootPool.acquire().promise;
  } catch (err) {
    logger.error(
      "ssrGenerator [SERIOUS]: Could not adquire a root from the pool",
      {
        errStack: err.stack,
        errMessage: err.message,
      }
    )
    res.status(500).end("Internal Server Error");
    return;
  }

  // now we need to see if we are going to use SSR, due to the fact the NODE_ENV must
  // match between the client and the server in order to produce valid SSR, we check the mode
  // that the client recieved, eg. the client is using development or production builds and we activate
  // only if it matches our NODE_ENV, this means that in development mode, with development builds there is SSR
  // but not with production builds, and vice-versa
  const SSRIsDisabledInThisMode = 
    (mode === "development" && !developmentISSSRMode) ||
    (mode === "production" && developmentISSSRMode);

  // now we get the config, and the language, from the original path, rememebr this generator runs
  // on an express router
  const config = appData.config;
  const language = req.originalUrl.split("/")[1];

  // and we need to figure out the SSR rule for this path, for that we got to calculate it
  let appliedRule: ISSRRule;

  // we need the cookies in order to extract our client data
  const cookies = req.headers["cookie"];
  const splittedCookies = cookies ? cookies.split(";").map((c) => c.trim()) : [];

  // now the result rule, first, did we get a rule?... all paths that do not match a resource
  // or anything whatsoever go through here, and they might not have anything specified for it
  // another thing is that we have a language set, we don't want / matching, and that the language
  // is a valid language... not some made up language also that SSR is not disabled
  // othewise it's meaningless
  let resultRule: ISSRRuleDynamic;
  if (rule && language && config.supportedLanguages.includes(language) && !SSRIsDisabledInThisMode) {
    // if it all passes, we get the rule, there are two types, dynamic and already done
    // if it's dynamic we pass the args, otherwse it is what it is
    resultRule = typeof rule === "function" ? rule(req, language, root) : rule;
  }

  // This is the default, what happens to routes that have nothing setup for them
  // so if no result rule could be calculated, but we also need to ensure that 
  if (!resultRule) {
    // this is the default, this is what we build from the applied rule, what everything
    // gets when there's no SSR enabled, language doesn't matter, only mode, as if, because
    // modes don't mix, so it can be memoized as the standard response, because there's no data
    // it doesn't hydrate in the client side, it renders from scratch; this is the settings that
    // the service worker in the client utilize in order to build the app from scratch, for most users
    // they'll never hit SSR they'll recieve only this fast memoized option meant for the same buildnumber
    // and they'll get it mainly from the service worker, they won't even bother with the server
    appliedRule = {
      title: config.appName,
      description: config.appName,
      ogTitle: config.appName,
      ogDescription: config.appName,
      ogImage: "/rest/resource/icons/android-chrome-512x512.png",
      collect: null,
      noData: true,
      language: null,
      rtl: false,
      languages: config.supportedLanguages,
      forUser: null,
      memId: "*." + mode,
    }
    // this is the root form without any language or any means, there's no SSR data to fill
  } else {

    // So in this case we have an SSR rule, which is good for SEO, we need to extract our
    // user from the token we get
    let userAfterValidate: {
      id: number,
      role: string,
      token: string,
    } = {
      id: null,
      role: GUEST_METAROLE,
      token: null,
    };

    // and we get such from the cookie itself
    const currentToken = getCookie(splittedCookies, "token");
    // if we have it we need to extract its data, we are going to use, we are actually
    // kind of cheating this graphql call, first is the request fields info and second are the
    // args, we only concerned about the args so we pass the token, in the client the TokenProvider
    // would do this call but we do this right here, right now in the server so the token provider
    // mounts immediately and something can be rendered
    if (currentToken) {
      try {
        const tokenData = await appData.customUserTokenQuery(null, {
          token: currentToken,
        })
        userAfterValidate.id = tokenData.id;
        userAfterValidate.token = tokenData.token;
        userAfterValidate.role = tokenData.role;
      } catch (err) {
  
      }
    }

    // so now we can add these fileds, the user, the languages, the rtl
    // honestly most users won't even hit this, as they will use the non SSR response
    // which contains no such things and resolve from the service worker and rebuild the app
    // from scratch, however robots will end up triggering this (as well as bad browsers)
    // and incognito mode possibly; and first users, even when they'll most likely be guests
    appliedRule = {
      ...resultRule,
      noData: false,
      language,
      rtl: config.rtlLanguages.includes(language),
      languages: config.supportedLanguages,
      forUser: userAfterValidate,
    }

    // language makes the memory specific for it, in this case language
    // matters so we need to add it to the memory id
    if (appliedRule.memId) {
      appliedRule.memId += "." + mode + "." + appliedRule.language;
    }

    // however like previously specified, we don't want to cache answers for specific
    // users, because they are different, only guests really matter, so we want
    // to drop the memId in such a case completely, no caching of speciifc user id answers
    // we don't want to memoize specific user answers
    // they should be using the service worker at that point
    if (appliedRule.forUser.id) {
      appliedRule.memId = null;
    }
  }

  // now we start collecting the information
  let collectionSignature: string = null;
  let collectionFailed = false;

  // and gathering the queries
  const queries: ISSRCollectedQueryType[] = [];

  // now we try to collect if we are asked to collect data
  if (appliedRule.collect) {
    // and we need to build this signature of collection of data
    const collectionSignatureArray: string[] = []

    // so we start collecting
    await Promise.all(
      appliedRule.collect.map(async (collectionPoint, index) => {
        const splittedModule = collectionPoint[0].split("/");
        const splittedIdef = collectionPoint[1].split("/");
        if (splittedModule[0] === "") {
          splittedModule.shift();
        }
        if (splittedIdef[0] === "") {
          splittedIdef.shift();
        }

        // get the module and the item definition
        const mod = root.getModuleFor(splittedModule);
        const idef = mod.getItemDefinitionFor(splittedIdef);

        // and we ask the cache for the given value
        let rowValue: ISQLTableRowValue;
        try {
          rowValue = await appData.cache.requestValue(idef, collectionPoint[2], collectionPoint[3]);
        } catch (err) {
          logger.error(
            "ssrGenerator [SERIOUS]: Collection failed due to request not passing",
            {
              errStack: err.stack,
              errMessage: err.message,
            }
          )
          // this is bad our collection failed, it's actually handled gracefully thanks
          // to the fact I can still serve no data at all and the app should work just fine
          // to a client, but nonetheless not a good idea
          collectionFailed = true;
        }

        // now we check, is it not found, if it's not found, or signature is going to be
        // null for such index
        if (rowValue === null) {
          collectionSignatureArray[index] = "null";
        } else {
          // otherwise it's when it was last modified
          collectionSignatureArray[index] = rowValue.last_modified;
        }

        // now we build the fileds for the given role access
        const fields: IGQLRequestFields = idef.buildFieldsForRoleAccess(
          ItemDefinitionIOActions.READ,
          appliedRule.forUser.role,
          appliedRule.forUser.id,
          rowValue ? rowValue.created_by : UNSPECIFIED_OWNER,
        );

        // and if we have fields at all, such user might not even have access to them at all
        // which is possible
        if (fields) {
          // we build the value for the given role with the given fields
          const value = rowValue === null ? null : filterAndPrepareGQLValue(
            appData.knex, appData.cache.getServerData(), rowValue, fields, appliedRule.forUser.role, idef,
          );

          // and now we build the query in the given index
          // the queries[index] can be null, no access
          // queries[index].value = null, not found
          // queries[index].value.DATA = null, blocked
          queries[index] = {
            idef: idef.getQualifiedPathName(),
            id: collectionPoint[2],
            version: collectionPoint[3],
            value: value ? value.toReturnToUser : null,
            fields: value ? value.requestFields : null,
          };
        } else {
          // means no access to them at all
          queries[index] = null;
        }
      })
    );

    // now we build the signature as a string
    collectionSignature = collectionSignatureArray.join(".");
  }

  // so if nothing failed during collection, and we have a memory id
  // and we have a memoized answer for that memory id which matches
  // the collection signature
  if (
    !collectionFailed &&
    appliedRule.memId &&
    MEMOIZED_ANSWERS[appliedRule.memId] &&
    MEMOIZED_ANSWERS[appliedRule.memId].collectionSignature === collectionSignature
  ) {
    // we are done just serve what is in memory and the chicken is done
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(MEMOIZED_ANSWERS[appliedRule.memId].html);

    // remember to clean before release, we don't want to pollute anything
    root.cleanState();
    appData.rootPool.release(root);
    return;
  }

  // now we calculate the og fields that are final, given they can be functions
  // if it's a string, use it as it is, otherwise call the function to get the actual value, they might use values from the queries
  const finalOgTitle = typeof appliedRule.ogTitle === "string" ? appliedRule.ogTitle : appliedRule.ogTitle(queries, config);

  // the description as well, same thing
  const finalOgDescription = typeof appliedRule.ogDescription === "string" ? appliedRule.ogDescription : appliedRule.ogDescription(queries, config);

  // same for the image but this is special
  let finalOgImage = typeof appliedRule.ogImage === "string" ? appliedRule.ogImage : appliedRule.ogImage(queries, config);
  // because if it's a url and og image tags require absolute paths with entire urls
  // we check if it's an absolute path with no host
  if (finalOgImage && finalOgImage.startsWith("/")) {
    // and add the host
    finalOgImage = `https://${req.get("host")}` + finalOgImage;
  } else if (finalOgImage && !finalOgImage.includes("://")) {
    // otherwise we just add the protocol if it was not added
    finalOgImage = `https://` + finalOgImage;
  }

  // now we calculate the same way title and description
  const finalTitle = typeof appliedRule.title === "string" ? appliedRule.title : appliedRule.title(queries, config);
  const finalDescription = typeof appliedRule.description === "string" ? appliedRule.description : appliedRule.description(queries, config);

  // and we start replacing from the HTML itself, note how these things might have returned null for some
  let newHTML = html;
  newHTML = newHTML.replace(/\$SSRLANG/g, appliedRule.language || "");
  newHTML = newHTML.replace(/\$SSRMANIFESTSRC/g, appliedRule.language ? `/rest/resource/manifest.${appliedRule.language}.json` : "");
  newHTML = newHTML.replace(/\$SSRDIR/g, appliedRule.rtl ? "rtl" : "ltr");
  newHTML = newHTML.replace(/\$SSRTITLE/g, finalTitle || "");
  newHTML = newHTML.replace(/\$SSRDESCR/g, finalDescription || "");
  newHTML = newHTML.replace(/\$SSROGTITLE/g, finalOgTitle || finalTitle || "");
  newHTML = newHTML.replace(/\$SSROGDESCR/g, finalOgDescription || finalDescription || "");
  newHTML = newHTML.replace(/\$SSROGIMG/g, finalOgImage || "");

  // and now the href lang tags
  const langHrefLangTags = appliedRule.languages.map((language: string) => {
    return `<link rel="alternate" href="https://${req.get("host")}/${language}" hreflang="${language}">`
  }).join("");

  // if there's no data or the collection has failed, let's not give SSR at all
  // since we cannot really keep it consistent
  if (appliedRule.noData || collectionFailed) {
    // and we go here
    newHTML = newHTML.replace(/\$SSRAPP/g, "");
    newHTML = newHTML.replace(/\"\$SSR\"/g, "null");
    newHTML = newHTML.replace(/\<SSRHEAD\>\s*\<\/SSRHEAD\>|\<SSRHEAD\/\>|\<SSRHEAD\>/ig, langHrefLangTags);
  } else {
    // otherwise with the SSR
    const ssr: ISSRContextType = {
      queries,
      user: appliedRule.forUser,
      title: finalTitle,
    };

    // we replace the HTML with the SSR information that we are using
    newHTML = newHTML.replace(/\"\$SSR\"/g, JSON.stringify(ssr));

    // and now we need the server app data
    let serverAppData: {
      node: React.ReactNode,
      id: string;
    } = null;

    try {
      // for that we try to initialize, which can indeed, fail
      // mainly because calls to ipstack and whatnot which must
      // be consistent
      serverAppData = await initializeItemizeApp(
        appData.ssrConfig.rendererContext,
        appData.ssrConfig.mainComponent,
        {
          appWrapper: appData.ssrConfig.appWrapper,
          mainWrapper: appData.ssrConfig.mainWrapper,
          serverMode: {
            collector: appData.ssrConfig.collector,
            config: appData.config,
            ssrContext: ssr,
            clientDetails: {
              lang: getCookie(splittedCookies, "lang"),
              currency: getCookie(splittedCookies, "currency"),
              country: getCookie(splittedCookies, "country"),
              guessedData: getCookie(splittedCookies, "guessedData"),
            },
            langLocales: appData.langLocales,
            root: root,
            req: req,
            res: res,
            ipStack: appData.ipStack,
          }
        }
      );

      // if there's no data then it means it was redirected
      if (!serverAppData) {
        // when there's no app data in server mode it means
        // that the answer was handled as a redirect, so we must exit and avoid
        // further processing
        return;
      }
    } catch (e) {
      // if it fails then we can't do SSR and we just provide without SSR
      logger.error(
        "ssrGenerator [SERIOUS]: Failed to run SSR due to failed initialization",
        {
          errStack: e.stack,
          errMessage: e.message,
          appliedRule,
        }
      );
      newHTML = newHTML.replace(/\$SSRAPP/g, "");
      newHTML = newHTML.replace(/\"\$SSR\"/g, "null");
      newHTML = newHTML.replace(/\<SSRHEAD\>\s*\<\/SSRHEAD\>|\<SSRHEAD\/\>|\<SSRHEAD\>/ig, langHrefLangTags);
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(newHTML);
      root.cleanState();
      appData.rootPool.release(root);
      return;
    }

    // now we build the app, but we need to put the static router on top
    // as in server mode no router is used so we need this static router to match
    // with SSR
    const app = (
      <StaticRouter location={req.originalUrl}>
        {serverAppData.node}
      </StaticRouter>
    );

    // we place such HTML
    newHTML = newHTML.replace(/\$SSRAPP/g, ReactDOMServer.renderToStaticMarkup(app));

    // but we need the SSR head which includes our hreflang tags
    let finalSSRHead: string = langHrefLangTags;
    if (serverAppData.id) {
      // and also our collected data
      finalSSRHead += appData.ssrConfig.collector.retrieve(serverAppData.id);
    }
    
    // we add that
    newHTML = newHTML.replace(/\<SSRHEAD\>\s*\<\/SSRHEAD\>|\<SSRHEAD\/\>|\<SSRHEAD\>/ig, finalSSRHead);
  }

  // if we have a valid memory id after all
  if (appliedRule.memId) {
    // we memoize our answer
    MEMOIZED_ANSWERS[appliedRule.memId] = {
      html: newHTML,
      collectionSignature,
    };
  }

  // and finally answer the client
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(newHTML);

  // clean and release, it's done!!!
  root.cleanState();
  appData.rootPool.release(root);
}