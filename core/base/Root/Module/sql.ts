import { RESERVED_BASE_PROPERTIES_SQL, RESERVED_BASE_PROPERTIES } from "../../../constants";
import Module from ".";
import {
  getSQLTableDefinitionForProperty,
  convertGQLValueToSQLValueForProperty,
  convertSQLValueToGQLValueForProperty,
  buildSQLQueryForProperty,
} from "./ItemDefinition/PropertyDefinition/sql";
import { getSQLTablesSchemaForItemDefinition } from "./ItemDefinition/sql";
import { ISQLTableDefinitionType, ISQLSchemaDefinitionType, ISQLTableRowValue } from "../sql";
import { IGQLValue } from "../gql";
import Knex from "knex";

/**
 * Provides the table that is necesary to include this module and all
 * its children child definitions into it
 * @param mod the module in question
 */
export function getSQLTableDefinitionForModule(mod: Module): ISQLTableDefinitionType {
  // add all the standard fields
  let resultTableSchema: ISQLTableDefinitionType = {
    ...RESERVED_BASE_PROPERTIES_SQL,
  };

  // now we loop thru every property (they will all become columns)
  mod.getAllPropExtensions().forEach((pd) => {
    resultTableSchema = {
      ...resultTableSchema,
      ...getSQLTableDefinitionForProperty(pd),
    };
  });

  return resultTableSchema;
}

/**
 * Provides the SQL table schemas that are contained
 * within this module, you expect one schema per item definition
 * it contains
 * @param mod the module in question
 */
export function getSQLTablesSchemaForModule(mod: Module): ISQLSchemaDefinitionType {
  // this is where it will be contained
  let resultSchema = {
    [mod.getQualifiedPathName()]: getSQLTableDefinitionForModule(mod),
  };
  mod.getAllModules().forEach((cModule) => {
    // first with child modules
    resultSchema = { ...resultSchema, ...getSQLTablesSchemaForModule(cModule) };
  });
  // then with child item definitions
  mod.getAllChildItemDefinitions().forEach((cIdef) => {
    resultSchema = { ...resultSchema, ...getSQLTablesSchemaForItemDefinition(cIdef) };
  });
  return resultSchema;
}

/**
 * Converts a graphql value, with all its items and everything it
 * has into a SQL row data value for this specific module
 * @param mod the module in question
 * @param data the graphql data
 * @param knex the knex instance
 * @param partialFields fields to make a partial value rather than a total
 * value, note that we don't recommend using partial fields in order to create
 * because some properties might treat nulls in a fancy way, when creating
 * all the table rows should be set, only when updating you should use
 * partial fields; for example, if you have a field that has a property
 * that is nullable but it's forced into some value it will be ignored
 * in a partial field value, don't use partial fields to create
 */
export function convertGQLValueToSQLValueForModule(
  mod: Module,
  data: IGQLValue,
  knex: Knex,
  dictionary: string,
  partialFields?: any,
): ISQLTableRowValue {
  // first we create the row value
  let result: ISQLTableRowValue = {};

  // now we get all the property extensions
  mod.getAllPropExtensions().forEach((pd) => {
    // we only add if partialFields allows it, or we don't have
    // partialFields set
    if (
      (partialFields && partialFields[pd.getId()]) ||
      !partialFields
    ) {
      result = { ...result, ...convertGQLValueToSQLValueForProperty(pd, data, knex, dictionary, "") };
    }
  });

  return result;
}

/**
 * Converts a SQL value directly coming from the database as it is
 * to a graphql value for this specific module, this
 * only includes prop extensions and standard properties
 * and excludes everything else
 * @param mod the module in question
 * @param row the row value, with all the columns it has; the row
 * can be overblown with other field data, this will extract only the
 * data required for this module
 * @param graphqlFields contains the only properties that are required
 * in the request provided by grapql fields,
 * eg {id: {}, name: {}}
 */
export function convertSQLValueToGQLValueForModule(mod: Module, row: ISQLTableRowValue, graphqlFields: any): IGQLValue {
  // first we create the graphql result
  let result: IGQLValue = {};

  // now we take all the base properties that we have
  // in the graphql model
  Object.keys(RESERVED_BASE_PROPERTIES).forEach((basePropertyKey) => {
    result[basePropertyKey] = row[basePropertyKey] || null;
  });

  // we also take all the property definitions we have
  // in this item definitions, and convert them one by one
  // with the row data, this basically also gives graphql value
  // in the key:value format
  mod.getParentModule().getAllPropExtensions().filter(
    (property) => graphqlFields[property.getId()],
  ).forEach((pd) => {
    result = { ...result, ...convertSQLValueToGQLValueForProperty(pd, row) };
  });

  return result;
}

/**
 * Builds a sql query specific for this module to search
 * within itself in the database
 * @param mod the module in question
 * @param data the data for the query from graphql
 * @param knexBuilder the knex builder
 */
export function buildSQLQueryForModule(mod: Module, data: IGQLValue, knexBuilder: any, dictionary: string) {
  mod.getAllPropExtensions().forEach((pd) => {
    if (!pd.isSearchable()) {
      return;
    }

    buildSQLQueryForProperty(pd, data, "", knexBuilder, dictionary);
  });
}
