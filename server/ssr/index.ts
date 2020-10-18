import Root from "../../base/Root";
import express from "express";

// import { IOrderByRuleType, SearchVariants } from "../../constants";
// import { PropertyDefinitionValueType } from "../../base/Root/Module/ItemDefinition/PropertyDefinition";

// export interface ISSRSearchPropertySetter {
//   [property: string]: {
//     variant: SearchVariants;
//     value: PropertyDefinitionValueType;
//   }
// }

// export interface ISSRSearchIncludeSetter {
//   [include: string]: {
//     exclusionState: boolean;
//     properties: ISSRSearchPropertySetter;
//   };
// };

// export interface ISSRSearchRule {
//   slot: [string, string, number, string];
//   searchId: string;
//   options: {
//     setProperties?: ISSRSearchPropertySetter;
//     setIncludes?: ISSRSearchIncludeSetter;
//     requestedProperties: string[];
//     requestedIncludes?: string[];
//     orderBy?: IOrderByRuleType;
//     createdBy?: number;
//     parentedBy?: {
//       module: string,
//       itemDefinition: string,
//       id: number,
//       version?: string,
//     };
//     limit: number;
//     offset: number;
//   };
// }

// this infor can be retrieved via the config and other attributes
// doesn't need to be specified
export interface ISSRRule {
  language: string;
  languages: string[];
  rtl: boolean;
  forUser: {
    token: string;
    id: number;
    role: string;
  };
  noData: boolean;
}