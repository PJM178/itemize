"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const index_1 = require("../../mui-core/index");
function shouldShowInvalid(props) {
    return !props.currentValid;
}
exports.style = index_1.createStyles({
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
    standardAddornment: (props) => ({
        color: shouldShowInvalid(props) ? "#f44336" : "#424242",
        marginRight: "-10px",
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
    label: (props) => ({
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
    fieldInput: (props) => {
        if (shouldShowInvalid(props)) {
            return {
                "width": "100%",
                // this is the colur when the field is out of focus
                "&::before": {
                    borderBottomColor: "#e57373",
                },
                // the color that pops up when the field is in focus
                "&::after": {
                    borderBottomColor: "#f44336",
                },
                // during the hover event
                "&:hover::before": {
                    borderBottomColor: props.disabled ? "rgba(0,0,0,0.42)" : "#f44336",
                },
            };
        }
        return {
            "width": "100%",
            "&::before": {
                borderBottomColor: "rgba(0,0,0,0.42)",
            },
            "&::after": {
                borderBottomColor: "#3f51b5",
            },
            "&:hover::before": {
                borderBottomColor: "#3f51b5",
            },
        };
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
});
function SelectUnitDialog(props) {
    const closeAndChangeUnit = (unit) => {
        props.onClose();
        props.onChangeUnit(unit);
    };
    return (react_1.default.createElement(index_1.Dialog, { classes: {
            paper: "props.dialogClassName",
        }, open: props.open, onClose: props.onClose, "aria-labelledby": "unit-dialog-title", fullScreen: props.fullScreen },
        react_1.default.createElement(index_1.DialogTitle, { id: "unit-dialog-title" }, props.unitI18n.title),
        react_1.default.createElement("div", null,
            react_1.default.createElement(index_1.List, null,
                react_1.default.createElement(index_1.ListItem, { selected: props.unitPrimary === props.unit, button: true, onClick: closeAndChangeUnit.bind(null, props.unitPrimary) },
                    react_1.default.createElement(index_1.ListItemText, { primary: props.unitToNode(props.unitPrimary) })),
                react_1.default.createElement(index_1.ListItem, { selected: props.unitPrimaryImperial === props.unit, button: true, onClick: closeAndChangeUnit.bind(null, props.unitPrimaryImperial) },
                    react_1.default.createElement(index_1.ListItemText, { primary: props.unitToNode(props.unitPrimaryImperial) }))),
            !props.unitIsLockedToPrimaries ? react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(index_1.Divider, null),
                react_1.default.createElement(index_1.List, { subheader: react_1.default.createElement(index_1.ListSubheader, { classes: { root: "props.subheaderClassName" } }, props.unitI18n.others) }, (props.unitPrefersImperial ? props.unitImperialOptions : props.unitOptions).map((unit) => (react_1.default.createElement(index_1.ListItem, { selected: unit === props.unit, button: true, onClick: closeAndChangeUnit.bind(null, unit), key: unit },
                    react_1.default.createElement(index_1.ListItemText, { primary: props.unitToNode(unit) }))))),
                react_1.default.createElement(index_1.Divider, null),
                react_1.default.createElement(index_1.List, { subheader: react_1.default.createElement(index_1.ListSubheader, { classes: { root: "props.subheaderClassName" } }, props.unitPrefersImperial ? props.unitI18n.metric : props.unitI18n.imperial) }, (props.unitPrefersImperial ? props.unitOptions : props.unitImperialOptions).map((unit) => (react_1.default.createElement(index_1.ListItem, { selected: unit === props.unit, button: true, onClick: closeAndChangeUnit.bind(null, unit), key: unit },
                    react_1.default.createElement(index_1.ListItemText, { primary: props.unitToNode(unit) })))))) : null)));
}
const SelectUnitDialogResponsive = index_1.withMobileDialog()(SelectUnitDialog);
class ActualPropertyEntryFieldRenderer extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.type !== "password",
            unitDialogOpen: false,
        };
        this.toggleVisible = this.toggleVisible.bind(this);
        this.catchToggleMouseDownEvent = this.catchToggleMouseDownEvent.bind(this);
        this.onChangeByHTMLEvent = this.onChangeByHTMLEvent.bind(this);
        this.onChange = this.onChange.bind(this);
        this.renderBasicTextField = this.renderBasicTextField.bind(this);
        this.closeUnitDialog = this.closeUnitDialog.bind(this);
        this.openUnitDialog = this.openUnitDialog.bind(this);
        // this.renderAutosuggestContainer = this.renderAutosuggestContainer.bind(this);
        // this.renderAutosuggestField = this.renderAutosuggestField.bind(this);
        // this.renderAutosuggestSuggestion = this.renderAutosuggestSuggestion.bind(this);
        // this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        // this.getSuggestionValue = this.getSuggestionValue.bind(this);
    }
    componentDidMount() {
        if (this.props.autoFocus && this.inputRef) {
            this.inputRef.focus();
        }
    }
    toggleVisible(e) {
        e.preventDefault();
        this.setState({
            visible: !this.state.visible,
        });
        if (this.inputRef) {
            // we focus
            this.inputRef.focus();
            // BUG in latest chrome causes the input caret location
            // to be lost so we need to gain the location again
            // now we check we can set the caret
            // This is unecessary in FF and other browsers
            if (typeof this.inputRefSelectionStart !== "undefined" &&
                typeof this.inputRef.setSelectionRange !== "undefined") {
                // We need to do it in a timeout of 0 because chrome reports
                // the wrong caret location and will refuse to update otherwise
                // adding this as a side effect say as a callback of setState
                // does not work, only this works...
                setTimeout(() => {
                    this.inputRef.setSelectionRange(this.inputRefSelectionStart, this.inputRefSelectionStart);
                }, 0);
            }
        }
    }
    catchToggleMouseDownEvent(e) {
        e.preventDefault();
        // BUG in latest chrome causes the input caret location to be lost
        // the so we save the location of the caret
        if (this.inputRef && typeof this.inputRef.selectionStart !== "undefined") {
            this.inputRefSelectionStart = this.inputRef.selectionStart;
        }
    }
    render() {
        // if (this.props.autocompleteMode) {
        //   return this.renderAutosuggestField();
        // }
        return this.renderBasicTextField();
    }
    onChangeByHTMLEvent(e) {
        this.onChange(e);
    }
    onChange(e, autosuggestOverride) {
        // the change has two values, a textual value, and a
        // numeric value, texual value is always set but
        // numeric value is only set for numbers
        let value = null;
        let internalValue = null;
        // the autosuggest override has priority
        if (autosuggestOverride) {
            value = autosuggestOverride.newValue;
            internalValue = value;
        }
        else {
            value = e.target.value.toString();
            internalValue = value;
        }
        if (this.props.isNumericType) {
            this.props.onChangeByNumber(value);
            return;
        }
        this.props.onChange(value, internalValue);
    }
    openUnitDialog() {
        this.setState({
            unitDialogOpen: true,
        });
    }
    closeUnitDialog() {
        this.setState({
            unitDialogOpen: false,
        });
    }
    renderBasicTextField(textFieldProps) {
        // set the input mode, this is for mobile,
        // basically according to our input we need
        // different keys
        let inputMode = "text";
        if (this.props.subtype === "email") {
            inputMode = "email";
        }
        // these are the inputProps of the small input
        const inputProps = {
            inputMode,
            autoComplete: this.props.htmlAutocomplete,
        };
        // these are the TextField props that are applied
        let appliedTextFieldProps = {};
        // these are applied to the Input element
        let appliedInputProps = {
            inputRef: (node) => {
                this.inputRef = node;
            },
        };
        // if there are textFieldProps
        if (textFieldProps) {
            // we need to extract the ref setting
            const { inputRef = () => { return; }, ref, ...other } = textFieldProps;
            // set all the other properties as applied to the TextField
            appliedTextFieldProps = other;
            // and we need to setup the ref setting and rescue our function
            // so that we can have the ref too for the Input
            appliedInputProps = {
                inputRef: (node) => {
                    ref(node);
                    inputRef(node);
                    this.inputRef = node;
                },
            };
            // if we have a className, it will inevitably override our class name
            // but we need ours too, so let's merge it in the TextField
            if (appliedTextFieldProps.className) {
                appliedTextFieldProps.className += " " + this.props.classes.entry;
            }
            // if there are small inputProps, they will override our inputProps,
            // of the input mode and autocomplete html, so we need to merge them
            if (appliedTextFieldProps.inputProps) {
                appliedTextFieldProps.inputProps = {
                    ...inputProps,
                    ...appliedTextFieldProps.inputProps,
                };
            }
        }
        // if the type is a password
        if (this.props.type === "password") {
            // set the end addornment for the show and hide button
            appliedInputProps.endAdornment = (react_1.default.createElement(index_1.InputAdornment, { position: "end", className: this.props.classes.standardAddornment },
                react_1.default.createElement(index_1.IconButton, { tabIndex: -1, classes: { root: this.props.classes.iconButton }, onClick: this.toggleVisible, onMouseDown: this.catchToggleMouseDownEvent }, this.state.visible ? react_1.default.createElement(index_1.IconVisibility, null) : react_1.default.createElement(index_1.IconVisibilityOff, null))));
        }
        else if (this.props.type === "currency") {
            if (this.props.currencyFormat === "$N") {
                appliedInputProps.startAdornent = (react_1.default.createElement(index_1.InputAdornment, { position: "start", className: this.props.classes.standardAddornment },
                    react_1.default.createElement(index_1.IconButton, { tabIndex: -1, classes: { root: this.props.classes.iconButton }, onMouseDown: this.catchToggleMouseDownEvent }, this.props.currency.symbol)));
            }
            else {
                appliedInputProps.endAdornment = (react_1.default.createElement(index_1.InputAdornment, { position: "end", className: this.props.classes.standardAddornment },
                    react_1.default.createElement(index_1.IconButton, { tabIndex: -1, classes: { root: this.props.classes.iconButton }, onMouseDown: this.catchToggleMouseDownEvent }, this.props.currency.symbol)));
            }
        }
        else if (this.props.type === "unit") {
            appliedInputProps.endAdornment = (react_1.default.createElement(index_1.InputAdornment, { position: "end", className: this.props.classes.standardAddornment },
                react_1.default.createElement(index_1.IconButton, { tabIndex: -1, classes: { root: this.props.classes.iconButton }, onMouseDown: this.catchToggleMouseDownEvent, onClick: this.openUnitDialog }, this.props.unitToNode(this.props.unit))));
        }
        else if (this.props.canRestore) {
            let icon;
            if (this.props.currentAppliedValue) {
                icon = react_1.default.createElement(index_1.RestoreIcon, null);
            }
            else {
                icon = react_1.default.createElement(index_1.ClearIcon, null);
            }
            appliedInputProps.endAdornment = (react_1.default.createElement(index_1.InputAdornment, { position: "end", className: this.props.classes.standardAddornment },
                react_1.default.createElement(index_1.IconButton, { tabIndex: -1, classes: { root: this.props.classes.iconButton }, onClick: this.props.onRestore, onMouseDown: this.catchToggleMouseDownEvent }, icon)));
        }
        else if (this.props.icon) {
            // set it at the end
            appliedInputProps.endAdornment = (react_1.default.createElement(index_1.InputAdornment, { position: "end", className: this.props.classes.standardAddornment },
                react_1.default.createElement(index_1.IconButton, { tabIndex: -1, classes: { root: this.props.classes.iconButton } }, this.props.icon)));
        }
        const unitDialog = this.props.type === "unit" ? (react_1.default.createElement(SelectUnitDialogResponsive, Object.assign({}, this.props, { open: this.state.unitDialogOpen, onClose: this.closeUnitDialog }))) : null;
        const descriptionAsAlert = this.props.args["descriptionAsAlert"];
        // return the complex overengineered component in all its glory
        return (react_1.default.createElement("div", { className: this.props.classes.container },
            this.props.description && descriptionAsAlert ?
                react_1.default.createElement(index_1.Alert, { severity: "info", className: this.props.classes.description }, this.props.description) :
                null,
            this.props.description && !descriptionAsAlert ?
                react_1.default.createElement(index_1.Typography, { variant: "caption", className: this.props.classes.description }, this.props.description) :
                null,
            react_1.default.createElement(index_1.TextField, Object.assign({ fullWidth: true, type: this.state.visible ? "text" : "password", className: this.props.classes.entry, label: this.props.label, placeholder: this.props.placeholder, value: this.props.currentInternalStrOnlyValue ||
                    this.props.currentStrOnlyValue ||
                    "", onChange: this.onChangeByHTMLEvent, InputProps: {
                    classes: {
                        root: this.props.classes.fieldInput,
                        focused: "focused",
                    },
                    disabled: this.props.disabled,
                    ...appliedInputProps,
                }, InputLabelProps: {
                    classes: {
                        root: this.props.classes.label,
                        focused: "focused",
                    },
                }, inputProps: inputProps, disabled: this.props.disabled, variant: "filled" }, appliedTextFieldProps)),
            react_1.default.createElement("div", { className: this.props.classes.errorMessage }, this.props.currentInvalidReason),
            unitDialog));
    }
}
const PropertyEntryFieldRenderer = index_1.withStyles(exports.style)(ActualPropertyEntryFieldRenderer);
exports.default = PropertyEntryFieldRenderer;
