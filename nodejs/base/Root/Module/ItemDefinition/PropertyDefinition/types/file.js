"use strict";
/**
 * Contains the single file type description
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../sql");
const constants_1 = require("../../../../../../constants");
const local_sql_1 = require("../local-sql");
/**
 * The type value represents the behaviour of files in the app
 */
const typeValue = {
    gql: "PROPERTY_TYPE__File",
    gqlFields: {},
    gqlAddFileToFields: true,
    gqlList: false,
    searchable: false,
    specialProperties: [
        {
            name: "accept",
            type: "string",
        },
        {
            name: "imageUploader",
            type: "boolean",
        },
        {
            name: "dimensions",
            type: "string",
        },
        {
            name: "smallDimension",
            type: "string",
        },
        {
            name: "mediumDimension",
            type: "string",
        },
        {
            name: "largeDimension",
            type: "string",
        },
    ],
    sql: sql_1.getStandardSQLFnFor && sql_1.getStandardSQLFnFor("text"),
    sqlIn: sql_1.stardardSQLInWithJSONStringifyFn,
    sqlOut: sql_1.standardSQLOutWithJSONParseFn,
    sqlSearch: () => {
        throw new Error("Attempted to search within a file");
    },
    sqlStrSearch: null,
    localStrSearch: null,
    sqlOrderBy: null,
    localOrderBy: null,
    localSearch: () => {
        throw new Error("Attempted to search within a file locally");
    },
    sqlEqual: () => {
        throw new Error("Attempted to equal within a file");
    },
    sqlSSCacheEqual: () => {
        throw new Error("Attempted to local equal within a file");
    },
    sqlBtreeIndexable: () => {
        throw new Error("Attempted to btree index a file, this might mean a file value is in request limiters, don't do that");
    },
    sqlMantenience: null,
    localEqual: local_sql_1.standardLocalEqual,
    i18n: {
        base: constants_1.CLASSIC_BASE_I18N,
        optional: constants_1.CLASSIC_OPTIONAL_I18N,
        tooLargeErrorInclude: true,
    },
};
exports.default = typeValue;
