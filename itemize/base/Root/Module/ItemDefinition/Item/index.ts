// lets do the import, item definition depends on conditional rule set
// and property value mapping
import ItemDefinition, { IItemDefinitionValue, ItemDefinitionIOActions } from "..";
import ConditionalRuleSet, {
  IConditionalRuleSetRawJSONDataType,
} from "../ConditionalRuleSet";
import Module from "../..";
import PropertyDefinition from "../PropertyDefinition";
import PropertiesValueMappingDefiniton, { IPropertiesValueMappingDefinitonRawJSONDataType } from "../PropertiesValueMappingDefiniton";
import { ITEM_PREFIX, PREFIX_BUILD, EXCLUSION_STATE_SUFFIX } from "../../../../../constants";

export enum ItemExclusionState {
  EXCLUDED = "EXCLUDED",
  INCLUDED = "INCLUDED",
  ANY = "ANY",
}

export interface IItemValue {
  exclusionState: ItemExclusionState;
  canExclusionBeSet: boolean;
  itemId: string;
  itemName: string;
  itemDefinitionValue: IItemDefinitionValue;
  stateExclusion: ItemExclusionState;
  stateExclusionModified: boolean;
}

// this is what our raw json looks like
export interface IItemRawJSONDataType {
  id: string;
  name: string;
  i18nData?: {
    [locale: string]: {
      name?: string;
      exclusion_selector_label?: string;   // label for the selector to toggle exclusion in normal mode
      exclusion_ternary_selector_label?: string;
      callout_excluded_label?: string;     // label in the title for when the item is callout excluded
      excluded_label?: string;            // describe when the item is excluded, for descriptions and the ternary mode
      included_label?: string;            // describe when the item is included, used only for ternary mode
      any_label?: string;                 // describe the inbetween, used only for ternary mode
    },
  };
  enforcedProperties?: IPropertiesValueMappingDefinitonRawJSONDataType;
  predefinedProperties?: IPropertiesValueMappingDefinitonRawJSONDataType;
  excludedIf?: IConditionalRuleSetRawJSONDataType;
  canUserExclude?: boolean;
  canUserExcludeIf?: IConditionalRuleSetRawJSONDataType;
  defaultExcluded?: boolean;
  defaultExcludedIf?: IConditionalRuleSetRawJSONDataType;
  ternaryExclusionState?: boolean;
  // Exclusions are called out at UI level, basically the item is considered incomplete
  exclusionIsCallout?: boolean;
  disableSearch?: boolean;
  sinkIn?: string[];
}

/**
 * This class provides the utilities for the description of an item
 * it's one of the most important classes that defines how an item is added
 * based on an existant item defintion
 *
 * An item is described mainly by its name and such name must be a valid
 * import for the item definition that its parent holds, for example
 * lets say we have an item definition for Car which has wheels in it
 *
 * {
 *  "name": "wheels",
 *  "enforcedProperties": {
 *    "mainAmount": 4
 *  },
 *  "predefinedProperties": {
 *    "spares": 1
 *  },
 *  "excludedIf": {
 *    "property": "hover-car",
 *    "comparator": "equals",
 *    "value": true
 *  },
 *  "sinkIn": [
 *    "material"
 *  ]
 * },
 *
 * An item might also be a group of items with a gate
 */
export default class Item {
  // The basics
  public rawData: IItemRawJSONDataType;
  public parentItemDefinition: ItemDefinition;
  public parentModule: Module;

  // graphql helper
  // tslint:disable-next-line: variable-name
  public _gqlInObj: any;
  // tslint:disable-next-line: variable-name
  public _gqlOutObj: any;
  // tslint:disable-next-line: variable-name
  public _gqlInObjOpt: any;
  // tslint:disable-next-line: variable-name
  public _gqlOutObjOpt: any;

  // the data that comes from the raw json is to be processed here
  private itemDefinition?: ItemDefinition;
  private excludedIf?: ConditionalRuleSet;
  private canUserExcludeIf?: ConditionalRuleSet;
  private defaultExcludedIf?: ConditionalRuleSet;

  // solo item specific attributes
  private enforcedProperties?: PropertiesValueMappingDefiniton;
  private predefinedProperties?: PropertiesValueMappingDefiniton;

  // representing the state of the class
  private stateExclusion: {
    [id: number]: ItemExclusionState,
  };
  private stateExclusionModified: {
    [id: number]: boolean,
  };

