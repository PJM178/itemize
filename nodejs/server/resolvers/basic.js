"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const errors_1 = require("../../base/errors");
const ItemDefinition_1 = __importDefault(require("../../base/Root/Module/ItemDefinition"));
const Module_1 = __importDefault(require("../../base/Root/Module"));
const sql_1 = require("../../base/Root/Module/ItemDefinition/sql");
const sql_2 = require("../../base/Root/Module/sql");
const __1 = require("..");
const deep_equal_1 = __importDefault(require("deep-equal"));
const Include_1 = require("../../base/Root/Module/ItemDefinition/Include");
const token_1 = require("../token");
/**
 * Builds the column names expected for a given module only
 * @param requestedFields the requested fields given by graphql fields and flattened
 * @param mod the module in question
 */
function buildColumnNamesForModuleTableOnly(requestedFields, mod) {
    // this will be the ouput
    let result = [];
    // we start by looping into the requested fields
    Object.keys(requestedFields).forEach((key) => {
        // if it's one of the reserved properties, then we can be
        // sure that it's expected in the module table
        if (constants_1.RESERVED_BASE_PROPERTIES[key]) {
            result.push(key);
            // also if it's a prop extension
        }
        else if (mod.hasPropExtensionFor(key)) {
            // we get the property
            const property = mod.getPropExtensionFor(key);
            // just to access the property description
            const propDescription = property.getPropertyDefinitionDescription();
            // now we need to see how it is in sql form and get the instructions
            // of table formation, a string means, use the property name
            // we pass it to the function, to see
            // what it splits on, the function returns an object
            // eg. kitten_SIZE: {type: float, ...} kitten_VALUE
            // so we want only the keys with represent column names
            result = result.concat(Object.keys(propDescription.sql("", key, property)));
        }
    });
    __1.logger.silly("buildColumnNamesForModuleTableOnly: built column names for", {
        requestedFields,
        mod: mod.getQualifiedPathName(),
        result,
    });
    // we return all we have gathered
    return result;
}
exports.buildColumnNamesForModuleTableOnly = buildColumnNamesForModuleTableOnly;
/**
 * Builds the column names expected for a given item definition only
 * ignoring all the extensions and base fields
 * @param requestedFields the requested fields given by graphql fields and flattened
 * @param itemDefinition item definition in question
 * @param prefix a prefix to append to everything
 */
function buildColumnNamesForItemDefinitionTableOnly(requestedFields, itemDefinition, prefix = "") {
    // first we build the result
    let result = [];
    // now we loop into the requested field keys
    Object.keys(requestedFields).forEach((key) => {
        // we want to see which type it is, it might be
        // of type ITEM_
        if (key.startsWith(constants_1.INCLUDE_PREFIX)) {
            // now we have to check with a expected clean name
            // by removing the prefix
            const expectedCleanName = key.replace(constants_1.INCLUDE_PREFIX, "");
            // now we check if it still uses a suffix for exclusion state
            if (expectedCleanName.endsWith(constants_1.EXCLUSION_STATE_SUFFIX)) {
                result.push(prefix + key);
                // otherwise we check if it's an item itself, it should be
            }
            else if (itemDefinition.hasIncludeFor(expectedCleanName)) {
                // we get the item in question
                const include = itemDefinition.getIncludeFor(expectedCleanName);
                // and basically call this function recursively and attach
                // its result, adding the prefix for this item
                result = result.concat(buildColumnNamesForItemDefinitionTableOnly(
                // as you can see only the data of the
                // specific requested fields is passed, it should
                // be an object after all
                requestedFields[key], include.getItemDefinition(), prefix + constants_1.PREFIX_BUILD(key)));
            }
            // now we check for properties, ignoring extensions
        }
        else if (itemDefinition.hasPropertyDefinitionFor(key, false)) {
            // so we get it
            const property = itemDefinition.getPropertyDefinitionFor(key, false);
            // and now we check for a description
            const propDescription = property.getPropertyDefinitionDescription();
            // if we have a simple string, it means it's just the id, but don't forget
            // to prefix that thing
            // basically the same that we did in the module, but also passing
            // the prefix
            result = result.concat(Object.keys(propDescription.sql(prefix, key, property)));
        }
    });
    __1.logger.silly("buildColumnNamesForItemDefinitionTableOnly: built column names for", {
        requestedFields,
        prefix,
        idef: itemDefinition.getQualifiedPathName(),
        result,
    });
    // return that thing
    return result;
}
exports.buildColumnNamesForItemDefinitionTableOnly = buildColumnNamesForItemDefinitionTableOnly;
/**
 * Given a token, it validates and provides the role information
 * for use in the system
 * @param token the token passed via the args
 */
