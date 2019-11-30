import Item, { IItemRawJSONDataType, IItemValue, ItemExclusionState } from "./Item";
import PropertyDefinition,
  { IPropertyDefinitionRawJSONDataType, IPropertyDefinitionValue } from "./PropertyDefinition";
import Module, { IModuleRawJSONDataType, ListenerType, IRawJSONI18NDataType } from "..";
import {
  PREFIXED_CONCAT,
  ITEM_DEFINITION_PREFIX,
  ITEM_PREFIX,
  ANYONE_METAROLE,
  SELF_METAROLE,
} from "../../../../constants";
import { GraphQLOutputType, GraphQLObjectType } from "graphql";
import { GraphQLEndpointError } from "../../../errors";

export interface IPolicyValueRawJSONDataType {
  roles: string[];
  properties: string[];
}

export interface IPolicyRawJSONDataType {
  [policyName: string]: IPolicyValueRawJSONDataType;
}

export interface IPoliciesRawJSONDataType {
  edit?: IPolicyRawJSONDataType;
  delete?: IPolicyRawJSONDataType;
}

export interface IItemDefinitionRawJSONDataType {
  // Builder data
  type: "item";

  // Avaialble for the builder
  location?: string;
  i18nDataLocation?: string;
  pointers?: any;
  raw?: string;

  // Avilable after a build
  name: string;
  i18nData: IRawJSONI18NDataType;

  // original data
  includes?: IItemRawJSONDataType[];
  properties?: IPropertyDefinitionRawJSONDataType[];
  // role permissions
  readRoleAccess?: string[];
  createRoleAccess?: string[];
  editRoleAccess?: string[];
  deleteRoleAccess?: string[];

  // roperty gets added during procesing and merging
  // replacing imports, gotta be there even if empty
  importedChildDefinitions?: string[][];
  childDefinitions?: IItemDefinitionRawJSONDataType[];

  // policies
  policies?: IPoliciesRawJSONDataType;
}

export interface IItemDefinitionValue {
  moduleName: string;
  itemDefPath: string[];
  itemDefName: string;
  items: IItemValue[];
  properties: IPropertyDefinitionValue[];
}

export enum ItemDefinitionIOActions {
  READ = "READ",
  CREATE = "CREATE",
  EDIT = "EDIT",
  DELETE = "DELETE",
}

/**
 * This is the max expression, the item definition class
 * which basically compounds all how this is defined
 */
export default class ItemDefinition {
  /**
   * A raw helper function that gets a child or imported
   * raw item definition for an item, it's static, so it works
   * with raw json data, it throws no error
   * @param itemDefinitionRaw the json for the item definition
   * @param parentModuleRaw the parent module that contains
   * this same item definition raw
   * @param name the name of the expected child item
   * @param avoidImports whether to avoid imported items from the module
   */
  public static getItemDefinitionRawFor(
    itemDefinitionRaw: IItemDefinitionRawJSONDataType,
    parentModuleRaw: IModuleRawJSONDataType,
    name: string,
    avoidImports?: boolean,
  ): IItemDefinitionRawJSONDataType {
    // Find the definition in the raw form
    let definition = itemDefinitionRaw.childDefinitions
      .find((d) => d.name === name);

    // if we don't get it let's check the imports if we are allowed
    if (!definition && !avoidImports) {
      // we take the location and we match it like this
      // /path/example/itemDefinition would be considered imported
      // as well as itemDefinition would be matched to
      // /path/example/itemDefinition
      const importedDefinitionLoc = itemDefinitionRaw.importedChildDefinitions
        .find((d) => d.join("/") === name || d[d.length - 1] === name);

      // if we got it
      if (importedDefinitionLoc) {
        // le'ts get the name and the imported path
        const importedDefinitionName = importedDefinitionLoc.join("/");
        const importedPath = itemDefinitionRaw.importedChildDefinitions
          .find((d) => d.join("/") === importedDefinitionName);

        // There is an equal static function in the parent module for
        // handling this too
        if (importedPath) {
          definition = Module.getItemDefinitionRawFor(
            parentModuleRaw,
            importedPath,
          );
        }
      }
    }

    return definition || null;
  }

