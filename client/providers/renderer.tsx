import React from "react";
import { IIncludeCalloutWarningRendererProps } from "../internal/components/IncludeCalloutWarning";
import { IPropertyEntryFieldRendererProps } from "../internal/components/PropertyEntry/PropertyEntryField";

export interface IRendererContext {
  IncludeCalloutWarning?: React.ComponentType<IIncludeCalloutWarningRendererProps>;
  PropertyEntryField?: React.ComponentType<IPropertyEntryFieldRendererProps>;
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