import { IAppDataType } from "../../";
import ItemDefinition, { ItemDefinitionIOActions } from "../../../base/Root/Module/ItemDefinition";
import { IGraphQLIdefResolverArgs, FGraphQLIdefResolverType } from "../../../base/Root/gql";
import Debug from "debug";
import {
  checkLanguageAndRegion,
  validateTokenAndGetData,
  checkBasicFieldsAreAvailableForRole,
  mustBeLoggedIn,
  flattenFieldsFromRequestedFields,
  runPolicyCheck,
  validateTokenIsntBlocked,
} from "../basic";
import graphqlFields = require("graphql-fields");
import { GraphQLEndpointError } from "../../../base/errors";
import { ROLES_THAT_HAVE_ACCESS_TO_MODERATION_FIELDS } from "../../../constants";

const debug = Debug("resolvers:deleteItemDefinition");
export async function deleteItemDefinition(
  appData: IAppDataType,
  resolverArgs: IGraphQLIdefResolverArgs,
  itemDefinition: ItemDefinition,
): Promise<any> {
  debug("EXECUTED for %s", itemDefinition.getQualifiedPathName());

  // do the basic things, check the language and region
  // and get the token data
  checkLanguageAndRegion(appData, resolverArgs.args);
  const tokenData = await validateTokenAndGetData(appData, resolverArgs.args.token);

  // for deleting we must be logged in
  mustBeLoggedIn(tokenData);
  validateTokenIsntBlocked(appData.knex, tokenData);

  // we flatten and get the requested fields
  const requestedFields = flattenFieldsFromRequestedFields(graphqlFields(resolverArgs.info));
  checkBasicFieldsAreAvailableForRole(tokenData, requestedFields);

  // now we get this basic information
  const mod = itemDefinition.getParentModule();
  const moduleTable = mod.getQualifiedPathName();
  const selfTable = itemDefinition.getQualifiedPathName();

  debug("Checking access to the element to delete");

  // we need to run the policy check for delete,
  // because there might be extra rules for data request
  // for doing a delete, for example, requesting a password
  // confirmation for deleting users, we also need to
  // gather the created_by and blocked_at to check the rights
  // of the user
  let userId: number;
  await runPolicyCheck(
    "delete",
    itemDefinition,
    resolverArgs.args.id,
    tokenData.role,
    resolverArgs.args,
    appData.knex,
    ["created_by", "blocked_at"],

    // this functions runs before the policy has been checked
    // and we do it for being efficient, because we can run
    // both of these checks with a single SQL query, and the policy
    // checker is built in a way that it demands and expects that
    (contentData: any) => {
      // so now we get the content information, which might
      // be null if nothing was found, so we check too
      userId = contentData && contentData.created_by;

      // if there is no userId then the row was null, we throw an error
      if (!userId) {
        debug("FAILED due to lack of content data");
        throw new GraphQLEndpointError({
          message: `There's no ${selfTable} with id ${resolverArgs.args.id}`,
          code: "NOT_FOUND",
        });
      }

      // if the content is blocked, and our role has no special access
      // to moderation fields, then this content cannot be removed
      // from the website, no matter what
      if (
        contentData.blocked_at !== null &&
        !ROLES_THAT_HAVE_ACCESS_TO_MODERATION_FIELDS.includes(tokenData.role)
      ) {
        debug("FAILED due to blocked content and no moderation access for role %s", tokenData.role);
        throw new GraphQLEndpointError({
          message: "The item is blocked, only users with role " +
          ROLES_THAT_HAVE_ACCESS_TO_MODERATION_FIELDS.join(",") + " can wipe this data",
          code: "BLOCKED",
        });
      }
    },
  );

  // yet now we check the role access, for the action of delete
  // note how we don't pass requested fields, because that's irrelevant
  // for the delete action
  debug("Checking role access for delete");
  itemDefinition.checkRoleAccessFor(
    ItemDefinitionIOActions.DELETE,
    tokenData.role,
    tokenData.id,
    userId,
    null,
    true,
  );

  // we run this, not even required to do it as a transaction
  // because the index in the item definition cascades
  await appData.knex(moduleTable).delete().where({
    id: resolverArgs.args.id,
    type: selfTable,
  });

  debug("SUCCEED");

  // return null, yep, the output is always null, because it's gone
  // however we are not running the check on the fields that can be read
  // but anyway there's no usable data, so why would we need a check
  return null;
}

export function deleteItemDefinitionFn(appData: IAppDataType): FGraphQLIdefResolverType {
  return deleteItemDefinition.bind(null, appData);
}
