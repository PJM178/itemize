import React from "react";
import { ILocaleContextType } from "../internal/app";
import ItemDefinition, { IItemDefinitionStateType } from "../../base/Root/Module/ItemDefinition";
import PropertyDefinition from "../../base/Root/Module/ItemDefinition/PropertyDefinition";
import { PropertyDefinitionSupportedType } from "../../base/Root/Module/ItemDefinition/PropertyDefinition/types";
import Include, { IncludeExclusionState } from "../../base/Root/Module/ItemDefinition/Include";
import { ITokenContextType } from "../internal/providers/token-provider";
import { IOrderByRuleType } from "../../constants";
import { IGQLSearchRecord, IGQLValue } from "../../gql-querier";
import { EndpointErrorType } from "../../base/errors";
import { RemoteListener } from "../internal/app/remote-listener";
import { IPropertySetterProps } from "../components/property/base";
import { IConfigRawJSONDataType } from "../../config";
/**
 * A response given by some handlers like
 * loadValue
 */
export interface IBasicActionResponse {
    error: EndpointErrorType;
}
export interface IActionResponseWithValue extends IBasicActionResponse {
    value: any;
}
export interface ILoadCompletedPayload extends IActionResponseWithValue {
    forId: number;
    forVersion: string;
}
/**
 * A response given by submit and delete
 */
export interface IActionResponseWithId extends IBasicActionResponse {
    id: number;
}
/**
 * A response given by search
 */
export interface IActionResponseWithSearchResults extends IBasicActionResponse {
    records: IGQLSearchRecord[];
    results: IGQLValue[];
    count: number;
    limit: number;
    offset: number;
}
export declare type PolicyPathType = [string, string, string];
export interface IActionCleanOptions {
    policiesToCleanOnSuccess?: PolicyPathType[];
    policiesToCleanOnAny?: PolicyPathType[];
    policiesToCleanOnFailure?: PolicyPathType[];
    propertiesToCleanOnSuccess?: string[];
    propertiesToCleanOnAny?: string[];
    propertiesToCleanOnFailure?: string[];
    propertiesToRestoreOnSuccess?: string[];
    propertiesToRestoreOnAny?: string[];
    propertiesToRestoreOnFailure?: string[];
    includesToCleanOnSuccess?: string[];
    includesToCleanOnAny?: string[];
    includesToCleanOnFailure?: string[];
    includesToRestoreOnSuccess?: string[];
    includesToRestoreOnAny?: string[];
    includesToRestoreOnFailure?: string[];
    unpokeAfterSuccess?: boolean;
    unpokeAfterAny?: boolean;
    unpokeAfterFailure?: boolean;
    cleanSearchResultsOnSuccess?: boolean;
    cleanSearchResultsOnAny?: boolean;
    cleanSearchResultsOnFailure?: boolean;
}
/**
 * The options for submitting,
 * aka edit, aka add
 */
export interface IActionSubmitOptions extends IActionCleanOptions {
    properties: string[];
    differingOnly?: boolean;
    includes?: string[];
    policies?: PolicyPathType[];
    beforeSubmit?: () => boolean;
}
export interface IActionDeleteOptions extends IActionCleanOptions {
    policies?: PolicyPathType[];
    beforeDelete?: () => boolean;
}
/**
 * The options for searching
 */
export interface IActionSearchOptions extends IActionCleanOptions {
    requestedProperties: string[];
    requestedIncludes?: string[];
    searchByProperties: string[];
    searchByIncludes?: string[];
    orderBy?: IOrderByRuleType;
    createdBy?: number;
    parentedBy?: {
        module: string;
        itemDefinition: string;
        id: number;
        version?: string;
    };
    cachePolicy?: "by-owner" | "by-parent" | "none";
    traditional?: boolean;
    limit: number;
    offset: number;
}
export interface IPokeElementsType {
    properties: string[];
    includes: string[];
    policies: PolicyPathType[];
}
/**
 * The whole item definition context
 */