  /**
   * The constructor for an Item
   * @param rawJSON the raw data as JSON
   * @param parentModule the parent module
   * @param parentItemDefinition   the item definition that this node is
   * located, its root; for the example above that
   * would be the vehicle item definition
   */
  constructor(
    rawJSON: IItemRawJSONDataType,
    parentModule: Module,
    parentItemDefinition: ItemDefinition,
  ) {

    this.rawData = rawJSON;

    // the enforced properties list
    this.enforcedProperties = rawJSON.enforcedProperties &&
      new PropertiesValueMappingDefiniton(rawJSON.enforcedProperties,
        parentItemDefinition, this.itemDefinition);

    // the predefined properties list
    this.predefinedProperties = rawJSON.predefinedProperties &&
      new PropertiesValueMappingDefiniton(rawJSON.predefinedProperties,
        parentItemDefinition, this.itemDefinition);

    // lets get an instance for the item definition for this
    // item, if there's one, and let's detach it
    this.itemDefinition = rawJSON.name && parentItemDefinition
      .getItemDefinitionFor(rawJSON.name).getNewInstance();
    // set the enforced and predefined properties overwrites
    // if needed to

    if (this.enforcedProperties) {
      this.enforcedProperties.getPropertyMap().forEach((p) => {
        this.itemDefinition.getPropertyDefinitionFor(p.id, true)
          .setSuperEnforced(p.value);
      });
    }

    if (this.predefinedProperties) {
      this.predefinedProperties.getPropertyMap().forEach((p) => {
        this.itemDefinition.getPropertyDefinitionFor(p.id, true)
          .setSuperDefault(p.value);
      });
    }

    // If this is going to be excluded
    this.excludedIf = rawJSON.excludedIf &&
      new ConditionalRuleSet(rawJSON.excludedIf,
        parentModule, parentItemDefinition, null, this);

    // If it might be excluded
    this.canUserExcludeIf = rawJSON.canUserExcludeIf &&
      new ConditionalRuleSet(rawJSON.canUserExcludeIf,
        parentModule, parentItemDefinition, null, this);

    // if it's default excluded
    this.defaultExcludedIf = rawJSON.defaultExcludedIf &&
      new ConditionalRuleSet(
        rawJSON.defaultExcludedIf,
        parentModule,
        parentItemDefinition,
        null,
        this,
      );

    // parent item definition
    this.parentItemDefinition = parentItemDefinition;
    this.parentModule = parentModule;

    // State management
    this.stateExclusion = {};
    // initially the state hasn't been modified
    this.stateExclusionModified = {};
  }

  /**
   * Provides the ids of the sinking properties
   */
  public getSinkingPropertiesIds(): string[] {
    return this.rawData.sinkIn || [];
  }

  /**
   * Provides all the sinking properties as property definition
   * instances
   */
  public getSinkingProperties(): PropertyDefinition[] {
    return this.getSinkingPropertiesIds()
      .map((propertyId) => this.itemDefinition.getPropertyDefinitionFor(propertyId, false));
  }

  public checkRoleAccessFor(
    action: ItemDefinitionIOActions,
    role: string,
    userId: number,
    ownerUserId: number,
    requestedFields: any,
    throwError: boolean,
  ) {
    return Object.keys(requestedFields).every((requestedField) => {
      const propDef = this.itemDefinition.getPropertyDefinitionFor(requestedField, false);
      return propDef.checkRoleAccessFor(action, role, userId, ownerUserId, throwError);
    });
  }

  /**
   * Tells whether the current item is excluded
   * @return a boolean whether it's excluded or not
   */
  public getExclusionState(id: number): ItemExclusionState {
    // let's check if it's excluded by force
    const isExcludedByForce = this.excludedIf && this.excludedIf.evaluate(id);

    if (isExcludedByForce) {
      return ItemExclusionState.EXCLUDED;
    }

    // if it can be excluded
    const canBeExcludedByUser = this.rawData.canUserExclude || (this.canUserExcludeIf &&
      this.canUserExcludeIf.evaluate(id));
    if (canBeExcludedByUser) {
      // if it hasn't been modified we return the default state
      if (!this.stateExclusionModified[id]) {
        // depending on the condition
        const isDefaultExcluded = this.rawData.defaultExcluded ||
          (this.defaultExcludedIf && this.defaultExcludedIf.evaluate(id)) ||
          false;
        // by default the excluded would be false
        if (isDefaultExcluded) {
          return ItemExclusionState.EXCLUDED;
        } else if (this.rawData.ternaryExclusionState) {
          return ItemExclusionState.ANY;
        }
        return ItemExclusionState.INCLUDED;
      }

      if (
        !this.rawData.ternaryExclusionState &&
        this.stateExclusion[id] === ItemExclusionState.ANY ||
        !this.stateExclusion[id]
      ) {
        return ItemExclusionState.INCLUDED;
      }
      return this.stateExclusion[id];
    } else if (this.rawData.ternaryExclusionState) {
      return ItemExclusionState.ANY;
    }
    return ItemExclusionState.INCLUDED;
  }

  /**
   * Tells whether the exclusion state can be toggled externally
   * This is for when an item might be included
   * like how a car might have a spare wheel or not usually the
   * case is true but it might be false as well
   * @returns a boolean that tells whether if it can be toggled
   */
  public canExclusionBeSet(id: number): boolean {
    // if it's excluded by force the default is false, you cannot toggle
    // anything excluded by force
    const isExcludedByForce = this.excludedIf && this.excludedIf.evaluate(id);
    if (isExcludedByForce) {
      return false;
    }

    // otherwise it depends to what might exclude provides
    return this.rawData.canUserExclude || (this.canUserExcludeIf &&
      this.canUserExcludeIf.evaluate(id)) || false;
  }

