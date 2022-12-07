/**
 * This file provides a fast prototyping renderer for the reference type, which is basically
 * an integer but acts differently
 * 
 * @module
 */

import React from "react";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { IPropertyEntryReferenceRendererProps, IPropertyEntryReferenceOption } from "../../../internal/components/PropertyEntry/PropertyEntryReference";
import PropertyEntrySelectRenderer from "./PropertyEntrySelect";
import equals from "deep-equal";
import IconButton from "@mui/material/IconButton";
import Alert from '@mui/material/Alert';
import Typography from "@mui/material/Typography";
import RestoreIcon from "@mui/icons-material/Restore";
import ClearIcon from "@mui/icons-material/Clear";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { css as emotionCss } from "@emotion/css";
import { css } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { RestoreIconButton } from "./general";

/**
 * A simple helper function that says when it should show invalid
 * @param props the renderer props
 * @returns a boolean on whether is invalid
 */
function shouldShowInvalid(props: IPropertyEntryReferenceRendererProps) {
  return !props.currentValid;
}

/**
 * The styles for the reference
 */
export const style = {
  entry: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    width: "100%",
  },
  description: {
    width: "100%",
  },
  errorMessage: {
    color: "#f44336",
    height: "1.3rem",
    fontSize: "0.85rem",
  },
  standardAddornment: (isInvalid: boolean) => ({
    color: isInvalid ? "#f44336" : "#424242",
    marginRight: "-10px",
  }),
  smallAddornment: (isInvalid: boolean) => ({
    color: isInvalid ? "#f44336" : "#424242",
  }),
  iconButtonPassword: {
    "backgroundColor": "#2196f3",
    "color": "#fff",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
  },
  iconButton: {
    color: "#424242",
  },
  iconButtonSmall: {
    color: "#424242",
    width: "32px",
    height: "32px",
  },
  textButton: {
    border: "solid 1px rgba(0,0,0,0.1)",
    display: "flex",
    minWidth: "50px",
    height: "50px",
    padding: "0 10px",
    margin: "0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "5px",
  },
  label: (props: IPropertyEntryReferenceRendererProps) => ({
    "color": shouldShowInvalid(props) ? "#f44336" : "rgb(66, 66, 66)",
    "&.focused": {
      color: shouldShowInvalid(props) ? "#f44336" : "#3f51b5",
    },
  }),
  labelSingleLine: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unitDialog: {
    minWidth: "400px",
  },
  unitDialogSubheader: {
    backgroundColor: "white",
    borderBottom: "solid 1px #eee",
  },
  autosuggestContainer: {
    position: "relative",
    display: "block",
    width: "100%",
  },
  autosuggestContainerOpen: {

  },
  autosuggestInput: {

  },
  autosuggestInputOpen: {

  },
  autosuggestSuggestionsContainer: {
    position: "absolute" as "absolute",
    display: "block",
    width: "100%",
    top: "calc(100% - 1.3rem)",
    zIndex: 1000,
  },
  autosuggestSuggestionsContainerOpen: {

  },
  autosuggestSuggestionsList: {

  },
  autosuggestSuggestion: {

  },
  autosuggestFirstSuggestion: {

  },
  autosuggestSuggestionHighlighted: {

  },
  autosuggestSectionContainer: {

  },
  autosuggestFirstSectionContainer: {

  },
  autosuggestSectionTitle: {

  },
  autosuggestMenuItem: {
    height: "auto",
    paddingTop: 4,
    paddingBottom: 8,
  },
  autosuggestMenuItemMainText: {
    fontSize: "1rem",
    lineHeight: "1rem",
  },
  autosuggestMenuItemSubText: {
    fontSize: "0.75rem",
    lineHeight: "0.75rem",
  },
};

/**
 * The actual class for the reference renderer
 */
