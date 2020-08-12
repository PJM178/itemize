"use strict";
/**
 * Provides the functionality to load search results that have been obtained via the
 * item definition context and reside in such context but haven't been loaded
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const item_definition_1 = require("../../providers/item-definition");
const deep_equal_1 = __importDefault(require("deep-equal"));
const constants_1 = require("../../../constants");
const cache_1 = __importDefault(require("../../internal/workers/cache"));
const gql_util_1 = require("../../../gql-util");
const gql_querier_1 = require("../../../gql-querier");
const locale_provider_1 = require("../../internal/providers/locale-provider");
const token_provider_1 = require("../../internal/providers/token-provider");
/**
 * The actual search loader class which contains the actual logic
 */
class ActualSearchLoader extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.dismissError = this.dismissError.bind(this);
        this.refreshPage = this.refreshPage.bind(this);
        // now by default it's nothing like this
        this.state = {
            currentlySearching: [],
            searchFields: {},
            currentSearchRecords: [],
            error: null,
        };
    }
    componentDidMount() {
        // on mounting we call a refresh of the page
        this.refreshPage();
    }
    componentDidUpdate(prevProps) {
        // on update we must seek what the current page is to
        // see if something changes
        let currentPage = this.props.currentPage;
        // if this is a new search
        if (prevProps.searchId !== this.props.searchId) {
            // if we have this function we call it
            if (this.props.onSearchDataChange) {
                // to get the actual page we are meant to load
                const newPage = this.props.onSearchDataChange(this.props.searchId, this.props.searchWasRestored);
                if (typeof newPage === "number") {
                    currentPage = newPage;
                }
            }
        }
        // and then we slice our records to see what we need to load
        const currentSearchRecords = (this.props.searchRecords || []).slice(this.props.pageSize * currentPage, this.props.pageSize * (currentPage + 1));
        // if it doesn't equal what we currently have loaded
        if (!deep_equal_1.default(this.state.currentSearchRecords, currentSearchRecords)) {
            // then we load the values
            this.loadValues(currentSearchRecords);
        }
    }
    refreshPage() {
        // a refresh will reload regardless
        const currentSearchRecords = (this.props.searchRecords || []).slice(this.props.pageSize * this.props.currentPage, this.props.pageSize * (this.props.currentPage + 1));
        this.loadValues(currentSearchRecords);
    }
    dismissError() {
        this.setState({
            error: null,
        });
    }
    async loadValues(currentSearchRecords) {
        // if we have no search id we have nothing to search for
        if (!this.props.searchId) {
            return;
        }
        // this happens for traditional search, we dont need to
        // do a second re-request round
        if (this.props.searchResults) {
            const root = this.props.itemDefinitionInstance.getParentModule().getParentRoot();
            this.props.searchResults.forEach((sr) => {
                const itemDefintionInQuestion = root.registry[sr.type];
                // we apply the value, whatever we have gotten this will affect all the instances
                // that use the same value
                itemDefintionInQuestion.applyValue(sr.id, sr.version, sr, false, this.props.tokenData.id, this.props.tokenData.role, this.props.searchFields, true);
                // and then we trigger the change listener for all the instances
                itemDefintionInQuestion.triggerListeners("change", sr.id, sr.version);
            });
            // now we set the state, notice that it started with something else
            // and as such currentSearchRecord will use the value that we have applied
            // from memory as it is its new state for its given slot
            // due to the cache worker functionality in fact these results will be cached
            // according to the props that are passed to them during the loadValue
            // as they realize they are already loaded in memory
            // this serves a double purpose both for SSR and this, which works the same way
            this.setState({
                error: null,
                currentlySearching: [],
                currentSearchRecords,
                searchFields: this.props.searchFields,
            });
            return;
        }
        // but now we are back to the standard mode
        // for that we need to get the standard counterpart, as we are supposed
        // to be in a search mode item definition context
        const standardCounterpart = this.props.itemDefinitionInstance.getStandardCounterpart();
        // and then we set the state, and what we are currently searching, as those records
        this.setState({
            error: null,
            currentlySearching: currentSearchRecords,
            currentSearchRecords,
            searchFields: this.props.searchFields,
        });
        // now we need to build the query for getting this information
        const queryBase = (standardCounterpart.isExtensionsInstance() ?
            standardCounterpart.getParentModule().getQualifiedPathName() :
            standardCounterpart.getQualifiedPathName());
        // and use the GET_LIST to build that query
        const getListQueryName = constants_1.PREFIX_GET_LIST + queryBase;
        // and now we need to request
        const uncachedResults = [];
        // first we try to request our indexeddb worker cache and memory cache, one by one
        const workerCachedResults = await Promise.all(currentSearchRecords.map(async (searchResult) => {
            // note that our records might be different to the context we are in
            const itemDefintionInQuestion = this.props.itemDefinitionInstance.getParentModule()
                .getParentRoot().registry[searchResult.type];
            // check if it's in memory cache, in such a case the value will have already loaded
            // as the item definition would have applied it initially, as in it would have loaded
            // already and it can be pretty much ignored
            const appliedGQLValue = itemDefintionInQuestion.getGQLAppliedValue(searchResult.id, searchResult.version);
            if (appliedGQLValue &&
                gql_util_1.requestFieldsAreContained(this.props.searchFields, appliedGQLValue.requestFields)) {
                return null;
            }
            // otherwise let's see our cache
            // if it's not supported then we push already to our uncached results
            if (!cache_1.default.isSupported) {
                uncachedResults.push(searchResult);
                return null;
            }
            else {
                // otherwise let's try to get it
                const cachedResult = await cache_1.default.instance.getCachedValue(constants_1.PREFIX_GET + itemDefintionInQuestion.getQualifiedPathName(), searchResult.id, searchResult.version, this.props.searchFields);
                // if we get nothing
                if (!cachedResult) {
                    // then it's uncached
                    uncachedResults.push(searchResult);
                    return null;
                }
                // otherwise let's return the full match
                return {
                    cachedResult,
                    forId: searchResult.id,
                    forType: searchResult.type,
                    forVersion: searchResult.version,
                };
            }
        }));
        // now what we are left are these uncached results
        this.setState({
            currentlySearching: uncachedResults,
        });
        // we need to check our worker cache results
        workerCachedResults.forEach((cr) => {
            // if we have one
            if (cr) {
                // then we try to get such item definition
                const itemDefintionInQuestion = this.props.itemDefinitionInstance.getParentModule()
                    .getParentRoot().registry[cr.forType];
                // and if we have a value at all, because it might as well just be null
                if (cr.cachedResult.value) {
                    // we apply the value, whatever we have gotten this will affect all the instances
                    // that use the same value
                    itemDefintionInQuestion.applyValue(cr.forId, cr.forVersion, cr.cachedResult.value, false, this.props.tokenData.id, this.props.tokenData.role, cr.cachedResult.fields, true);
                    // and then we trigger the change listener for all the instances
                    itemDefintionInQuestion.triggerListeners("change", cr.forId, cr.forVersion);
                }
                else {
                    // otherwise if it was indeed null, we clean the value
                    itemDefintionInQuestion.cleanValueFor(cr.forId, cr.forVersion);
                    // and also trigger change
                    itemDefintionInQuestion.triggerListeners("change", cr.forId, cr.forVersion);
                }
                // and then we ask for feedback for this using our
                // remote listener, as the item definition provider not having loaded
                // and having aborted won't do that for us
                this.props.remoteListener.requestFeedbackFor({
                    itemDefinition: itemDefintionInQuestion.getQualifiedPathName(),
                    id: cr.forId,
                    version: cr.forVersion,
                });
            }
        });
        // now let's go back to our uncached results
        if (uncachedResults.length) {
            // and we prepare the request
            const args = {
                token: this.props.tokenData.token,
                language: this.props.localeData.language.split("-")[0],
                records: uncachedResults,
            };
            // if we have a search owner we add it as it's necessary or otherwise
            // it might get forbidden
            if (this.props.searchOwner) {
                args.created_by = this.props.searchOwner;
            }
            // and now we make a grapqhl query for this
            const listQuery = gql_querier_1.buildGqlQuery({
                name: getListQueryName,
                args,
                fields: {
                    results: this.props.searchFields,
                },
            });
            // and then we get the value
            const gqlValue = await gql_querier_1.gqlQuery(listQuery);
            // now we got to check for errors
            let error = null;
            if (gqlValue.errors) {
                // if the server itself returned an error, we use that error
                error = gqlValue.errors[0].extensions;
            }
            // now we set these so that once
            // we apply the values below and load value is triggered
            // in the provider it actually succeeds loading and doesn't abort
            this.setState({
                error,
                currentlySearching: [],
            });
            // now we need to see if we got information
            if (!error &&
                gqlValue &&
                gqlValue.data &&
                gqlValue.data[getListQueryName] &&
                gqlValue.data[getListQueryName].results) {
                // and we loop into them
                gqlValue.data[getListQueryName].results.forEach((value, index) => {
                    // get these basic details for each one of these results
                    const forId = uncachedResults[index].id;
                    const forVersion = uncachedResults[index].version;
                    const forType = uncachedResults[index].type;
                    // and now the item definition that we are referring to from the registry
                    const itemDefintionInQuestion = this.props.itemDefinitionInstance.getParentModule()
                        .getParentRoot().registry[forType];
                    // the value that we are applying (which can be null) we make a copy of it
                    let valueToApply = value ? {
                        ...value,
                    } : value;
                    // if there's no value
                    if (!valueToApply) {
                        // we clean the thing and trigger the listeners
                        itemDefintionInQuestion.cleanValueFor(forId, forVersion);
                        itemDefintionInQuestion.triggerListeners("change", forId, forVersion);
                    }
                    else {
                        // otherwise we will see, first the search fields we used
                        let mergedQueryFields = this.props.searchFields;
                        // we try to get the current applied value, in case there's any
                        const appliedGQLValue = itemDefintionInQuestion.getGQLAppliedValue(value.id, value.version);
                        // and if we have one, which matches our last modified date
                        if (appliedGQLValue &&
                            appliedGQLValue.rawValue &&
                            appliedGQLValue.rawValue.last_modified === valueToApply.last_modified) {
                            // then we merge our values togethe in the value to apply
                            valueToApply = gql_util_1.deepMerge(valueToApply, appliedGQLValue.rawValue);
                            // and we do that as well for the fields
                            mergedQueryFields = gql_util_1.deepMerge(this.props.searchFields, appliedGQLValue.requestFields);
                        }
                        // we apply such thing here
                        itemDefintionInQuestion.applyValue(valueToApply.id, valueToApply.version, valueToApply, false, this.props.tokenData.id, this.props.tokenData.role, mergedQueryFields, true);
                        // and trigger the listeners for change
                        itemDefintionInQuestion.triggerListeners("change", forId, forVersion);
                    }
                });
            }
        }
        else {
            // otherwise if there's nothing left from the uncached
            // results and we had everything cached, then no error, and nothing being searched
            this.setState({
                error: null,
                currentlySearching: [],
            });
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        // it might seem odd but we only really update
        // the values if we recieve a different search id
        // for efficiency reasons any change in any parameter of the search
        // results in a different search id
        return nextProps.pageSize !== this.props.pageSize ||
            nextProps.currentPage !== this.props.currentPage ||
            nextProps.children !== this.props.children ||
            nextProps.itemDefinitionInstance !== this.props.itemDefinitionInstance ||
            nextProps.tokenData.id !== this.props.tokenData.id ||
            nextProps.tokenData.role !== this.props.tokenData.role ||
            nextProps.localeData !== this.props.localeData ||
            // note here as well, we only really do reprocess the search and the
            // arguments of the search if we receive a different search id
            nextProps.searchId !== this.props.searchId ||
            !deep_equal_1.default(this.state, nextState);
    }
    render() {
        // the accessible count is just the length of the search records
        const accessibleCount = (this.props.searchRecords || []).length;
        // the page count, is the top from the page size, or 0 if accessible count is 0
        const pageCount = accessibleCount === 0 ? 0 : Math.ceil(accessibleCount / this.props.pageSize);
        // the total count is the search count or 0, the search count is a count(*) from the database
        const totalCount = this.props.searchCount || 0;
        // now we return, for that we must make a new provider context with what
        // we are currently searching and our search fields that we are searching for
        // so the item definition provider knows this and aborts loading values needlessly
        return (react_1.default.createElement(item_definition_1.SearchItemDefinitionValueContext.Provider, { value: {
                currentlySearching: this.state.currentlySearching,
                searchFields: this.state.searchFields,
            } }, this.props.children({
            searchRecords: this.state.error ? [] : this.state.currentSearchRecords.map((searchRecord) => {
                // note how our search records here are special first we nee the matching item definition
                // of the record
                const itemDefinition = this.props.itemDefinitionInstance
                    .getParentModule().getParentRoot().registry[searchRecord.type];
                // and we add something called the provider props, which explains how to instantiate
                // a item definition provider so that it's in sync with this seach and loads what this search
                // says, while it's possible to come with it manually, this makes it easier
                return {
                    ...searchRecord,
                    providerProps: {
                        key: itemDefinition.getQualifiedPathName() + "." + searchRecord.id + "." + (searchRecord.version || ""),
                        forId: searchRecord.id,
                        forVersion: searchRecord.version,
                        itemDefinition: searchRecord.type,
                        properties: this.props.searchRequestedProperties,
                        includes: this.props.searchRequestedIncludes,
                        includePolicies: this.props.includePolicies,
                        cleanOnDismount: this.props.cleanOnDismount,
                        static: this.props.static,
                        longTermCaching: this.props.searchShouldCache,
                        disableExternalChecks: this.props.disableExternalChecks,
                    },
                    itemDefinition,
                };
            }),
            pageCount,
            accessibleCount,
            totalCount,
            hasNextPage: this.props.currentPage < pageCount - 1,
            hasPrevPage: this.props.currentPage !== 0,
            error: this.state.error,
            dismissError: this.dismissError,
            refreshPage: this.refreshPage,
            searchId: this.props.searchId,
        })));
    }
}
/**
 * The search loader allows to load search results
 * @param props the loader props
 * @returns a react component
 */