  /**
   * A raw helper function that takes raw json data and returns
   * a property definition if it finds it based on its id
   * it also checks prop extensions
   * @param itemDefinitionRaw the raw item definition to be searched
   * @param parentModuleRaw the raw module
   * @param id the id of the property
   * @param includeExtensions whether to include the extensions
   */
  public static getPropertyDefinitionRawFor(
    itemDefinitionRaw: IItemDefinitionRawJSONDataType,
    parentModuleRaw: IModuleRawJSONDataType,
    id: string,
    includeExtensions: boolean,
  ): IPropertyDefinitionRawJSONDataType {
    // We try to find the item definition locally
    let definition = itemDefinitionRaw.properties &&
      itemDefinitionRaw.properties.find((p) => p.id === id);

    // Otherwise we might check the prop extensions in the parent module
    // To see if it's there
    if (!definition && includeExtensions && parentModuleRaw.propExtensions) {
      definition = parentModuleRaw.propExtensions.find((p) => p.id === id);
    }

    // We return the definition or null on its defect
    return definition || null;
  }

  public rawData: IItemDefinitionRawJSONDataType;
  // Functions for graphql
  // tslint:disable-next-line: variable-name
  public _gqlObj: GraphQLOutputType;
  // tslint:disable-next-line: variable-name
  public _gqlQueryObj: GraphQLObjectType;

  private itemInstances: Item[];
  private childDefinitions: ItemDefinition[];
  private importedChildDefinitions: Array<{
    fullName: string,
    definition: ItemDefinition,
  }>;
  private propertyDefinitions: PropertyDefinition[];
  private parentModule: Module;
  private parentItemDefinition: ItemDefinition;

  private listeners: {
    [id: number]: ListenerType[],
  };

  // state information
  private stateHasAppliedValueTo: {
    [id: number]: boolean,
  };

  constructor(
    rawJSON: IItemDefinitionRawJSONDataType,
    parentModule: Module,
    parentItemDefinition: ItemDefinition,
  ) {
    this.rawData = rawJSON;
    this.parentModule = parentModule;
    this.parentItemDefinition = parentItemDefinition;

    // assigning the item definitions that are child by
    // instantiating them
    this.childDefinitions = rawJSON.childDefinitions ? rawJSON.childDefinitions
      .map((d) => (new ItemDefinition(d, this.parentModule,
        this))) : [];

    // Assigning the imported child definitions by
    // instantiating a detached child definition from the
    // parent module
    this.importedChildDefinitions =
      rawJSON.importedChildDefinitions ?
      rawJSON.importedChildDefinitions.map(
        (d) => ({
          fullName: d.join("/"),
          definition: this.parentModule.getItemDefinitionFor(d).getNewInstance(),
        })) : [];

    // assigning the property definition by using the
    // properties and instantiating those as well
    this.propertyDefinitions = rawJSON.properties ? rawJSON.properties
      .map((i) => (new PropertyDefinition(i, parentModule,
        this, false))) : [];

    // assigning the item instances by using the includes
    // and instantiating those
    this.itemInstances = rawJSON.includes ? rawJSON.includes
      .map((i) => (new Item(i, parentModule, this))) : [];

    this.stateHasAppliedValueTo = {};

    this.listeners = [];
  }

  /**
   * provides the raw name of the item definition
   */
  public getName(): string {
    return this.rawData.name;
  }

  public getPath(): string[] {
    const parentPath = this.parentItemDefinition ? this.parentItemDefinition.getPath() : [];
    return parentPath.concat(this.getName());
  }

  public getModuleName(): string {
    return this.parentModule.getName();
  }

  /**
   * Tells whether an item definition has a child item definition for it
   * @param name the name of the item definition
   * @param avoidImports whether to avoid the imported detached definitions
   */
  public hasItemDefinitionFor(
    name: string,
    avoidImports?: boolean,
  ): boolean {
    // For this we use the raw data, we check if one
    // matches the name
    let status = this.rawData.childDefinitions.some((d) => d.name === name);

    // if we don't find it let's try searching in imports
    if (!status && !avoidImports) {
      // we take the location and we match it like this
      // /path/example/itemDefinition would be considered imported
      // as well as itemDefinition would be matched to
      // /path/example/itemDefinition
      const importedDefinitionLoc = this.rawData.importedChildDefinitions
        .find((d) => d.join("/") === name || d[d.length - 1] === name);
      // if we find an imported location that matches
      if (importedDefinitionLoc) {
        // we ask the module the same thing
        status =
          this.parentModule.hasItemDefinitionFor(importedDefinitionLoc);
      }
    }
    // return that status
    return status;
  }

