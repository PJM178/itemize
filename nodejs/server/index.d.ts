/// <reference types="react" />
import express from "express";
import Root, { ILangLocalesType } from "../base/Root";
import { IGQLQueryFieldsDefinitionType } from "../base/Root/gql";
import Knex from "knex";
import { Listener } from "./listener";
import { RedisClient } from "redis";
import { Cache } from "./cache";
import { ICustomTokensType } from "./custom-graphql";
import { IConfigRawJSONDataType, ISensitiveConfigRawJSONDataType } from "../config";
import { ITriggerRegistry } from "./resolvers/triggers";
import { IPStack } from "./services/ipstack";
import Mailgun from "mailgun-js";
import { Here } from "./services/here";
import winston from "winston";
import "winston-daily-rotate-file";
import { ISSRRuleSet } from "./ssr";
import { IRendererContext } from "../client/providers/renderer";
import { ILocaleContextType } from "../client/internal/providers/locale-provider";
import { ICollectorType } from "../client";
import { Pool } from "tarn";
import { ISEORuleSet } from "./seo";
import { ICloudClients } from "./cloud";
import { MailService } from "./mail";
export declare const logger: winston.Logger;
export declare const app: import("express-serve-static-core").Express;
/**
 * Specifies the SSR configuration for the multiple pages
 */
export interface ISSRConfig {
    ssrRules: ISSRRuleSet;
    rendererContext: IRendererContext;
    mainComponent: React.ReactElement;
    appWrapper?: (app: React.ReactElement, config: IConfigRawJSONDataType) => React.ReactElement;
    mainWrapper?: (mainComponet: React.ReactElement, config: IConfigRawJSONDataType, localeContext: ILocaleContextType) => React.ReactElement;
    collector?: ICollectorType;
}
export interface ISEOConfig {
    seoRules: ISEORuleSet;
}
export interface IAppDataType {
    root: Root;
    rootPool: Pool<Root>;
    langLocales: ILangLocalesType;
    ssrConfig: ISSRConfig;
    seoConfig: ISEOConfig;
    indexDevelopment: string;
    indexProduction: string;
    config: IConfigRawJSONDataType;
    sensitiveConfig: ISensitiveConfigRawJSONDataType;
    knex: Knex;
    listener: Listener;
    cache: Cache;
    redis: RedisClient;
    redisGlobal: RedisClient;
    redisPub: RedisClient;
    redisSub: RedisClient;
    redisLocalPub: RedisClient;
    redisLocalSub: RedisClient;
    buildnumber: string;
    triggers: ITriggerRegistry;
    ipStack: IPStack;
    here: Here;
    mailgun: Mailgun.Mailgun;
    cloudClients: ICloudClients;
    customUserTokenQuery: any;
    logger: winston.Logger;
    mailService: MailService;
}
export interface IServerDataType {
    CURRENCY_FACTORS: {
        [usdto: string]: number;
    };
}
export interface IServerCustomizationDataType {
    customGQLQueries?: (appData: IAppDataType) => IGQLQueryFieldsDefinitionType;
    customTokenGQLQueries?: ICustomTokensType;
    customGQLMutations?: (appData: IAppDataType) => IGQLQueryFieldsDefinitionType;
    customRouterEndpoint?: string;
    customRouter?: (appData: IAppDataType) => express.Router;
    customTriggers?: ITriggerRegistry;
}
export declare function getCloudClients(config: IConfigRawJSONDataType, sensitiveConfig: ISensitiveConfigRawJSONDataType): Promise<ICloudClients>;
/**
 * Initializes the itemize server with its custom configuration
 * @param ssrConfig the server side rendering rules
 * @param custom the customization details
 * @param custom.customGQLQueries custom graphql queries
 * @param custom.customTokenGQLQueries custom token graphql queries for generating custom tokens
 * while customGQLQueries can be used for the same purpose, this makes it easier and compliant
 * @param custom.customGQLMutations custom graphql mutations
 * @param custom.customRouterEndpoint an endpoint to add a custom router, otherwise it gets
 * attached to the root
 * @param custom.customRouter a custom router to attach to the rest endpoint
 * @param custom.customTriggers a registry for custom triggers
 */
export declare function initializeServer(ssrConfig: ISSRConfig, seoConfig: ISEOConfig, custom?: IServerCustomizationDataType): Promise<void>;