async function validateTokenAndGetData(appData, token) {
    let result;
    if (token === null) {
        result = {
            id: null,
            role: constants_1.GUEST_METAROLE,
            sessionId: null,
        };
    }
    else {
        let throwErr = false;
        try {
            result = await token_1.jwtVerify(token, appData.sensitiveConfig.jwtKey);
            throwErr = (typeof result.id !== "number" ||
                typeof result.role !== "string" ||
                typeof result.sessionId !== "number");
        }
        catch (err) {
            throwErr = true;
        }
        if (throwErr) {
            throw new errors_1.EndpointError({
                message: "Invalid token that didn't pass verification",
                code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
            });
        }
    }
    __1.logger.silly("validateTokenAndGetData: validating token for user succeed", {
        token,
        result,
    });
    return result;
}
exports.validateTokenAndGetData = validateTokenAndGetData;
/**
 * Validates that the parenting rules are respected for the item definition
 * in question that wants to be created
 * @param appData the app data
 * @param parentId the id of the parent item definition
 * @param parentVersion the version of the parent item definition
 * @param parentType the type of the parent item definition
 * @param itemDefinition the item definition that is attempting to child
 * @param userId the user id
 * @param role the role
 */
async function validateParentingRules(appData, parentId, parentVersion, parentType, itemDefinition, userId, role) {
    const isParenting = !!(parentId || parentVersion || parentType);
    if (!isParenting && itemDefinition.mustBeParented()) {
        throw new errors_1.EndpointError({
            message: "A parent is required",
            code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
        });
    }
    else if (isParenting) {
        const parentingItemDefinition = appData.root.registry[parentType];
        if (!(parentingItemDefinition instanceof ItemDefinition_1.default)) {
            throw new errors_1.EndpointError({
                message: "Invalid parent type " + parentType,
                code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
            });
        }
        itemDefinition.checkCanBeParentedBy(parentingItemDefinition, true);
        let result;
        try {
            result = await appData.cache.requestValue(parentingItemDefinition, parentId, parentVersion);
        }
        catch (err) {
            __1.logger.error("validateParentingRules [SERIOUS]: could not retrieve item definition value to validate parenting rules", {
                errStack: err.stack,
                errMessage: err.message,
                parentId,
                parentVersion,
                parentingItemDefinition,
            });
            throw err;
        }
        if (!result) {
            throw new errors_1.EndpointError({
                message: `There's no parent ${parentType} with id ${parentId}`,
                code: constants_1.ENDPOINT_ERRORS.NOT_FOUND,
            });
        }
        else if (result.blocked_at !== null) {
            throw new errors_1.EndpointError({
                message: "The parent is blocked",
                code: constants_1.ENDPOINT_ERRORS.BLOCKED,
            });
        }
        const parentOwnerId = parentingItemDefinition.isOwnerObjectId() ? result.id : result.created_by;
        itemDefinition.checkRoleAccessForParenting(role, userId, parentOwnerId, true);
    }
    __1.logger.silly("validateParentingRules: parenting rules have passed");
}
exports.validateParentingRules = validateParentingRules;
/**
 * Checks if the basic fields are available for the given role, basic
 * fields are of those reserved properties that are in every module
 * @param tokenData the token data that is obtained via the validateTokenAndGetData
 * function
 * @param requestedFields the requested fields
 */
