/**
 * Contains the integer type description
 *
 * @packageDocumentation
 */

import { IPropertyDefinitionSupportedType } from "../types";
import { GraphQLInt } from "graphql";
import {
  stardardSQLInFn,
  standardSQLOutFn,
  standardSQLSearchFnExactAndRange,
  standardSQLEqualFn,
  getStandardSQLFnFor,
  standardSQLBtreeIndexable,
  standardSQLOrderBy,
} from "../sql";
import {
  standardSQLSSCacheEqualFn, standardLocalEqual,
} from "../local-sql";
import { PropertyInvalidReason } from "../../PropertyDefinition";
import {
  MAX_SUPPORTED_INTEGER,
  MIN_SUPPORTED_INTEGER,
  CLASSIC_BASE_I18N, CLASSIC_OPTIONAL_I18N,
  CLASSIC_SEARCH_BASE_I18N,
  CLASSIC_SEARCH_OPTIONAL_I18N,
  CLASSIC_SEARCH_RANGED_I18N,
  CLASSIC_SEARCH_RANGED_OPTIONAL_I18N,
} from "../../../../../../constants";
import { PropertyDefinitionSearchInterfacesType } from "../search-interfaces";
import { standardLocalSearchExactAndRange } from "../local-search";

/**
 * The integer is descibred by a number
 */
export type PropertyDefinitionSupportedIntegerType = number;

/**
 * The type defines the behaviour of integers in the app
 */
const typeValue: IPropertyDefinitionSupportedType = {
  // an integer is represented as a number
  json: "number",
  supportedSubtypes: ["reference"],
  gql: GraphQLInt,
  sql: getStandardSQLFnFor && getStandardSQLFnFor("integer"),
  sqlIn: stardardSQLInFn,
  sqlOut: standardSQLOutFn,
  sqlSearch: standardSQLSearchFnExactAndRange,
  sqlEqual: standardSQLEqualFn,
  sqlSSCacheEqual: standardSQLSSCacheEqualFn,
  localEqual: standardLocalEqual,
  sqlBtreeIndexable: standardSQLBtreeIndexable,
  sqlMantenience: null,
  sqlStrSearch: null,
  localStrSearch: null,
  sqlOrderBy: standardSQLOrderBy,
  localOrderBy: (arg) => {
    if (arg.a === null && arg.b === null) {
      return 0;
    } else if (arg.a === null) {
      return arg.nulls === "last" ? 1 : -1;
    } else if (arg.b === null) {
      return arg.nulls === "last" ? -1 : 1;
    }
    if (arg.direction === "desc") {
      return arg.b as number - (arg.a as number);
    }
    return arg.a as number - (arg.b as number);
  },

  localSearch: standardLocalSearchExactAndRange,

  // it gotta be validated to check it's a number
  validate: (n: PropertyDefinitionSupportedIntegerType, subtype: string) => {
    if (isNaN(n) || !Number.isInteger(n)) {
      return PropertyInvalidReason.INVALID_VALUE;
    } else if (n > MAX_SUPPORTED_INTEGER) {
      return PropertyInvalidReason.TOO_LARGE;
    } else if (
      n < MIN_SUPPORTED_INTEGER ||
      (
        subtype === "reference" &&
        n <= 0
      )
    ) {
      return PropertyInvalidReason.TOO_SMALL;
    }

    return null;
  },
  // it is searchable by exact and range value
  searchable: true,
  searchInterface: PropertyDefinitionSearchInterfacesType.EXACT_AND_RANGE,
  allowsMinMaxDefined: true,
  // i18n attributes
  i18n: {
    base: CLASSIC_BASE_I18N,
    optional: CLASSIC_OPTIONAL_I18N,
    searchBase: CLASSIC_SEARCH_BASE_I18N,
    searchOptional: CLASSIC_SEARCH_OPTIONAL_I18N,
    searchRange: CLASSIC_SEARCH_RANGED_I18N,
    searchRangeOptional: CLASSIC_SEARCH_RANGED_OPTIONAL_I18N,
    tooSmallErrorInclude: [null],
    tooLargeErrorInclude: [null],
  },
  specialProperties: [
    {
      name: "referencedModule",
      type: "string",
      required: ["reference"],
    },
    {
      name: "referencedItemDefinition",
      type: "string",
      required: ["reference"],
    },
    {
      name: "referencedSearchProperty",
      type: "string",
      required: ["reference"],
    },
    {
      name: "referencedDisplayProperty",
      type: "string",
      required: ["reference"],
    },
    {
      name: "referencedFilteringPropertySet",
      type: "property-set",
    },
    {
      name: "referencedFilterByLanguage",
      type: "boolean",
    },
    {
      name: "referencedFilterByCreatedBySelf",
      type: "boolean",
    },
  ],
};
export default typeValue;
