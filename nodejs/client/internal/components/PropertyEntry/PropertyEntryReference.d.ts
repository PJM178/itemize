import React from "react";
import { IPropertyEntryHandlerProps, IPropertyEntryRendererProps } from ".";
import { EndpointErrorType } from "../../../../base/errors";
import ItemDefinition from "../../../../base/Root/Module/ItemDefinition";
import PropertyDefinition, { PropertyDefinitionValueType } from "../../../../base/Root/Module/ItemDefinition/PropertyDefinition";
export interface IPropertyEntryReferenceOption {
    id: number;
    text: string;
}
export interface IReferrencedPropertySet {
    [propertyId: string]: PropertyDefinitionValueType;
}
export interface IPropertyEntryReferenceRendererProps extends IPropertyEntryRendererProps<number> {
    currentStrValue: string;
    currentValueIsFullfilled: boolean;
    currentOptions: IPropertyEntryReferenceOption[];
    currentFindError: EndpointErrorType;
    currentSearchError: EndpointErrorType;
    onChangeSearch: (str: string) => void;
    onSelect: (option: IPropertyEntryReferenceOption) => void;
    onCancel: () => void;
    dismissSearchError: () => void;
    dismissFindError: () => void;
}
interface IPropertyEntryReferenceState {
    currentOptions: IPropertyEntryReferenceOption[];
    currentSearchError: EndpointErrorType;
    currentFindError: EndpointErrorType;
}
export default class PropertyEntryReference extends React.Component<IPropertyEntryHandlerProps<number, IPropertyEntryReferenceRendererProps>, IPropertyEntryReferenceState> {
    private searchTimeout;
    private currentlyFindingValueFor;
    private lastCachedSearch;
    constructor(props: IPropertyEntryHandlerProps<number, IPropertyEntryReferenceRendererProps>);
    componentDidMount(): void;
    search(): Promise<void>;
    getSpecialData(): [ItemDefinition, PropertyDefinition, PropertyDefinition];
    getSSRFoundValue(forId: number, forVersion: string): string;
    findCurrentStrValue(forId: number, forVersion: string): Promise<void>;
    onChangeSearch(str: string): void;
    onSelect(option: IPropertyEntryReferenceOption): void;
    onCancel(): void;
    dismissSearchError(): void;
    dismissFindError(): void;
    componentDidUpdate(prevProps: IPropertyEntryHandlerProps<number, IPropertyEntryReferenceRendererProps>): void;
    shouldComponentUpdate(nextProps: IPropertyEntryHandlerProps<number, IPropertyEntryReferenceRendererProps>, nextState: IPropertyEntryReferenceState): boolean;
    render(): JSX.Element;
}
export {};