  /**
   * Gets a live item definition for the current item definition
   * either as a children or a detached instance that came from
   * another item definition as an import
   * @throws an error if the item definition does not exist
   * @param name the name of the item definition
   * @param avoidImports whether to avoid imported items
   */
  public getItemDefinitionFor(
    name: string,
    avoidImports?: boolean,
  ): ItemDefinition {
    // We basically do the same as hasItemDefinition but we use
    // the live instances
    let definition = this.childDefinitions
      .find((d) => d.getName() === name);

    // if we don't have that definition
    if (!definition && !avoidImports) {

      // Do the same as before and do the matching
      const importedDefinitionLoc = this.rawData.importedChildDefinitions
        .find((d) => d.join("/") === name || d[d.length - 1] === name);

      // now we check we got something
      if (importedDefinitionLoc) {
        // And now let's use the full names for what we had
        // already requested to the parent
        const importedDefinitionName = importedDefinitionLoc.join("/");
        const found = this.importedChildDefinitions
          .find((d) => d.fullName === importedDefinitionName);

        // if we find it, we assign it
        if (found) {
          definition = found.definition;
        }
      }
    }

    // We throw an error in requested a non existant definition
    if (!definition) {
      throw new Error("Requested invalid definition " + name);
    }

    // return it
    return definition;
  }

  public hasItemFor(id: string) {
    return !!this.itemInstances.find((ii) => ii.getId() === id);
  }

  public getItemFor(id: string) {
    const item = this.itemInstances.find((ii) => ii.getId() === id);
    if (!item) {
      throw new Error("Requested invalid item " + id);
    }
    return item;
  }

  /**
   * Provides a raw json item definition that it has a children
   * @param name the name of the item definition
   * @throws an error if the item definition does not exist
   * @returns a raw item definition
   */
  public getItemDefinitionRawFor(
    name: string,
    avoidImports?: boolean,
  ) {
    // We basically pipe the data to the static
    const definition = ItemDefinition.getItemDefinitionRawFor(
      this.rawData,
      this.parentModule.rawData,
      name,
      avoidImports,
    );
    //
    if (!definition) {
      throw new Error("Searching for item definition " +
        name + " failed");
    }
    return definition;
  }

  /**
   * Provides all the property definitions without
   * including the extensions
   */
  public getAllPropertyDefinitions() {
    return this.propertyDefinitions;
  }

  public getAllPropertyDefinitionsAndExtensions() {
    return this.parentModule.getAllPropExtensions().concat(this.getAllPropertyDefinitions());
  }

  public getAllItems() {
    return this.itemInstances;
  }

  /**
   * Checks whether an item definition has a property definition
   * @param id the property definition id
   * @param includeExtensions whether to include extensions or not
   */
  public hasPropertyDefinitionFor(id: string, includeExtensions: boolean) {
    // we use the rawdata to quickly check
    let found = (this.rawData.properties || [])
      .some((p) => p.id === id);
    if (!found && includeExtensions) {
      found = this.parentModule.hasPropExtensionFor(id);
    }
    return found;
  }

  /**
   * Provides a live property definition for an item definition
   * this property definition can trigger state changes
   * @throws error if the property does not exist
   * @param id the property definition id
   * @param includeExtensions whether to include extensions or not
   */
  public getPropertyDefinitionFor(
    id: string,
    includeExtensions: boolean,
  ): PropertyDefinition {
    let definition = this.propertyDefinitions.find((p) => p.getId() === id);
    if (!definition && includeExtensions) {
      definition = this.parentModule.getPropExtensionFor(id);
    }
    if (!definition) {
      throw new Error("Requested invalid property " + id);
    }
    return definition;
  }

  /**
   * Tells whether the current item definition has items itself
   * which are active and match the specific name
   * that means the item is not excluded and the item is
   * matches the name
   * @param name the name of the item
   */
  public hasAtLeastOneActiveInstanceOf(id: number, name: string): boolean {
    // we need a list of possible candidates
    // the might currently contain checks if an item
    // contains the item with the given name
    // otherwise it's not worth to check for activity
    const possibleCandidates = this.itemInstances
      .filter((i) => i.getName() === name);

    // if there are no possible candidates return false
    if (!possibleCandidates.length) {
      return false;
    }

    return possibleCandidates.some((c) => c.getExclusionState(id) !== ItemExclusionState.EXCLUDED);
  }