export interface IItemDefinitionContextType {
    idef: ItemDefinition;
    state: IItemDefinitionStateType;
    forId: number;
    forVersion: string;
    notFound: boolean;
    blocked: boolean;
    blockedButDataAccessible: boolean;
    loadError: EndpointErrorType;
    loading: boolean;
    loaded: boolean;
    submitError: EndpointErrorType;
    submitting: boolean;
    submitted: boolean;
    deleteError: EndpointErrorType;
    deleting: boolean;
    deleted: boolean;
    searchError: EndpointErrorType;
    searching: boolean;
    searchRecords: IGQLSearchRecord[];
    searchResults: IGQLValue[];
    searchLimit: number;
    searchOffset: number;
    searchCount: number;
    searchId: string;
    searchOwner: number;
    searchShouldCache: boolean;
    searchFields: any;
    searchRequestedProperties: string[];
    searchRequestedIncludes: string[];
    pokedElements: IPokeElementsType;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    reload: (denyCache?: boolean) => Promise<IActionResponseWithValue>;
    submit: (options: IActionSubmitOptions) => Promise<IActionResponseWithId>;
    delete: () => Promise<IBasicActionResponse>;
    clean: (options: IActionCleanOptions, state: "success" | "fail", avoidTriggeringUpdate?: boolean) => void;
    search: (options: IActionSearchOptions) => Promise<IActionResponseWithSearchResults>;
    onPropertyChange: (property: PropertyDefinition, value: PropertyDefinitionSupportedType, internalValue: any) => void;
    onPropertyRestore: (property: PropertyDefinition) => void;
    onIncludeSetExclusionState: (include: Include, state: IncludeExclusionState) => void;
    onPropertyEnforce: (property: PropertyDefinition, value: PropertyDefinitionSupportedType, givenForId: number, givenForVersion: string) => void;
    onPropertyClearEnforce: (property: PropertyDefinition, givenForId: number, givenForVersion: string) => void;
    dismissLoadError: () => void;
    dismissSubmitError: () => void;
    dismissSubmitted: () => void;
    dismissDeleteError: () => void;
    dismissDeleted: () => void;
    dismissSearchError: () => void;
    dismissSearchResults: () => void;
    poke: (elements: IPokeElementsType) => void;
    unpoke: () => void;
    remoteListener: RemoteListener;
    injectedParentContext: IItemDefinitionContextType;
    injectSubmitBlockPromise: (arg: Promise<any>) => void;
}
export interface ISearchItemDefinitionValueContextType {
    currentlySearching: IGQLSearchRecord[];
    searchFields: any;
}
export declare const ItemDefinitionContext: React.Context<IItemDefinitionContextType>;
export declare const SearchItemDefinitionValueContext: React.Context<ISearchItemDefinitionValueContextType>;
export interface IItemDefinitionProviderProps {
    /**
     * children that will be feed into the context
     */
    children: React.ReactNode;
    /**
     * the item definition slash/separated/path
     * if you don't specify this, the context will be
     * based on the prop extensions emulated item definition
     */
    itemDefinition?: string | ItemDefinition;
    /**
     * the id, specifying an id makes a huge difference
     */
    forId?: number;
    /**
     * the version
     */
    forVersion?: string;
    /**
     * this is an important flag, if ownership is assumed this means
     * that when automatic fetching of properties it will do so assuming
     * the current user is the owner, so OWNER rules pass, put an example,
     * loading the current user, you have the current user id, and you need
     * to load the user data, if you assume ownership, fields like email will
     * be fetched, without it, they will not be fetched, use this field
     * careful as fetching fields without the right credentials
     * might trigger an error
     */
    assumeOwnership?: boolean;
    /**
     * whether this is about the search counterpart for using
     * with searches, this opens a whole can of worms
     */
    searchCounterpart?: boolean;
    /**
     * some fields, eg. autocompleted ones and unique ones have rest
     * endpoints for them that will run checks, you might want to disable
     * these checks in two circumstances, 1. for efficiency if you don't need them
     * 2. for an UX reason, for example during login, if the field is constantly checking
     * that the external check is unique, for an username, then you will have an annoying
     * error popping on, saying that the username is taken, but you are logging in so that
     * external check is unecessary; note that disabling external checks has no effect
     * if the item definition has no externally checked properties
     */
    disableExternalChecks?: boolean;
    /**
     * automatic search triggers an automatic search when the item mounts
     * or it detects a change in the properties, this basically triggers
     * the .search function with these arguments whenever it is detected
     * it should do so
     */
    automaticSearch?: IActionSearchOptions;
    /**
     * An id for the automatic search first search
     */
    automaticSearchInitialId?: string;
    /**
     * Setters for setting values for the properties within the item definition
     * itself, useful not to depend on mounting at time
     */
    setters?: IPropertySetterProps[];
    /**
     * only downloads and includes the properties specified in the list
     * in the state
     */
    properties?: string[];
    /**
     * only includes the items specified in the list in the state
     */
    includes?: string[];
    /**
     * excludes the policies from being part of the state
     */
    includePolicies?: boolean;
    /**
     * cleans the value from the memory cache once the object dismounts
     * as the memory cache might only grow and grow
     */
    cleanOnDismount?: boolean | IActionCleanOptions;
    /**
     * static components do not update
     * A no listening static item definition will not update on
     * remote changes
     * a total static component does not even ask for feedback
     * it displays what it initially gets, wherever it comes from
     */
    static?: "TOTAL" | "NO_LISTENING";
    /**
     * uses long term caching with the worker cache strategy
     */
    longTermCaching?: boolean;
    /**
     * marks the item for destruction as the user logs out
     */
    markForDestructionOnLogout?: boolean;
    /**
     * avoids running loadValue
     */
    avoidLoading?: boolean;
    /**
     * allows insertion of the parent context within the children
     */
    injectParentContext?: boolean;
}
interface IActualItemDefinitionProviderProps extends IItemDefinitionProviderProps {
    tokenData: ITokenContextType;
    localeData: ILocaleContextType;
    itemDefinitionInstance: ItemDefinition;
    itemDefinitionQualifiedName: string;
    containsExternallyCheckedProperty: boolean;
    remoteListener: RemoteListener;
    searchContext: ISearchItemDefinitionValueContextType;
    injectedParentContext: IItemDefinitionContextType;
    config: IConfigRawJSONDataType;
}
interface IActualItemDefinitionProviderSearchState {
    searchError: EndpointErrorType;
    searching: boolean;
    searchRecords: IGQLSearchRecord[];
    searchResults: IGQLValue[];
    searchLimit: number;
    searchOffset: number;
    searchCount: number;
    searchId: string;
    searchOwner: number;
    searchParent: [string, number, string];
    searchShouldCache: boolean;
    searchRequestedProperties: string[];
    searchRequestedIncludes: string[];
    searchFields: any;
}
interface IActualItemDefinitionProviderState extends IActualItemDefinitionProviderSearchState {
    itemDefinitionState: IItemDefinitionStateType;
    isBlocked: boolean;
    isBlockedButDataIsAccessible: boolean;
    notFound: boolean;
    loadError: EndpointErrorType;
    loading: boolean;
    loaded: boolean;
    submitError: EndpointErrorType;
    submitting: boolean;
    submitted: boolean;
    deleteError: EndpointErrorType;
    deleting: boolean;
    deleted: boolean;
    pokedElements: IPokeElementsType;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
}
/**
 * Here it is, the mighty
 */