class PropertyEntryReferenceRenderer
  extends React.Component<IPropertyEntryReferenceRendererProps> {

  private inputRef: HTMLInputElement;

  constructor(props: IPropertyEntryReferenceRendererProps) {
    super(props);

    this.onChangeByHTMLEvent = this.onChangeByHTMLEvent.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderBasicTextField = this.renderBasicTextField.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.catchToggleMouseDownEvent = this.catchToggleMouseDownEvent.bind(this);
    this.renderAutosuggestContainer = this.renderAutosuggestContainer.bind(this);
    this.renderAutosuggestSuggestion = this.renderAutosuggestSuggestion.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.onChangeBySelect = this.onChangeBySelect.bind(this);
  }

  public componentDidMount() {
    if (this.props.autoFocus && this.inputRef) {
      this.inputRef.focus();
    }

    if (this.props.args.selectField) {
      this.props.loadAllPossibleValues(
        this.props.args.selectField,
        this.props.args.preventIds,
        this.props.args.preventEqualityWithProperties,
      );
    }
  }

  public componentDidUpdate(prevProps: IPropertyEntryReferenceRendererProps) {
    if (
      !equals(prevProps.args.preventIds, this.props.args.preventIds, { strict: true }) ||
      !equals(this.props.args.preventEqualityWithProperties, this.props.args.preventEqualityWithProperties, { strict: true })
    ) {
      this.props.refilterPossibleValues(
        this.props.args.preventIds,
        this.props.args.preventEqualityWithProperties,
      );
    }
  }

  /**
   * caches the mouse down event to prevent it from doing
   * anything
   * @param e the mouse event
   */
  public catchToggleMouseDownEvent(e: React.MouseEvent) {
    e.preventDefault();
  }

  /**
   * The change event but by the raw text field
   * @param e the change event
   */
  public onChangeByHTMLEvent(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    this.onChange(e);
  }

  /**
   * Change used with the select element
   * @param value the value it's given
   * we ignore the internal value which is always null
   * for that renderer
   */
  public onChangeBySelect(
    value: string,
  ) {
    if (value === null) {
      this.props.onChange(null, null);
    } else {
      const option = this.props.currentOptions.find((o) => o.id === value);
      this.props.onSelect(option);
    }
  }

  /**
   * the change event that triggers in the autosuggest mode
   * or by default, if not autosuggest override given
   * @param e the event
   * @param autosuggestOverride autosuggest override
   */
  public onChange(
    e: React.ChangeEvent<HTMLInputElement>,
    autosuggestOverride?: Autosuggest.ChangeEvent,
  ) {
    let value: string = null;

    // the autosuggest override has priority
    if (autosuggestOverride) {
      value = autosuggestOverride.newValue;
    } else {
      value = e.target.value.toString();
    }

    // similarly to location
    if (
      value !== this.props.currentTextualValue &&
      autosuggestOverride.method === "type"
    ) {
      // we call the change of search
      this.props.onChangeSearch(value, this.props.args.preventIds, this.props.args.preventEqualityWithProperties);
    }
  }

  /**
   * The event on key down for the text field
   * @param e the event itself
   */
  public onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (this.props.args.onEnter && e.keyCode === 13) {
      this.props.args.onEnter();
    }
  }

  /**
   * Render the basic text field for the reference
   * @param textFieldProps the text field props
   */
  public renderBasicTextField(textFieldProps?: any) {
    const inputMode = "text";

    // these are the inputProps of the small input
    const inputProps = {
      inputMode,
      "aria-describedby": this.props.description ? this.props.uniqueId + "_desc" : null,
    };

    const isInvalid = shouldShowInvalid(this.props);

    // these are the TextField props that are applied
    let appliedTextFieldProps: any = {};
    // these are applied to the Input element
    let appliedInputProps: any = {
      inputRef: (node: HTMLInputElement) => {
        this.inputRef = node;
      },
    };

    if (isInvalid) {
      inputProps["aria-invalid"] = true;

      if (!this.props.args.hideError) {
        inputProps["aria-errormessage"] = this.props.uniqueId + "_error";
      }
    }

    // if there are textFieldProps
    if (textFieldProps) {
      // we need to extract the ref setting
      const { inputRef = () => { return; }, ref, ...other } = textFieldProps;
      // set all the other properties as applied to the TextField
      appliedTextFieldProps = other;

      // and we need to setup the ref setting and rescue our function
      // so that we can have the ref too for the Input
      appliedInputProps = {
        inputRef: (node: HTMLInputElement) => {
          ref(node);
          inputRef(node);

          this.inputRef = node;
        },
      };

      // if there are small inputProps, they will override our inputProps,
      // of the input mode and autocomplete html, so we need to merge them
      if (appliedTextFieldProps.inputProps) {
        appliedTextFieldProps.inputProps = {
          ...inputProps,
          ...appliedTextFieldProps.inputProps,
        };
      }
    }

    if (this.props.canRestore) {
      let icon: React.ReactNode;
      if (this.props.currentAppliedValue) {
        icon = <RestoreIcon />
      } else {
        icon = <ClearIcon />
      }
      appliedInputProps.endAdornment = (
        <InputAdornment
          position="end"
          sx={style.standardAddornment(shouldShowInvalid(this.props))}
        >
          <IconButton
            tabIndex={-1}
            sx={style.iconButton}
            onClick={this.props.onRestore}
            onMouseDown={this.catchToggleMouseDownEvent}
            size="large">
            {icon}
          </IconButton>
        </InputAdornment>
      );
    } else if (this.props.args.icon) {
      // set it at the end
      appliedInputProps.endAdornment = (
        <InputAdornment position="end" sx={style.standardAddornment(shouldShowInvalid(this.props))}>
          <RestoreIconButton
            sx={style.iconButton}
          >
            {this.props.args.icon}
          </RestoreIconButton>
        </InputAdornment>
      );
    }

    const fieldComponent = (
      <TextField
          fullWidth={true}
          type="text"
          sx={style.entry}
          label={this.props.label}
          placeholder={this.props.placeholder}
          value={this.props.currentTextualValue}
          onChange={this.onChangeByHTMLEvent}
          onBlur={this.props.enableUserSetErrors}
          onKeyDown={this.onKeyDown}
          error={isInvalid}
          InputProps={{
            fullWidth: true,
            classes: {
              focused: "focused",
            },
            disabled: this.props.disabled,
            ...appliedInputProps,
            ...this.props.args.inputProps,
          }}
          InputLabelProps={{
            sx: style.label,
            classes: {
              focused: "focused",
            },
          }}
          inputProps={inputProps}
          disabled={this.props.disabled}
          variant={this.props.args.fieldVariant || "filled"}
          {...appliedTextFieldProps}
        />
    );

    const descriptionAsAlert = this.props.args["descriptionAsAlert"];

    let descriptionObject: React.ReactNode = null;
    if (this.props.description) {
      descriptionObject = descriptionAsAlert ? (
        <Alert severity="info" sx={style.description} role="note" id={this.props.uniqueId + "_desc"}>
          {this.props.description}
        </Alert>
      ) : (
        <Typography variant="caption" sx={style.description} id={this.props.uniqueId + "_desc"}>
          {this.props.description}
        </Typography>
      );
    }

    const error = (
      this.props.args.hideError ? null : <Box sx={style.errorMessage} id={this.props.uniqueId + "_error"}>
        {this.props.currentInvalidReason}
      </Box>
    );

    let inner: React.ReactNode;
    if (this.props.args.useCustomFieldRender) {
      inner = this.props.args.useCustomFieldRender(descriptionObject, null, fieldComponent, error, this.props.disabled);
    } else {
      inner = (
        <>
          {descriptionObject}
          {fieldComponent}
          {error}
        </>
      )
    }

    // return the complex overengineered component in all its glory
    return (
      <Box sx={style.container}>
        {inner}
      </Box>
    );
  }

  /**
   * renders the autosuggest container for the reference
   * @param options the autosuggest options
   */
  public renderAutosuggestContainer(
    options: Autosuggest.RenderSuggestionsContainerParams,
  ) {
    // returns the autosuggest container that contains the stuff
    // handled by react autossugest
    return (
      <Paper
        {...options.containerProps}
        square={true}
      >
        {options.children}
      </Paper>
    );
  }

  /**
   * Render the autosuggest suggestion for the reference
   * @param suggestion the suggestion itself
   * @param params the params to use
   */
  public renderAutosuggestSuggestion(
    suggestion: IPropertyEntryReferenceOption,
    params: Autosuggest.RenderSuggestionParams,
  ) {
    // returns a specific suggestion
    const matches = match(suggestion.text, params.query);
    const parts = parse(suggestion.text, matches);

    return (
      <MenuItem
        sx={style.autosuggestMenuItem}
        selected={params.isHighlighted}
        component="div"
        onClick={this.props.onSelect.bind(this, suggestion)}
      >
        <Box sx={style.autosuggestMenuItemMainText}>
          {
            parts.map((part, index) =>
              part.highlight ? (
                <span key={index} style={{ fontWeight: 500 }}>
                  {part.text}
                </span>
              ) : (
                <strong key={index} style={{ fontWeight: 300 }}>
                  {part.text}
                </strong>
              ),
            )
          }
        </Box>
      </MenuItem>
    );
  }

  /**
   * Provides the suggestion value
   * @param suggestion the suggestion itself
   */
  public getSuggestionValue(
    suggestion: IPropertyEntryReferenceOption,
  ) {
    // just return the suggestion value as it will want to
    // be set in the input, we localize it if deemed necessary
    return suggestion.text;
  }

  /**
   * When the suggestion fetch is triggered
   * @param arg the arg
   */
  public onSuggestionsFetchRequested(arg: { value: string, reason: string }) {
    if (arg.reason !== "input-focused") {
      this.props.onChangeSearch(arg.value, this.props.args.preventIds, this.props.args.preventEqualityWithProperties);
    }
  }

  public render() {
    if (this.props.args.selectField) {
      return this.renderAsSelectField();
    }

    return this.renderAsAutosuggest();
  }

  public renderAsSelectField() {
    const values = this.props.currentOptions.map((o) => ({
      i18nValue: o.text,
      value: o.id,
    }));

    // because the option might be missing if we haven't loaded
    // the current options, at least we add the current
    if (this.props.currentValue !== null && !values.find(v => v.value === this.props.currentValue)) {
      values.push({
        i18nValue: this.props.currentTextualValue,
        value: this.props.currentValue,
      });
    }

    const nullValue = {
      i18nValue: this.props.i18nUnspecified,
      value: null as any,
    };
    return (
      <PropertyEntrySelectRenderer
        values={values}
        canRestore={this.props.canRestore}
        currentAppliedValue={this.props.currentAppliedValue}
        currentI18nValue={this.props.currentTextualValue}
        currentValid={this.props.currentValid}
        currentValue={this.props.currentValue}
        currentInternalValue={this.props.currentInternalValue}
        currentInvalidReason={this.props.currentInvalidReason}
        rtl={this.props.rtl}
        uniqueId={this.props.uniqueId}
        propertyId={this.props.propertyId}
        placeholder={this.props.placeholder}
        args={this.props.args}
        label={this.props.label}
        disabled={this.props.disabled}
        autoFocus={this.props.autoFocus}
        onChange={this.onChangeBySelect}
        enableUserSetErrors={this.props.enableUserSetErrors}
        onRestore={this.props.onRestore}
        nullValue={nullValue}
        isNullable={this.props.isNullable}
        isNumeric={false}
        isList={false}
        language={this.props.language}
        languageOverride={this.props.languageOverride}
      />
    );
  }

  /**
   * render function
   */
  public renderAsAutosuggest() {
    const baseTheme = {
      container: css(style.autosuggestContainer as any),
      containerOpen: css(style.autosuggestContainerOpen),
      input: css(style.autosuggestInput),
      inputOpen: css(style.autosuggestInputOpen),
      inputFocused: "focused",
      suggestionsContainer: css(style.autosuggestSuggestionsContainer),
      suggestionsContainerOpen: css(style.autosuggestSuggestionsContainerOpen),
      suggestionsList: css(style.autosuggestSuggestionsList),
      suggestion: css(style.autosuggestSuggestion),
      suggestionFirst: css(style.autosuggestFirstSuggestion),
      suggestionHighlighted: css(style.autosuggestSuggestionHighlighted),
      sectionContainer: css(style.autosuggestSectionContainer),
      sectionContainerFirst: css(style.autosuggestFirstSectionContainer),
      sectionTitle: css(style.autosuggestSectionTitle),
    };

    const rsTheme: any = {};
    Object.keys(baseTheme).forEach((k) => {
      rsTheme[k] = emotionCss(baseTheme[k].styles)
    });

    return (
      <Autosuggest
        renderInputComponent={this.renderBasicTextField}
        renderSuggestionsContainer={this.renderAutosuggestContainer}
        renderSuggestion={this.renderAutosuggestSuggestion}
        getSuggestionValue={this.getSuggestionValue}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.props.onCancel}
        suggestions={this.props.currentOptions}
        theme={rsTheme}
        inputProps={{
          value: this.props.currentInternalValue || this.props.currentTextualValue || "",
          onChange: this.onChange,
          disabled: this.props.disabled,
        }}
      />
    );
  }
}

/**
 * The renderer for the reference type, which basically allows to select an integer
 * for a given reference that represents an item definition somewhere else, the reference
 * type is very powerful and can do tasks of autocomplete and linking
 * 
 * Supported args:
 * 
 * - descriptionAsAlert: displays the description if exists as alert rather than the standard
 * - onEnter: A function that triggers when the enter key is pressed
 */
export default PropertyEntryReferenceRenderer;
