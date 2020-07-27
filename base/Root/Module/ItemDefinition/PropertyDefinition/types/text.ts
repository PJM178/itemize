/**
 * Contains the text type description
 *
 * @packageDocumentation
 */

import {
  IPropertyDefinitionSupportedType,
} from "../types";
import { GraphQLString } from "graphql";
import { standardSQLOutFn, standardSQLEqualFn } from "../sql";
import {
  standardSQLSSCacheEqualFn, standardLocalEqual,
} from "../local-sql";
import { PropertyInvalidReason } from "../../PropertyDefinition";
import {
  MAX_RAW_TEXT_LENGTH,
  CLASSIC_BASE_I18N,
  CLASSIC_OPTIONAL_I18N,
  CLASSIC_SEARCH_BASE_I18N,
  CLASSIC_SEARCH_OPTIONAL_I18N,
  INCLUDE_PREFIX,
} from "../../../../../../constants";
import { PropertyDefinitionSearchInterfacesPrefixes, PropertyDefinitionSearchInterfacesType } from "../search-interfaces";
import { textSQL, textSQLIn, textSQLSearch, textSQLStrSearch, textSQLBtreeIndexable, textSQLOrderBy } from "../sql/text";

/**
 * The text is described by a string
 */
export type PropertyDefinitionSupportedTextType = string;

/**
 * The type describes how the text type behaves in the app, this includes rich text
 */
const typeValue: IPropertyDefinitionSupportedType = {
  gql: GraphQLString,
  nullableDefault: "",
  supportedSubtypes: ["html", "plain"],
  specialProperties: [
    {
      name: "mediaProperty",
      type: "string",
    },
    {
      name: "supportsVideos",
      type: "boolean",
    },
    {
      name: "supportsImages",
      type: "boolean",
    },
    {
      name: "supportsFiles",
      type: "boolean",
    },
  ],
  sql: textSQL,
  sqlIn: textSQLIn,
  sqlOut: standardSQLOutFn,
  sqlSearch: textSQLSearch,
  sqlStrSearch: textSQLStrSearch,
  sqlBtreeIndexable: textSQLBtreeIndexable,
  sqlMantenience: null,
  localSearch: (arg) => {
    // item is deleted
    if (!arg.gqlValue) {
      return false;
    }
    // item is blocked
    if (arg.gqlValue.DATA === null) {
      return false;
    }

    const searchName = PropertyDefinitionSearchInterfacesPrefixes.SEARCH + arg.id;
    const usefulArgs = arg.include ? arg.args[INCLUDE_PREFIX + arg.include.getId()] || {} : arg.args;

    if (typeof usefulArgs[searchName] !== "undefined" && usefulArgs[searchName] !== null) {
      const searchMatch = usefulArgs[searchName];
      const propertyValue = arg.include ? arg.gqlValue.DATA[arg.include.getId()][arg.id] : arg.gqlValue.DATA[arg.id];

      if (propertyValue === null) {
        return false;
      }

      // this is the FTS in the client side, it's not good, it's not meant
      // to be good, but it gets the job done
      return propertyValue.includes(searchMatch);
    }

    return true;
  },
  localStrSearch: (arg) => {
    // item is deleted
    if (!arg.gqlValue) {
      return false;
    }
    // item is blocked
    if (arg.gqlValue.DATA === null) {
      return false;
    }

    if (arg.search) {
      const propertyValue = arg.include ? arg.gqlValue.DATA[arg.include.getId()][arg.id] : arg.gqlValue.DATA[arg.id];

      // this is the simple FTS that you get in the client
      return propertyValue.includes(arg.search);
    }

    return true;
  },
  sqlEqual: standardSQLEqualFn,
  sqlSSCacheEqual: standardSQLSSCacheEqualFn,
  localEqual: standardLocalEqual,
  sqlOrderBy: textSQLOrderBy,
  localOrderBy: () => {
    // can't sort due to ranking limitations
    return 0;
  },

  // validates the text, texts don't support json value
  validate: (s: PropertyDefinitionSupportedTextType, subtype?: string) => {
    if (typeof s !== "string") {
      return PropertyInvalidReason.INVALID_VALUE;

    // NOTE how the html text lengh is not checked, even when it is possible
    // this is a raw check for the total character count otherwise we could get spammed
    // with empty tags, should be large enough not to bother
    } else if (s.length > MAX_RAW_TEXT_LENGTH) {
      return PropertyInvalidReason.TOO_LARGE;
    }

    return null;
  },
  // the max length for the text
  // whether it is searchable or not
  searchable: true,
  searchInterface: PropertyDefinitionSearchInterfacesType.TEXT,
  allowsMinMaxLengthDefined: true,
  // i18n attributes
  i18n: {
    base: CLASSIC_BASE_I18N,
    optional: CLASSIC_OPTIONAL_I18N,
    searchBase: CLASSIC_SEARCH_BASE_I18N,
    searchOptional: CLASSIC_SEARCH_OPTIONAL_I18N,
    tooLargeErrorInclude: true,
  },
};
export default typeValue;
