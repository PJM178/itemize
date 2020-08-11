/**
 * Contains the classes for the loading of searches via pages in order to create
 * a pagination in search mode
 *
 * @packageDocumentation
 */

import React from "react";
import SearchLoader, { ISearchLoaderArg } from "./SearchLoader";
import LocationStateReader from "../navigation/LocationStateReader";

/**
 * The paged search loader argument contains info that is rather similar
 * to the generic loader, but simpler
 */
export interface IPagedSearchLoaderArg extends ISearchLoaderArg {
  /**
   * Such as the current page which is the same, note that it's 0 indexed
   */
  currentPage: number;
  /**
   * A function to go to previous page
   */
  goToNextPage: () => void;
  /**
   * A function to go to next
   */
  goToPrevPage: () => void;
  /**
   * And another to go to a specific page number
   */
  goToPage: (n: number) => void;
}

/**
 * The props a paged loader takes are rather simple
 */
interface IPagedSearchLoaderProps {
  /**
   * The page size
   */
  pageSize: number;
  /**
   * And a children that will use the arg for conditional rendering of the pagination element
   */
  children: (arg: IPagedSearchLoaderArg) => React.ReactNode;
}

/**
 * The page search loader component allows for creating pagination UI elements rather
 * simply, it extends the standard search loader for this, it uses the navigation in order
 * to store its page number so that searches are kept consistent
 * 
 * TODO somehow combine with searchId so that going back can also go back in search id
 */
export class PagedSearchLoader extends React.Component<IPagedSearchLoaderProps> {
  constructor(props: IPagedSearchLoaderProps) {
    super(props);

    this.goToNextPage = this.goToNextPage.bind(this);
    this.goToPrevPage = this.goToPrevPage.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this.onSearchDataChange = this.onSearchDataChange.bind(this);
  }
  public goToNextPage(currentPage: number, hasNextPage: boolean, setState: (qs: {p: any}) => void) {
    if (hasNextPage) {
      // current page is 0 indexed whereas the qs parameter is 1 indexed for user understanding
      setState({
        p: (currentPage + 2).toString(),
      });
    }
  }
  public goToPrevPage(currentPage: number, hasPrevPage: boolean, setState: (qs: {p: any}) => void) {
    if (hasPrevPage) {
      // current page is 0 indexed whereas the qs parameter is 1 indexed for user understanding
      setState({
        p: currentPage.toString(),
      });
    }
  }
  public goToPage(setState: (qs: {p: any}) => void, page: number) {
    setState({
      p: (page + 1).toString(),
    });
  }
  public shouldComponentUpdate(nextProps: IPagedSearchLoaderProps) {
    return nextProps.pageSize !== this.props.pageSize ||
      nextProps.children !== this.props.children;
  }
  public onSearchDataChange(actualP: number, setState: (qs: {p: any}) => void) {
    if (actualP !== 0) {
      setState({
        p: "1",
      });
    }
    // load the first page, always despite what current page might be
    return 0;
  }
  public render() {
    return (
      <LocationStateReader defaultState={{ p: "1" }} stateIsInQueryString={true}>
        {(state, setState) => {
          let actualP = parseInt(state.p, 10) || 1;
          actualP--;
          return (
            <SearchLoader
              pageSize={this.props.pageSize}
              currentPage={actualP}
              onSearchDataChange={this.onSearchDataChange.bind(null, actualP, setState)}
            >
              {(arg) => {
                return this.props.children({
                  ...arg,
                  currentPage: actualP,
                  goToNextPage: this.goToNextPage.bind(this, actualP, arg.hasNextPage, setState),
                  goToPrevPage: this.goToPrevPage.bind(this, actualP, arg.hasPrevPage, setState),
                  goToPage: this.goToPage.bind(this, setState),
                });
              }}
            </SearchLoader>
          );
        }}
      </LocationStateReader>
    );
  }
}