function checkBasicFieldsAreAvailableForRole(itemDefinitionOrModule, tokenData, requestedFields) {
    // now we check if moderation fields have been requested
    const moderationFieldsHaveBeenRequested = constants_1.MODERATION_FIELDS.some((field) => requestedFields[field]);
    // if they have been requested, and our role has no native access to that
    if (moderationFieldsHaveBeenRequested) {
        const rolesThatHaveAccessToModerationFields = itemDefinitionOrModule.getRolesWithModerationAccess();
        const hasAccessToModerationFields = rolesThatHaveAccessToModerationFields.includes(constants_1.ANYONE_METAROLE) ||
            (rolesThatHaveAccessToModerationFields.includes(constants_1.ANYONE_LOGGED_METAROLE) && tokenData.role !== constants_1.GUEST_METAROLE) ||
            rolesThatHaveAccessToModerationFields.includes(tokenData.role);
        if (!hasAccessToModerationFields) {
            __1.logger.silly("checkBasicFieldsAreAvailableForRole: Attempted to access to moderation fields with invalid role", {
                role: tokenData.role,
                rolesThatHaveAccessToModerationFields,
            });
            // we throw an error
            throw new errors_1.EndpointError({
                message: "You have requested to add/edit/view moderation fields with role: " + tokenData.role,
                code: constants_1.ENDPOINT_ERRORS.FORBIDDEN,
            });
        }
    }
    __1.logger.silly("checkBasicFieldsAreAvailableForRole: basic fields access role succeed");
}
exports.checkBasicFieldsAreAvailableForRole = checkBasicFieldsAreAvailableForRole;
/**
 * Checks a list provided by the getter functions that use
 * lists to ensure the request isn't too large
 * @param ids the list ids that have been requested
 */
function checkListLimit(ids) {
    if (ids.length > constants_1.MAX_SEARCH_RESULTS_AT_ONCE_LIMIT) {
        throw new errors_1.EndpointError({
            message: "Too many ids at once, max is " + constants_1.MAX_SEARCH_RESULTS_AT_ONCE_LIMIT,
            code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
        });
    }
    __1.logger.silly("checkListLimit: checking limits succeed");
}
exports.checkListLimit = checkListLimit;
function checkListTypes(ids, mod) {
    ids.forEach((idContainer) => {
        const itemDefinition = mod.getParentRoot().registry[idContainer.type];
        if (!itemDefinition) {
            throw new errors_1.EndpointError({
                message: "Unknown qualified path name for " + idContainer.type,
                code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
            });
        }
        else if (itemDefinition instanceof Module_1.default) {
            throw new errors_1.EndpointError({
                message: "Expected qualified identifier for item definition but got one for module " + idContainer.type,
                code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
            });
        }
        if (itemDefinition.getParentModule() !== mod) {
            throw new errors_1.EndpointError({
                message: "Invalid parent for " + idContainer.type + " expected parent as " + mod.getQualifiedPathName(),
                code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
            });
        }
    });
    __1.logger.silly("checkListLimit: checking list types succeed");
}
exports.checkListTypes = checkListTypes;
/**
 * Checks the language and region given the arguments passed
 * by the graphql resolver
 * @param appData the app data that is currently in context
 * @param args the args themselves being passed to the resolver
 */
function checkLanguage(appData, args) {
    // basically we check the type and if the lenght is right
    if (typeof args.language !== "string" || args.language.length !== 2) {
        throw new errors_1.EndpointError({
            message: "Please use valid non-regionalized language values",
            code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
        });
    }
    // now we check if this is one of the languages we have
    // a dictionary assigned, only languages with a dictionary
    // assigned can be used by the database
    if (!appData.config.dictionaries[args.language]) {
        throw new errors_1.EndpointError({
            message: "This language is not supported, as no dictionary has been set",
            code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
        });
    }
    __1.logger.silly("checkLanguage: checking limits succeed");
}
exports.checkLanguage = checkLanguage;
/**
 * This just extracts the dictionary given the app data
 * and the language of choice
 * @param appData the app data
 * @param args the whole args of the graphql request
 */
function getDictionary(appData, args) {
    const dictionary = appData.config.dictionaries[args.language];
    __1.logger.silly("getDictionary: got dictionary " + dictionary);
    return dictionary;
}
exports.getDictionary = getDictionary;
/**
 * Validates the current token isn't blocked whether it is said so
 * by the rules of the session id, user is removed, or invalid credentials
 * @param cache the appdata cache instance
 * @param tokenData the token data obtained and parsed
 */