export declare class ActualItemDefinitionProvider extends React.Component<IActualItemDefinitionProviderProps, IActualItemDefinitionProviderState> {
    private isUnmounted;
    private hasExecutedInitialSearch;
    private lastLoadingForId;
    private lastLoadingForVersion;
    private lastLoadValuePromise;
    private lastLoadValuePromiseIsResolved;
    private lastLoadValuePromiseResolve;
    static getDerivedStateFromProps(props: IActualItemDefinitionProviderProps, state: IActualItemDefinitionProviderState): {
        state: IItemDefinitionStateType;
    };
    private updateTimeout;
    private lastUpdateId;
    private lastOptionsUsedForSearch;
    private submitBlockPromises;
    constructor(props: IActualItemDefinitionProviderProps);
    setupInitialState(): IActualItemDefinitionProviderState;
    injectSubmitBlockPromise(p: Promise<any>): void;
    markForDestruction(): void;
    installSetters(props?: IActualItemDefinitionProviderProps): void;
    removeSetters(props?: IActualItemDefinitionProviderProps): void;
    componentDidMount(): void;
    setupListeners(): void;
    unSetupListeners(): void;
    shouldComponentUpdate(nextProps: IActualItemDefinitionProviderProps, nextState: IActualItemDefinitionProviderState): boolean;
    componentDidUpdate(prevProps: IActualItemDefinitionProviderProps, prevState: IActualItemDefinitionProviderState): Promise<void>;
    reloadListener(): void;
    changeListener(): void;
    loadValue(denyCache?: boolean): Promise<IActionResponseWithValue>;
    loadValueCompleted(value: ILoadCompletedPayload): IActionResponseWithValue;
    setStateToCurrentValueWithExternalChecking(currentUpdateId: number): Promise<void>;
    onPropertyChangeOrRestoreFinal(): void;
    onPropertyRestore(property: PropertyDefinition): void;
    onPropertyChange(property: PropertyDefinition, value: PropertyDefinitionSupportedType, internalValue: any): void;
    onPropertyEnforce(property: PropertyDefinition, value: PropertyDefinitionSupportedType, givenForId: number, givenForVersion: string, internal?: boolean): void;
    onPropertyClearEnforce(property: PropertyDefinition, givenForId: number, givenForVersion: string, internal?: boolean): void;
    componentWillUnmount(): void;
    onIncludeSetExclusionState(include: Include, state: IncludeExclusionState): void;
    checkItemDefinitionStateValidity(options: {
        properties: string[];
        includes?: string[];
        policies?: PolicyPathType[];
        onlyIncludeIfDiffersFromAppliedValue?: boolean;
    }): boolean;
    giveEmulatedInvalidError(stateApplied: string, withId: boolean, withSearchResults: boolean): IActionResponseWithId | IActionResponseWithValue | IActionResponseWithSearchResults;
    delete(options?: IActionDeleteOptions): Promise<IBasicActionResponse>;
    clean(options: IActionCleanOptions, state: "success" | "fail", avoidTriggeringUpdate?: boolean): void;
    submit(options: IActionSubmitOptions): Promise<IActionResponseWithId>;
    search(options: IActionSearchOptions): Promise<IActionResponseWithSearchResults>;
    dismissLoadError(): void;
    dismissDeleteError(): void;
    dismissSubmitError(): void;
    dismissSubmitted(): void;
    dismissDeleted(): void;
    dismissSearchError(): void;
    onSearchReload(): void;
    removePossibleSearchListeners(props?: IActualItemDefinitionProviderProps, state?: IActualItemDefinitionProviderState): void;
    dismissSearchResults(): void;
    canDelete(): boolean;
    canCreate(): boolean;
    canEdit(): boolean;
    poke(elements: IPokeElementsType): void;
    unpoke(): void;
    render(): JSX.Element;
}
export declare function ItemDefinitionProvider(props: IItemDefinitionProviderProps): JSX.Element;
interface INoStateItemDefinitionProviderProps {
    itemDefinition?: string;
    children?: React.ReactNode;
}
export declare function NoStateItemDefinitionProvider(props: INoStateItemDefinitionProviderProps): JSX.Element;
export declare function ParentItemDefinitionContextProvider(props: {
    children: React.ReactNode;
}): JSX.Element;
export {};
