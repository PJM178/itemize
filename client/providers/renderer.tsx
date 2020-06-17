import React from "react";
import { IIncludeCalloutWarningRendererProps } from "../internal/components/IncludeCalloutWarning";
import { IPropertyEntryFieldRendererProps } from "../internal/components/PropertyEntry/PropertyEntryField";
import { IPropertyEntryFileRendererProps } from "../internal/components/PropertyEntry/PropertyEntryFile";
import { IPropertyEntryBooleanRendererProps } from "../internal/components/PropertyEntry/PropertyEntryBoolean";
import { IPropertyEntryLocationRendererProps } from "../internal/components/PropertyEntry/PropertyEntryLocation";
import { IPropertyViewSimpleRendererProps } from "../internal/components/PropertyView/PropertyViewSimple";
import { IPropertyEntrySelectRendererProps } from "../internal/components/PropertyEntry/PropertyEntrySelect";
import { IPropertyEntryTextRendererProps } from "../internal/components/PropertyEntry/PropertyEntryText";
import { IPropertyViewTextRendererProps } from "../internal/components/PropertyView/PropertyViewText";
import { IPropertyViewFileRendererProps } from "../internal/components/PropertyView/PropertyViewFile";
import { IPropertyEntryDateTimeRendererProps } from "../internal/components/PropertyEntry/PropertyEntryDateTime";

export interface IRendererContext {
  IncludeCalloutWarning?: React.ComponentType<IIncludeCalloutWarningRendererProps>;

  PropertyEntryField?: React.ComponentType<IPropertyEntryFieldRendererProps>;
  PropertyEntryFile?: React.ComponentType<IPropertyEntryFileRendererProps>;
  PropertyEntryBoolean?: React.ComponentType<IPropertyEntryBooleanRendererProps>;
  PropertyEntryLocation?: React.ComponentType<IPropertyEntryLocationRendererProps>;
  PropertyEntrySelect?: React.ComponentType<IPropertyEntrySelectRendererProps>;
  PropertyEntryText?: React.ComponentType<IPropertyEntryTextRendererProps>;
  PropertyEntryDateTime?: React.ComponentType<IPropertyEntryDateTimeRendererProps>;

  PropertyViewSimple?: React.ComponentType<IPropertyViewSimpleRendererProps>;
  PropertyViewText?: React.ComponentType<IPropertyViewTextRendererProps>;
  PropertyViewFile?: React.ComponentType<IPropertyViewFileRendererProps>;
}

export const RendererContext = React.createContext<IRendererContext>(null);

interface IRendererProviderProps extends IRendererContext {
  children: React.ReactNode,
}

export default function RendererProvider(props: IRendererProviderProps) {
  return <RendererContext.Consumer>
    {
      (value) => {
        const newProviderValue: IRendererContext = {...value};
        Object.keys(props).forEach((key) => {
          if (key === "children") {
            return;
          }
          newProviderValue[key] = props[key];
        });
        return <RendererContext.Provider value={newProviderValue}>{props.children}</RendererContext.Provider>
      }
    }
  </RendererContext.Consumer>
}