async function validateTokenIsntBlocked(cache, tokenData) {
    if (tokenData.id) {
        let sqlResult;
        try {
            sqlResult = await cache.requestValue(["MOD_users__IDEF_user", "MOD_users"], tokenData.id, null);
        }
        catch (err) {
            __1.logger.error("validateTokenIsntBlocked [SERIOUS]: Couldn't validate whether the token is blocked or not", {
                errStack: err.stack,
                errMessage: err.message,
                tokenData,
            });
            throw err;
        }
        if (!sqlResult) {
            throw new errors_1.EndpointError({
                message: "User has been removed",
                code: constants_1.ENDPOINT_ERRORS.USER_REMOVED,
            });
        }
        else if (sqlResult.blocked_at !== null) {
            throw new errors_1.EndpointError({
                message: "User is Blocked",
                code: constants_1.ENDPOINT_ERRORS.USER_BLOCKED,
            });
        }
        else if (sqlResult.session_id !== tokenData.sessionId) {
            throw new errors_1.EndpointError({
                message: "Token has been rendered invalid",
                code: constants_1.ENDPOINT_ERRORS.INVALID_CREDENTIALS,
            });
        }
        else if (sqlResult.role !== tokenData.role) {
            throw new errors_1.EndpointError({
                message: "Token has role mismatch",
                code: constants_1.ENDPOINT_ERRORS.INVALID_CREDENTIALS,
            });
        }
    }
    __1.logger.silly("validateTokenIsntBlocked: token block checking succeed");
}
exports.validateTokenIsntBlocked = validateTokenIsntBlocked;
async function checkUserExists(cache, id) {
    let sqlResult;
    try {
        sqlResult = await cache.requestValue(["MOD_users__IDEF_user", "MOD_users"], id, null);
    }
    catch (err) {
        __1.logger.error("checkUserExists [SERIOUS]: Couldn't check whether the user exists", {
            errStack: err.stack,
            errMessage: err.message,
            userId: id,
        });
        throw err;
    }
    if (!sqlResult) {
        throw new errors_1.EndpointError({
            message: "User has been removed",
            code: constants_1.ENDPOINT_ERRORS.USER_REMOVED,
        });
    }
    __1.logger.silly("checkUserExists: check user exist succeed");
}
exports.checkUserExists = checkUserExists;
/**
 * Filters and prepares a graphql value for output to the rest endpoint
 * given the value that has given by the server, the requested fields
 * that are supposed to be outputted, the role of the current user
 * and the parent module or item definition this value belongs to,
 * the form comes with the DATA and the externalized fields
 * @param value the value gotten from the sql database
 * @param requestedFields the requested fields
 * @param role the role of the user requesting the data
 * @param parentModuleOrIdef the parent module or item definition the value belongs to
 */
function filterAndPrepareGQLValue(value, requestedFields, role, parentModuleOrIdef) {
    // we are going to get the value for the item
    let valueOfTheItem;
    if (parentModuleOrIdef instanceof ItemDefinition_1.default) {
        // we convert the value we were provided, of course, we only need
        // to process what was requested
        valueOfTheItem = sql_1.convertSQLValueToGQLValueForItemDefinition(parentModuleOrIdef, value, requestedFields);
    }
    else {
        // same for modules
        valueOfTheItem = sql_2.convertSQLValueToGQLValueForModule(parentModuleOrIdef, value, requestedFields);
    }
    // we add the object like this, all the non requested data, eg.
    // values inside that should be outside, and outside that will be inside
    // will be stripped
    const actualValue = {
        DATA: valueOfTheItem,
    };
    constants_1.EXTERNALLY_ACCESSIBLE_RESERVED_BASE_PROPERTIES.forEach((property) => {
        if (typeof value[property] !== "undefined") {
            actualValue[property] = value[property];
        }
    });
    const valueToProvide = {
        toReturnToUser: actualValue,
        actualValue,
    };
    if (value.blocked_at !== null) {
        const rolesThatHaveAccessToModerationFields = parentModuleOrIdef.getRolesWithModerationAccess();
        const hasAccessToModerationFields = rolesThatHaveAccessToModerationFields.includes(constants_1.ANYONE_METAROLE) ||
            (rolesThatHaveAccessToModerationFields.includes(constants_1.ANYONE_LOGGED_METAROLE) && role !== constants_1.GUEST_METAROLE) ||
            rolesThatHaveAccessToModerationFields.includes(role);
        if (!hasAccessToModerationFields) {
            valueToProvide.toReturnToUser.DATA = null;
        }
    }
    __1.logger.silly("validateTokenIsntBlocked: prepared the value to provide", valueToProvide);
    return valueToProvide;
}
exports.filterAndPrepareGQLValue = filterAndPrepareGQLValue;
/**
 * Checks that an item definition current state is
 * valid and that the gqlArgValue provided is a match
 * for this item definition current value, remember
 * that in order to set the state to the gqlArgValue
 * you should run itemDefinition.applyValue(gqlArgValue);
 * @param itemDefinition the item definition in question
 * @param gqlArgValue the arg value that was set
 * @param id the stored item id, if available, or null
 * @param version the stored item version if avaliable
 * @param referredInclude this is an optional include used to basically
 * provide better error logging
 */
