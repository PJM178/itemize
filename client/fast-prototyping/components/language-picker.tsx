/**
 * The language picker component allows the user to choose a language and update the app
 *
 * @packageDocumentation
 */

import React from "react";
import { capitalize } from "../../components/localization";
import { Button, Menu, MenuItem, TranslateIcon } from "../mui-core";
import AppLanguageRetriever from "../../components/localization/AppLanguageRetriever";

/**
 * The props of the language picker, a bit different from other pickers
 */
interface ILanguagePickerProps {
  /**
   * The class name
   */
  className?: string;
  /**
   * Whether to use the code, rather than the name that it was given to them
   */
  useCode?: boolean;
  /**
   * whether to use a display that is able to shrink, one contains the
   * standard native name, and the other contains only the language code
   */
  shrinkingDisplay?: boolean;
  /**
   * This is the class name that contains the standard language native
   * name, it should be invisible when the shrunk is visible
   */
  shrinkingDisplayStandardClassName?: string;
  /**
   * This is the class name that contains the shrunk code only name,
   * it should be visible when the standard is visible
   */
  shrinkingDisplayShrunkClassName?: string;
}

/**
 * The language picker state
 */
interface ILanguagePickerState {
  anchorEl: HTMLElement;
}

/**
 * Allows the user to choose a language from the language list
 * 
 * Because there aren't usually many languages this picker tends to be rather lightweight however
 * it still remains unmounted by default
 */
export class LanguagePicker extends React.Component<ILanguagePickerProps, ILanguagePickerState> {
  constructor(props: ILanguagePickerProps) {
    super(props);

    this.state = {
      anchorEl: null,
    };

    this.handleButtonSelectClick = this.handleButtonSelectClick.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }
  public handleButtonSelectClick(e: React.MouseEvent<HTMLButtonElement>) {
    this.setState({
      anchorEl: e.currentTarget,
    });
  }
  public handleMenuClose() {
    this.setState({
      anchorEl: null,
    });
  }
  public handleLanguageChange(changeLanguageToFn: (code: string) => void, code: string) {
    this.setState({
      anchorEl: null,
    });
    changeLanguageToFn(code);
  }
  public render() {
    return (
      <AppLanguageRetriever>
        {(languageData) => {
          const menu = this.state.anchorEl ? <Menu
            anchorEl={this.state.anchorEl}
            keepMounted={false}
            open={!!this.state.anchorEl}
            onClose={this.handleMenuClose}
          >
            {languageData.availableLanguages.map((al) => (
              <MenuItem
                key={al.code}
                selected={al.code === languageData.currentLanguage.code}
                onClick={this.handleLanguageChange.bind(this, languageData.changeLanguageTo, al.code)}
              >
                {capitalize(al.name)}
              </MenuItem>
            ))}
          </Menu> : null;
          return (
            <React.Fragment>
              <Button
                classes={{ root: this.props.className }}
                color="inherit"
                startIcon={<TranslateIcon />}
                onClick={this.handleButtonSelectClick}
              >
                {
                  !this.props.shrinkingDisplay ?
                    (this.props.useCode ? languageData.currentLanguage.code : languageData.currentLanguage.name) :
                    <React.Fragment>
                      <span className={this.props.shrinkingDisplayStandardClassName}>{languageData.currentLanguage.name}</span>
                      <span className={this.props.shrinkingDisplayShrunkClassName}>{languageData.currentLanguage.code}</span>
                    </React.Fragment>
                }
              </Button>
              {menu}
            </React.Fragment>
          );
        }}
      </AppLanguageRetriever>
    );
  }
}