  /**
   * Checks whether the exclusion state is a ternary type,
   * this basically only exists in search item definition items
   * because it's used during the search mode
   */
  public isExclusionTernary(): boolean {
    return this.rawData.ternaryExclusionState || false;
  }

  /**
   * Checks whether excluding this item (while possible) will cause
   * a callout, that is, a clear display that the item definition
   * instance is missing it, this is for key items, eg. car, wheels missing.
   */
  public isExclusionCallout(): boolean {
    return this.rawData.exclusionIsCallout || false;
  }

  /**
   * Sets the exclusion state to a new value
   * @param value the value for the exclusion state
   */
  public setExclusionState(id: number, value: ItemExclusionState) {
    this.stateExclusion[id] = value;
    this.stateExclusionModified[id] = true;
  }

  /**
   * Provides the name for this item, the name represents
   * the item definition children this item is attached to
   */
  public getName() {
    return this.rawData.name;
  }

  /**
   * Provides the unique id of this item definition
   * the unique id is, well, unique for this item
   */
  public getId() {
    return this.rawData.id;
  }

  public getQualifiedIdentifier() {
    return ITEM_PREFIX + this.getId();
  }

  public getPrefixedQualifiedIdentifier() {
    return PREFIX_BUILD(this.getQualifiedIdentifier());
  }

  public getQualifiedExclusionStateIdentifier() {
    return this.getPrefixedQualifiedIdentifier() + EXCLUSION_STATE_SUFFIX;
  }

  /**
   * Provides the current value of this item
   * @param id the id of the stored item definition or module
   */
  public getCurrentValueNoExternalChecking(id: number): IItemValue {
    const exclusionState = this.getExclusionState(id);
    return {
      exclusionState,
      canExclusionBeSet: this.canExclusionBeSet(id),
      itemId: this.getId(),
      itemName: this.getName(),
      itemDefinitionValue: exclusionState === ItemExclusionState.EXCLUDED ? null :
        this.itemDefinition.getCurrentValueNoExternalChecking(id, this.rawData.sinkIn || [], true),
      stateExclusion: this.stateExclusion[id] || ItemExclusionState.ANY,
      stateExclusionModified: this.stateExclusionModified[id] || false,
    };
  }

  /**
   * Provides the current value of this item
   * @param id the id of the stored item definition or module
   */
  public async getCurrentValue(id: number): Promise<IItemValue> {
    const exclusionState = this.getExclusionState(id);
    return {
      exclusionState,
      canExclusionBeSet: this.canExclusionBeSet(id),
      itemId: this.getId(),
      itemName: this.getName(),
      itemDefinitionValue: exclusionState === ItemExclusionState.EXCLUDED ? null :
        (await this.itemDefinition.getCurrentValue(id, this.rawData.sinkIn || [], true)),
      stateExclusion: this.stateExclusion[id] || ItemExclusionState.ANY,
      stateExclusionModified: this.stateExclusionModified[id] || false,
    };
  }

  /**
   * Appliesa value to this item definition
   * the value can be invalid and it will be checked
   * and a proper error be returned when you try to retrieve it
   * hopefully this means validation as well as in
   * it cannot be cheated
   * @param id the id this item is stored
   * @param value the value of the item
   */
  public applyValue(id: number, value: IItemValue) {
    this.stateExclusion[id] = value.stateExclusion;
    this.stateExclusionModified[id] = value.stateExclusionModified;

    if (value.itemDefinitionValue) {
      this.itemDefinition.applyValue(id, value.itemDefinitionValue);
    }
  }

  public applyValueFromGQL(id: number, value: {[key: string]: any}, exclusionState: ItemExclusionState) {
    this.stateExclusion[id] = exclusionState;
    this.stateExclusionModified[id] = true;

    if (value) {
      this.itemDefinition.applyValueFromGQL(id, value, true);
    }
  }

  public cleanValueFor(
    id: number,
  ) {
    delete this.stateExclusion[id];
    delete this.stateExclusionModified[id];

    this.itemDefinition.cleanValueFor(id, true);
  }

  /**
   * Gives the i18 name that was specified
   * or otherwise gives the item definition i18 name
   * @param  locale the locale iso form
   * @returns a string or null (if locale not valid)
   */
  public getI18nNameFor(locale: string) {
    if (this.rawData.i18nData &&
      this.rawData.i18nData[locale] &&
      this.rawData.i18nData[locale].name) {
      return this.rawData.i18nData[locale].name;
    }

    const parentItemDefinitionI18nData = this.itemDefinition.getI18nDataFor(locale);
    return (parentItemDefinitionI18nData && parentItemDefinitionI18nData.name) || null;
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
   * Basically returns the raw data of this item
   */
  public toJSON() {
    return this.rawData;
  }

  public containsAnExternallyCheckedProperty(): boolean {
    return this.itemDefinition.containsAnExternallyCheckedProperty(this.rawData.sinkIn, true);
  }

  /**
   * Provides the item definition where this item is contained
   */
  public getItemDefinition() {
    return this.itemDefinition;
  }
}