function SearchLoader(props) {
    return (react_1.default.createElement(locale_provider_1.LocaleContext.Consumer, null, (localeData) => (react_1.default.createElement(token_provider_1.TokenContext.Consumer, null, (tokenData) => (react_1.default.createElement(item_definition_1.ItemDefinitionContext.Consumer, null, (itemDefinitionContext) => (react_1.default.createElement(ActualSearchLoader, Object.assign({}, props, { itemDefinitionInstance: itemDefinitionContext.idef, remoteListener: itemDefinitionContext.remoteListener, searchId: itemDefinitionContext.searchId, searchWasRestored: itemDefinitionContext.searchWasRestored, searchRecords: itemDefinitionContext.searchRecords, searchResults: itemDefinitionContext.searchResults, searchCount: itemDefinitionContext.searchCount, searchOffset: itemDefinitionContext.searchOffset, searchLimit: itemDefinitionContext.searchLimit, searchOwner: itemDefinitionContext.searchOwner, searchShouldCache: itemDefinitionContext.searchShouldCache, searchRequestedIncludes: itemDefinitionContext.searchRequestedIncludes, searchRequestedProperties: itemDefinitionContext.searchRequestedProperties, searchFields: itemDefinitionContext.searchFields, tokenData: tokenData, localeData: localeData })))))))));
}
exports.default = SearchLoader;