  /**
   * Checks whether it has an active instance of an item
   * given its item id (not its name)
   * @param id the slot id
   * @param itemId the id of the item
   */
  public hasAnActiveInstanceOfId(id: number, itemId: string): boolean {
    const candidate = this.itemInstances
      .find((i) => i.getId() === itemId);

    if (!candidate) {
      return false;
    }

    return candidate.getExclusionState(id) !== ItemExclusionState.EXCLUDED;
  }

  /**
   * Just gives the parent module
   */
  public getParentModule() {
    return this.parentModule;
  }

  /**
   * Tells whether it has a parent item definition
   */
  public hasParentItemDefinition() {
    return !!this.parentItemDefinition;
  }

  /**
   * Provides the parent item definition
   * @throws an error if nothing available
   */
  public getParentItemDefinition() {
    if (!this.parentItemDefinition) {
      throw new
        Error("Attempted to get parent definition while missing");
    }
    return this.parentItemDefinition;
  }

  /**
   * Provides the live child definitions
   * without imports
   */
  public getChildDefinitions() {
    return this.childDefinitions;
  }

  /**
   * Provides the live child definitions
   * without imports, recursively
   */
  public getChildDefinitionsRecursive() {
    let childDefinitions = this.getChildDefinitions();
    childDefinitions.forEach((idef) => {
      childDefinitions = childDefinitions.concat(idef.getChildDefinitionsRecursive());
    });
    return childDefinitions;
  }

  /**
   * Provides the live imported child definitions
   * without imports
   */
  public getImportedChildDefinitions() {
    return this.importedChildDefinitions.map((icd) => icd.definition);
  }

  /**
   * Uses the raw data to instantiate a new instance of
   * the item definition, uses the same on state change
   * function for state changes so it remains linked to the
   * module
   */
  public getNewInstance() {
    return new ItemDefinition(this.rawData, this.parentModule,
      this.parentItemDefinition);
  }

  /**
   * Provides the item definition item locale data
   * @param  locale the locale in iso form
   * @returns an object or null (if locale not valid)
   */
  public getI18nDataFor(locale: string) {
    return this.rawData.i18nData[locale] || null;
  }

  /**
   * same as getCurrentValue but ignores external checking
   * so it doesn't have to be async and no need to spend
   * network resources, checks most, but ignores unique and
   * autocomplete checkings; note that you should still pass id
   * in order to get cached previously checked results
   * @param id the stored value of the item definition, pass null if new
   * @param onlyIncludeProperties only includes these specific
   * properties, note property definitions are not fetched in
   * this case
   * @param excludeItems excludes the items in the list
   */
  public getCurrentValueNoExternalChecking(
    id: number,
    onlyIncludeProperties?: string[],
    excludeItems?: boolean,
  ): IItemDefinitionValue {
    const properties = onlyIncludeProperties ?
      onlyIncludeProperties.map((p) => this.getPropertyDefinitionFor(p, false).getCurrentValueNoExternalChecking(id)) :
      this.getParentModule().getAllPropExtensions().concat(
        this.getAllPropertyDefinitions(),
      ).map((pd) => {
        return pd.getCurrentValueNoExternalChecking(id);
      });

    return {
      moduleName: this.getModuleName(),
      itemDefPath: this.getPath(),
      itemDefName: this.getName(),
      items: excludeItems ? [] : this.itemInstances.map((ii) => ii.getCurrentValueNoExternalChecking(id)),
      properties,
    };
  }