async function serverSideCheckItemDefinitionAgainst(itemDefinition, gqlArgValue, id, version, referredInclude, referredParentOfInclude) {
    // we get the current value of the item definition instance
    let currentValue;
    try {
        currentValue = await itemDefinition.getState(id, version);
    }
    catch (err) {
        __1.logger.error("serverSideCheckItemDefinitionAgainst [SERIOUS]: Couldn't retrieve item definition state", {
            errStack: err.stack,
            errMessage: err.message,
            id,
            version,
            itemDefinition: itemDefinition.getQualifiedPathName(),
            referredInclude: referredInclude ? referredInclude.getQualifiedIdentifier() : null,
            referredParentOfInclude: referredParentOfInclude ? referredParentOfInclude.getQualifiedPathName() : null,
        });
        throw err;
    }
    __1.logger.silly("serverSideCheckItemDefinitionAgainst: current state value for " + id + " and " + version, currentValue);
    // now we are going to loop over the properties of that value
    currentValue.properties.forEach((propertyValue) => {
        // and we get what is set in the graphql value
        const gqlPropertyValue = gqlArgValue[propertyValue.propertyId];
        // now we check if it has an invalid reason
        if (propertyValue.invalidReason) {
            __1.logger.silly("serverSideCheckItemDefinitionAgainst: failed due to property " + propertyValue.propertyId + " failing", propertyValue);
            // throw an error then
            throw new errors_1.EndpointError({
                message: `validation failed at property ${propertyValue.propertyId} with error ${propertyValue.invalidReason}`,
                code: constants_1.ENDPOINT_ERRORS.INVALID_PROPERTY,
                pcode: propertyValue.invalidReason,
                modulePath: (referredParentOfInclude || itemDefinition).getParentModule().getPath(),
                itemDefPath: (referredParentOfInclude || itemDefinition).getPath(),
                includeId: referredInclude && referredInclude.getId(),
                includeIdItemDefPath: referredParentOfInclude && referredParentOfInclude.getPath(),
                propertyId: propertyValue.propertyId,
            });
            // we also check that the values are matching, but only if they have been
            // defined in the graphql value
        }
        else if (typeof gqlPropertyValue !== "undefined" && !deep_equal_1.default(gqlPropertyValue, propertyValue.value)) {
            __1.logger.silly("serverSideCheckItemDefinitionAgainst: failed due to property " + propertyValue.propertyId + " being unequal", {
                propertyValue,
                gqlPropertyValue,
            });
            throw new errors_1.EndpointError({
                message: `validation failed at property ${propertyValue.propertyId} with a mismatch of calculated value`,
                code: constants_1.ENDPOINT_ERRORS.INVALID_PROPERTY,
                // someone might have been trying to hack for this to happen
                // a null pcode is a red flag, well almost all these checks show tampering
                // this will make the client side give an error nevertheless
                pcode: null,
                modulePath: (referredParentOfInclude || itemDefinition).getParentModule().getPath(),
                itemDefPath: (referredParentOfInclude || itemDefinition).getPath(),
                includeId: referredInclude && referredInclude.getId(),
                includeIdItemDefPath: referredParentOfInclude && referredParentOfInclude.getPath(),
                propertyId: propertyValue.propertyId,
            });
        }
    });
    // we now check the items
    for (const includeValue of currentValue.includes) {
        // now we take the item itself
        const include = itemDefinition.getIncludeFor(includeValue.includeId);
        // the graphql item value
        let gqlIncludeValue = gqlArgValue[include.getQualifiedIdentifier()];
        // if it's undefined we make it null
        if (typeof gqlIncludeValue === "undefined") {
            gqlIncludeValue = null;
        }
        // the graphql exclusion state value
        const gqlExclusionState = gqlArgValue[include.getQualifiedExclusionStateIdentifier()] || null;
        // now we check if the exclusion states match
        if (includeValue.exclusionState !== gqlExclusionState) {
            __1.logger.silly("serverSideCheckItemDefinitionAgainst: failed due to exclusion mismatch", {
                includeValue,
                gqlExclusionState,
            });
            throw new errors_1.EndpointError({
                message: `validation failed at include ${includeValue.includeId} with a mismatch of exclusion state`,
                code: constants_1.ENDPOINT_ERRORS.INVALID_INCLUDE,
                modulePath: (referredParentOfInclude || itemDefinition).getParentModule().getPath(),
                itemDefPath: (referredParentOfInclude || itemDefinition).getPath(),
                includeId: includeValue.includeId,
                includeIdItemDefPath: referredParentOfInclude && referredParentOfInclude.getPath(),
            });
            // and we check if the there's a value set despite it being excluded
        }
        else if (gqlExclusionState === Include_1.IncludeExclusionState.EXCLUDED && gqlIncludeValue !== null) {
            __1.logger.silly("serverSideCheckItemDefinitionAgainst: failed due to value set on include where it was excluded", {
                includeValue,
                gqlExclusionState,
            });
            throw new errors_1.EndpointError({
                message: `validation failed at include ${includeValue.includeId} with an excluded item but data set for it`,
                code: constants_1.ENDPOINT_ERRORS.INVALID_INCLUDE,
                modulePath: (referredParentOfInclude || itemDefinition).getParentModule().getPath(),
                itemDefPath: (referredParentOfInclude || itemDefinition).getPath(),
                includeId: includeValue.includeId,
                includeIdItemDefPath: referredParentOfInclude && referredParentOfInclude.getPath(),
            });
        }
        // now we run a server side check of item definition in the
        // specific item data, that's where we use our referred item
        await serverSideCheckItemDefinitionAgainst(include.getItemDefinition(), gqlIncludeValue, id, version, include, referredParentOfInclude || itemDefinition);
    }
    __1.logger.silly("serverSideCheckItemDefinitionAgainst: succeed checking item definition consistency");
}
exports.serverSideCheckItemDefinitionAgainst = serverSideCheckItemDefinitionAgainst;
/**
 * Users cannot search if they have an active read policy in their roles
 * this function checks and throws an error if there's such a thing
 * @param itemDefinition the item definition to check read policies for
 * @param role the role
 */
