"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_worker_1 = require("./cache.worker");
const constants_1 = require("../../../../constants");
const nanodate_1 = require("../../../../nanodate");
/**
 * An instance version of the error that contains
 * the raw object data of the error
 */
class DataCorruptionError extends Error {
    constructor(message) {
        super(message);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DataCorruptionError.prototype);
    }
}
exports.DataCorruptionError = DataCorruptionError;
async function search(rootProxy, db, searchResults, searchArgs) {
    let newSearchResults = (await Promise.all(searchResults.map(async (result) => {
        try {
            const queryIdentifier = `${constants_1.PREFIX_GET}${result.type}.${result.id}.${result.version || ""}`;
            const value = await db.get(cache_worker_1.QUERIES_TABLE_NAME, queryIdentifier);
            if (!value) {
                // This means data corruption, we cancel everything, data is corrupted
                throw new DataCorruptionError("Search function was executed with missing value for " + queryIdentifier);
            }
            else if (value.value === null) {
                return null;
            }
            else {
                const checkedValue = await checkOne(rootProxy, result, value.value, searchArgs);
                if (!checkedValue.shouldBeIncluded) {
                    return null;
                }
                return checkedValue;
            }
        }
        catch (err) {
            console.error(err);
            // pipe the data corruption error, we need to refetch we can fix this
            if (err instanceof DataCorruptionError) {
                throw err;
            }
            return null;
        }
    }))).filter((r) => !!r);
    const orderBy = searchArgs.orderBy;
    const orderBySorted = Object.keys(orderBy).map((orderByProperty) => {
        return {
            property: orderByProperty,
            priority: orderBy[orderByProperty].priority,
            nulls: orderBy[orderByProperty].nulls,
            direction: orderBy[orderByProperty].direction,
        };
    }).sort((a, b) => a.priority - b.priority);
    orderBySorted.forEach((sortRule) => {
        if (sortRule.property === "created_at" || sortRule.property === "edited_at") {
            newSearchResults = newSearchResults.sort((a, b) => {
                // remember if there's no value.DATA or the item is null or whatever
                // it would have never gotten here
                const aValue = a.value.DATA[sortRule.property];
                const bValue = b.value.DATA[sortRule.property];
                // however the value itself can be null
                if (aValue === bValue) {
                    return 0;
                }
                else if (aValue === null) {
                    return sortRule.nulls === "last" ? 1 : -1;
                }
                else if (bValue === null) {
                    return sortRule.nulls === "last" ? -1 : 1;
                }
                const aComposed = new nanodate_1.NanoSecondComposedDate(aValue);
                const bComposed = new nanodate_1.NanoSecondComposedDate(bValue);
                if (aComposed.greaterThan(bComposed)) {
                    return -1;
                }
                else {
                    return 1;
                }
            });
            return;
        }
        newSearchResults = newSearchResults.sort((a, b) => {
            // remember if there's no value.DATA or the item is null or whatever
            // it would have never gotten here
            const aValue = a.value.DATA[sortRule.property];
            const bValue = b.value.DATA[sortRule.property];
            const itemDefinition = rootProxy.registry[a.searchResult.type];
            const property = itemDefinition.getPropertyDefinitionFor(sortRule.property, true);
            const description = property.getPropertyDefinitionDescription();
            if (!description.localOrderBy) {
                return 0;
            }
            return description.localOrderBy(sortRule.direction, sortRule.nulls, aValue, bValue);
        });
    });
    return newSearchResults.map((r) => r.searchResult);
}
exports.search = search;
async function checkOne(rootProxy, searchResult, value, searchArgs) {
    // so by default we included
    let shouldBeIncluded = true;
    // if there is no value, aka the item has been deleted
    if (!value) {
        shouldBeIncluded = false;
        // if there is no DATA aka the item is blocked
    }
    else if (!value.DATA) {
        shouldBeIncluded = false;
    }
    // otherwise if it passed that, let's check more specifically
    if (shouldBeIncluded) {
        // let's get the item definition this search is about
        const itemDefinition = rootProxy.registry[searchResult.type];
        // now we check every single property using the local search
        shouldBeIncluded = itemDefinition.getAllPropertyDefinitionsAndExtensions().every((pd) => {
            if (!pd.isSearchable()) {
                return true;
            }
            const description = pd.getPropertyDefinitionDescription();
            return description.localSearch(searchArgs, value, pd.getId(), null);
        });
        // and now we consider whether it should be included by includes if it passed all that
        if (shouldBeIncluded) {
            // so now we get all includes
            shouldBeIncluded = itemDefinition.getAllIncludes().every((i) => {
                // the expected exclusion state
                const expectedIncludeExclusionState = searchArgs[i.getQualifiedExclusionStateIdentifier()];
                // and the one that it currently has
                const appliedIncludeExclusionState = value[i.getQualifiedExclusionStateIdentifier()];
                // if we don't expect anything then this is basically true
                if (typeof expectedIncludeExclusionState === "undefined") {
                    return true;
                    // if we don't spect any state, but rather an specific one, and it doesn't match we return null
                }
                else if (expectedIncludeExclusionState !== "ANY" &&
                    appliedIncludeExclusionState !== expectedIncludeExclusionState) {
                    return false;
                }
                // otherwise if we expect ANY or INCLUDED and it's not excluded, we check every single property
                if (expectedIncludeExclusionState !== "EXCLUDED" && appliedIncludeExclusionState !== "EXCLUDED") {
                    return i.getSinkingProperties().every((sp) => {
                        if (!sp.isSearchable()) {
                            return true;
                        }
                        const sinkingDescription = sp.getPropertyDefinitionDescription();
                        return sinkingDescription.localSearch(searchArgs, value, sp.getId(), i.getId());
                    });
                }
                // this will occur if it's ANY and it's EXCLUDED
                return true;
            });
        }
    }
    return {
        shouldBeIncluded,
        value,
        searchResult,
    };
}