  /**
   * provides the structure of the current item
   * as it is currently, the reason this is more efficient
   * is because getting the value of each item definition
   * wastes resources, so using this function is more
   * efficient than calling the functions
   * @param id the stored value of the item definition, pass null if new
   * this also represens the slot
   * @param onlyIncludeProperties only includes these specific
   * properties, note property definitions are not fetched in
   * this case
   * @param excludeItems excludes the items in the list
   */
  public async getCurrentValue(
    id: number,
    onlyIncludeProperties?: string[],
    excludeItems?: boolean,
  ): Promise<IItemDefinitionValue> {
    const properties = await Promise.all(onlyIncludeProperties ?
      onlyIncludeProperties.map((p) => this.getPropertyDefinitionFor(p, false).getCurrentValue(id)) :
      this.getParentModule().getAllPropExtensions().concat(
        this.getAllPropertyDefinitions(),
      ).map((pd) => {
        return pd.getCurrentValue(id);
      }),
    );

    return {
      moduleName: this.getModuleName(),
      itemDefPath: this.getPath(),
      itemDefName: this.getName(),
      items: excludeItems ? [] : await Promise.all(this.itemInstances.map((ii: Item) => ii.getCurrentValue(id))),
      properties,
    };
  }

  /**
   * Applies an item definition value the state of this
   * instance
   * @param value the value, be careful, it will choke if invalid
   */
  public applyValue(id: number, value: IItemDefinitionValue) {
    this.stateHasAppliedValueTo[id] = true;

    if (value.itemDefPath.join("/") !== this.getPath().join("/")) {
      throw new Error("Attempted to apply unmatching values");
    }

    value.items.forEach((itemValue) => {
      this.getItemFor(itemValue.itemId).applyValue(id, itemValue);
    });

    value.properties.forEach((propertyValue) => {
      this.getPropertyDefinitionFor(propertyValue.propertyId, true).applyValue(id, propertyValue);
    });
  }

  /**
   * Applies an item definition value from a graphql data
   */
  public applyValueFromGQL(
    id: number,
    value: {
      [key: string]: any,
    },
    excludeExtensions?: boolean,
  ) {
    this.stateHasAppliedValueTo[id] = true;

    const properties =
      excludeExtensions ?
        this.getAllPropertyDefinitions() :
        this.getAllPropertyDefinitionsAndExtensions();
    properties.forEach((property) => {
      let givenValue = value[property.getId()];
      if (typeof givenValue === "undefined") {
        givenValue = null;
      }
      property.applyValueFromGQL(id, givenValue);
    });
    this.getAllItems().forEach((item) => {
      let givenValue = value[item.getQualifiedIdentifier()];
      if (typeof givenValue === "undefined") {
        givenValue = null;
      }
      const givenExclusionState = value[item.getQualifiedExclusionStateIdentifier()] || ItemExclusionState.EXCLUDED;
      item.applyValueFromGQL(id, givenValue, givenExclusionState);
    });
  }

  public cleanValueFor(id: number, excludeExtensions?: boolean) {
    delete this.stateHasAppliedValueTo[id];

    const properties =
      excludeExtensions ?
        this.getAllPropertyDefinitions() :
        this.getAllPropertyDefinitionsAndExtensions();
    properties.forEach((property) => {
      property.cleanValueFor(id);
    });
    this.getAllItems().forEach((item) => {
      item.cleanValueFor(id);
    });
  }

  public hasAppliedValueTo(id: number): boolean {
    return !!this.stateHasAppliedValueTo[id];
  }

  /**
   * Provides the item definition that represent the search mode of this
   * same item definition
   */
  public getSearchModeCounterpart(): ItemDefinition {
    return this.parentModule.getSearchModule().getItemDefinitionFor(
      this.getModulePath(),
    );
  }

  /**
   * Tells whether this item is the search mode item of another
   * item
   */
  public isInSearchMode(): boolean {
    return this.parentModule.isInSearchMode();
  }

  public getRolesWithAccessTo(action: ItemDefinitionIOActions) {
    if (action === ItemDefinitionIOActions.READ) {
      return this.rawData.readRoleAccess || [ANYONE_METAROLE];
    } else if (action === ItemDefinitionIOActions.CREATE) {
      return this.rawData.createRoleAccess || [ANYONE_METAROLE];
    } else if (action === ItemDefinitionIOActions.EDIT) {
      return this.rawData.editRoleAccess || [SELF_METAROLE];
    } else if (action === ItemDefinitionIOActions.DELETE) {
      return this.rawData.deleteRoleAccess || [SELF_METAROLE];
    }
    return [];
  }