function checkReadPoliciesAllowThisUserToSearch(itemDefinition, role) {
    const policiesForThisType = itemDefinition.getPolicyNamesFor("read");
    policiesForThisType.forEach((policyName) => {
        const roles = itemDefinition.getRolesForPolicy("read", policyName);
        if (roles.includes(role) ||
            roles.includes(constants_1.ANYONE_METAROLE) ||
            (roles.includes(constants_1.ANYONE_LOGGED_METAROLE) && role !== constants_1.GUEST_METAROLE)) {
            throw new errors_1.EndpointError({
                message: "Searching with an active read policy is not allowed, the policy in question is " + policyName,
                code: constants_1.ENDPOINT_ERRORS.FORBIDDEN,
            });
        }
    });
    __1.logger.silly("checkReadPoliciesAllowThisUserToSearch: succeed checking policies allow user to search");
}
exports.checkReadPoliciesAllowThisUserToSearch = checkReadPoliciesAllowThisUserToSearch;
/**
 * Splits the arguments in a graphql query from what it comes to be part
 * of the item definition or module in question and what is extra arguments
 * that are used within the query
 * @param moduleOrItemDefinition the module or item definition
 * @param args the arguments to split
 */
function splitArgsInGraphqlQuery(moduleOrItemDefinition, args) {
    const resultingSelfValues = {};
    const resultingExtraArgs = {};
    const propertyIds = (moduleOrItemDefinition instanceof Module_1.default ?
        moduleOrItemDefinition.getAllPropExtensions() :
        moduleOrItemDefinition.getAllPropertyDefinitionsAndExtensions()).map((p) => p.getId());
    const includeIds = (moduleOrItemDefinition instanceof Module_1.default ? [] :
        moduleOrItemDefinition.getAllIncludes()).map((i) => i.getQualifiedIdentifier());
    Object.keys(args).forEach((key) => {
        if (propertyIds.includes(key) || includeIds.includes(key)) {
            resultingSelfValues[key] = args[key];
        }
        else {
            resultingExtraArgs[key] = args[key];
        }
    });
    __1.logger.silly("splitArgsInGraphqlQuery: succeed splitting args for graphql", {
        resultingSelfValues,
        resultingExtraArgs,
    });
    return [resultingSelfValues, resultingExtraArgs];
}
exports.splitArgsInGraphqlQuery = splitArgsInGraphqlQuery;
/**
 * Runs a policy check on the requested information
 * @param arg.policyType the policy type on which the request is made on, edit, delete
 * @param arg.itemDefinition the item definition in question
 * @param arg.id the id of that item definition on the database
 * @param arg.version the version of the item definition on the database
 * @param arg.role the role of the current user
 * @param arg.gqlArgValue the arg value given in the arguments from graphql, where the info should be
 * in qualified path names for the policies
 * @param arg.gqlFlattenedRequestedFiels the flattened request fields that have been requested to read
 * @param arg.cache the cache instance
 * @param arg.preValidation a validation to do, validate if the row doesn't exist here, and anything else necessary
 * the function will crash by Internal server error if no validation is done if the row is null; return
 * a value if you want to force it to return instead without an error
 * @param arg.parentModule the parent module to use in a policy type parent
 * @param arg.parentType the parent type (qualified name and table) to use in a policy type parent
 * @param arg.parentId the parent id to use in a policy type parent
 * @param arg.parentPrevalidation a pre validation to run
 */
async function runPolicyCheck(arg) {
    __1.logger.silly("runPolicyCheck: Executed policy check for item definition", arg);
    // so now we get the information we need first
    const mod = arg.itemDefinition.getParentModule();
    let selectQueryValue = null;
    let parentSelectQueryValue = null;
    if (arg.policyTypes.includes("read") || arg.policyTypes.includes("delete") || arg.policyTypes.includes("edit")) {
        try {
            selectQueryValue = await arg.cache.requestValue(arg.itemDefinition, arg.id, arg.version);
        }
        catch (err) {
            __1.logger.error("runPolicyCheck [SERIOUS]: could not run policy checks due to cache/database fail", {
                id: arg.id,
                version: arg.version,
                itemDefinition: arg.itemDefinition,
            });
            throw err;
        }
    }
    if (arg.policyTypes.includes("parent")) {
        try {
            parentSelectQueryValue = await arg.cache.requestValue([arg.parentType, arg.parentModule], arg.parentId, arg.parentVersion);
        }
        catch (err) {
            __1.logger.error("runPolicyCheck [SERIOUS]: could not run policy checks due to cache/database fail on parent rule", {
                parentVersion: arg.parentVersion,
                parentId: arg.parentId,
                parentType: arg.parentType,
                parentModule: arg.parentModule
            });
            throw err;
        }
    }
    if (arg.preValidation) {
        const forcedResult = arg.preValidation(selectQueryValue);
        if (typeof forcedResult !== "undefined") {
            return forcedResult;
        }
    }
    if (arg.preParentValidation) {
        const forcedResult2 = arg.preParentValidation(parentSelectQueryValue);
        if (typeof forcedResult2 !== "undefined") {
            return forcedResult2;
        }
    }
    for (const policyType of arg.policyTypes) {
        // let's get all the policies that we have for this policy type group
        const policiesForThisType = arg.itemDefinition.getPolicyNamesFor(policyType);
        // so we loop in these policies
        for (const policyName of policiesForThisType) {
            __1.logger.silly("runPolicyCheck: Found policy", {
                policyName,
            });
            // and we get the roles that need to apply to this policy
            const rolesForThisSpecificPolicy = arg.itemDefinition.getRolesForPolicy(policyType, policyName);
            // if this is not our user, we can just continue with the next
            if (!rolesForThisSpecificPolicy.includes(arg.role)) {
                __1.logger.silly("ignoring policy the role does not require it", {
                    policyName,
                    role: arg.role,
                    rolesForThisSpecificPolicy,
                });
                continue;
            }
            const gqlCheckingElement = policyType === "read" ? arg.gqlFlattenedRequestedFiels : arg.gqlArgValue;
            if (policyType !== "delete" && policyType !== "parent") {
                const applyingPropertyIds = arg.itemDefinition.getApplyingPropertyIdsForPolicy(policyType, policyName);
                const applyingPropertyOnlyAppliesWhenCurrentIsNonNull = arg.itemDefinition.doesApplyingPropertyOnlyAppliesWhenCurrentIsNonNull(policyType, policyName);
                let someIncludeOrPropertyIsApplied = false;
                if (applyingPropertyIds) {
                    someIncludeOrPropertyIsApplied =
                        applyingPropertyIds.some((applyingPropertyId) => {
                            const isDefinedInReadOrEdit = typeof gqlCheckingElement[applyingPropertyId] !== "undefined";
                            const isCurrentlyNull = selectQueryValue[applyingPropertyId] === null;
                            if (applyingPropertyOnlyAppliesWhenCurrentIsNonNull && isCurrentlyNull) {
                                return false;
                            }
                            return isDefinedInReadOrEdit;
                        });
                }
                if (!someIncludeOrPropertyIsApplied) {
                    const applyingIncludeIds = arg.itemDefinition.getApplyingIncludeIdsForPolicy(policyType, policyName);
                    if (applyingIncludeIds) {
                        someIncludeOrPropertyIsApplied =
                            applyingIncludeIds.some((applyingIncludeId) => {
                                const include = arg.itemDefinition.getIncludeFor(applyingIncludeId);
                                return (typeof gqlCheckingElement[include.getQualifiedIdentifier()] !== "undefined" ||
                                    typeof gqlCheckingElement[include.getQualifiedExclusionStateIdentifier()] !== "undefined");
                            });
                    }
                }
                if (!someIncludeOrPropertyIsApplied) {
                    __1.logger.silly("runPolicyCheck: ignoring policy as there was no match for applying property or include", {
                        policyName,
                        applyingPropertyIds,
                    });
                    continue;
                }
            }
            // otherwise we need to see which properties are in consideration for this
            // policy
            const propertiesInContext = arg.itemDefinition.getPropertiesForPolicy(policyType, policyName);
            // we loop through those properties
            for (const property of propertiesInContext) {
                __1.logger.silly("runPolicyCheck: found property in policy", {
                    propertyId: property.getId(),
                });
                // now we need the qualified policy identifier, that's where in the args
                // the value for this policy is stored
                const qualifiedPolicyIdentifier = property.getQualifiedPolicyIdentifier(policyType, policyName);
                // and like that we get the value that has been set for that policy
                let policyValueForTheProperty = arg.gqlArgValue[qualifiedPolicyIdentifier];
                // if it's undefined, we set it to null
                if (typeof policyValueForTheProperty === "undefined") {
                    policyValueForTheProperty = null;
                }
                __1.logger.silly("runPolicyCheck: Property qualified policy identifier found and value is set", {
                    qualifiedPolicyIdentifier,
                    policyValueForTheProperty,
                });
                // now we check if it's a valid value, the value we have given, for the given property
                // this is a shallow check but works
                let invalidReason;
                try {
                    invalidReason = await property.isValidValue(arg.id, arg.version, policyValueForTheProperty);
                }
                catch (err) {
                    __1.logger.error("runPolicyCheck [SERIOUS]: couldn't check if the value is valid", {
                        id: arg.id,
                        version: arg.version,
                        policyValueForTheProperty,
                    });
                    throw err;
                }
                // if we get an invalid reason, the policy cannot even pass there
                if (invalidReason) {
                    __1.logger.silly("runPolicyCheck: Failed for not passing property validation", {
                        invalidReason,
                    });
                    throw new errors_1.EndpointError({
                        message: `validation failed for ${qualifiedPolicyIdentifier} with reason ${invalidReason}`,
                        code: constants_1.ENDPOINT_ERRORS.INVALID_POLICY,
                        modulePath: mod.getPath(),
                        itemDefPath: arg.itemDefinition.getPath(),
                        policyType,
                        policyName,
                    });
                }
                // otherwise we create a selection meta column, for our policy using the sql equal
                // which will create a column field with the policy name that is going to be
                // equal to that value, eg. "name" = 'policyValueForProperty' AS "MY_POLICY"
                // because policies are uppercase this avoids collisions with properties
                const policyMatches = property.getPropertyDefinitionDescription().sqlLocalEqual(policyValueForTheProperty, "", property.getId(), policyType === "parent" ? parentSelectQueryValue : selectQueryValue);
                if (!policyMatches) {
                    __1.logger.silly("runPolicyCheck: Failed due to policy not pasing", {
                        policyName,
                    });
                    throw new errors_1.EndpointError({
                        message: `validation failed for policy ${policyName}`,
                        code: constants_1.ENDPOINT_ERRORS.INVALID_POLICY,
                        modulePath: mod.getPath(),
                        itemDefPath: arg.itemDefinition.getPath(),
                        policyType,
                        policyName,
                    });
                }
            }
        }
    }
    __1.logger.silly("runPolicyCheck: Completed checking policies");
    return selectQueryValue;
}
exports.runPolicyCheck = runPolicyCheck;