  public checkRoleAccessFor(
    action: ItemDefinitionIOActions,
    role: string,
    userId: number,
    ownerUserId: number,
    requestedFields: any,
    throwError: boolean,
  ) {
    const rolesWithAccess = this.getRolesWithAccessTo(action);
    const idefLevelAccess = rolesWithAccess.includes(ANYONE_METAROLE) || (
      rolesWithAccess.includes(SELF_METAROLE) && userId === ownerUserId
    ) || rolesWithAccess.includes(role);

    if (!idefLevelAccess) {
      if (throwError) {
        throw new GraphQLEndpointError({
          message: `Forbidden, user ${userId} with role ${role} has no ${action} access to resource ${this.getName()}` +
          ` only roles ${rolesWithAccess.join(", ")} can be granted access`,
          code: "FORBIDDEN",
        });
      }
      return false;
    }

    if (action === ItemDefinitionIOActions.DELETE) {
      return true;
    }

    return Object.keys(requestedFields).every((requestedField) => {
      if (requestedField.startsWith(ITEM_PREFIX)) {
        const item = this.getItemFor(requestedField.replace(ITEM_PREFIX, ""));
        return item.checkRoleAccessFor(action, role, userId, ownerUserId, requestedFields[requestedField], throwError);
      } else {
        const propDef = this.getPropertyDefinitionFor(requestedField, true);
        return propDef.checkRoleAccessFor(action, role, userId, ownerUserId, throwError);
      }
    });
  }

  /**
   * Basically returns the raw data itself
   * doesn't do much
   */
  public toJSON() {
    return this.rawData;
  }

  /**
   * Provides the path from the module
   * base, that is not absolute but a relative
   * path from the parent module
   */
  public getModulePath(): string[] {
    if (this.parentItemDefinition) {
      return this.parentItemDefinition
        .getModulePath()
        .concat([
          this.getName(),
        ]);
    }
    return [this.getName()];
  }

  /**
   * Provides the absolute path all the way
   * from the root
   */
  public getAbsolutePath(): string[] {
    if (this.parentItemDefinition) {
      return this.parentItemDefinition
        .getAbsolutePath()
        .concat([
          this.getName(),
        ]);
    }
    return this.parentModule
      .getAbsolutePath()
      .concat([
        this.getName(),
      ]);
  }

  public containsAnExternallyCheckedProperty(
    onlyCheckProperties?: string[],
    ignoreItems?: boolean,
  ): boolean {
    const existInFirstLayer: boolean =
      this.getAllPropertyDefinitionsAndExtensions()
      .filter((pd) => !onlyCheckProperties ? true : onlyCheckProperties.includes(pd.getId()))
      .some((pd) => pd.isUnique());
    if (existInFirstLayer) {
      return true;
    } else if (ignoreItems) {
      return false;
    }
    return this.getAllItems().some((i) => i.containsAnExternallyCheckedProperty());
  }

  /**
   * Provides the qualified path name
   * of this item definition, which is unique for
   * this root instance
   */
  public getQualifiedPathName(): string {
    if (this.parentItemDefinition) {
      return PREFIXED_CONCAT(this.parentItemDefinition.getQualifiedPathName(), ITEM_DEFINITION_PREFIX + this.getName());
    }
    return PREFIXED_CONCAT(this.parentModule.getQualifiedPathName(), ITEM_DEFINITION_PREFIX + this.getName());
  }

  public getPolicyNamesFor(policyType: string): string[] {
    if (!this.rawData.policies || !this.rawData.policies[policyType]) {
      return [];
    }
    return Object.keys(this.rawData.policies[policyType]);
  }

  public getPropertiesForPolicy(type: string, name: string): PropertyDefinition[] {
    return this.rawData.policies[type][name].properties.map(
      (propertyId: string) => this.getPropertyDefinitionFor(propertyId, true),
    );
  }

  public getRolesForPolicy(policy: string, name: string): string[] {
    return this.rawData.policies[policy][name].roles;
  }

  public addListener(id: number, listener: ListenerType) {
    this.listeners[id] = this.listeners[id] || [];
    this.listeners[id].push(listener);
  }

  public removeListener(id: number, listener: ListenerType) {
    if (!this.listeners[id]) {
      return;
    }
    const index = this.listeners[id].indexOf(listener);
    if (index !== -1) {
      this.listeners[id].splice(index, 1);
    }
  }

  public triggerListeners(id: number, but?: ListenerType) {
    this.listeners[id].filter((l) => l !== but).forEach((l) => l());
  }
}