"use strict";
/**
 * Contains the select entry field renderer for fast prototyping
 *
 * The select entry field renderer is used for types, number, integer and string when
 * they have defined values
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mui_core_1 = require("../../mui-core");
/**
 * A simple helper function that says when it should show invalid
 * @param props the renderer props
 * @returns a boolean on whether is invalid
 */
function shouldShowInvalid(props) {
    return !props.currentValid;
}
/**
 * The styles for the select
 */
exports.style = mui_core_1.createStyles({
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
    icon: {
        color: "#424242",
    },
    label: (props) => ({
        "color": shouldShowInvalid(props) ? "#f44336" : "rgb(66, 66, 66)",
        "&.focused": {
            color: shouldShowInvalid(props) ? "#f44336" : "#3f51b5",
        },
    }),
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
    selectFieldIconWhenAddornmentIsActive: {
        right: "46px",
    },
});
/**
 * The actual renderer class
 */
class ActualPropertyEntrySelectRenderer extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }
    onChange(e) {
        const textualValue = e.target.value;
        // because the value can't be null, we need to set it like this
        if (this.props.isNumeric) {
            if (!textualValue) {
                this.props.onChange(null, null);
            }
            else {
                this.props.onChange(parseFloat(textualValue) || null, null);
            }
        }
        else {
            this.props.onChange(textualValue || null, null);
        }
    }
    render() {
        // build the icon
        let icon = null;
        if (this.props.canRestore) {
            if (this.props.currentAppliedValue) {
                icon = react_1.default.createElement(mui_core_1.RestoreIcon, null);
            }
        }
        else if (this.props.icon) {
            icon = this.props.icon;
        }
        const addornment = icon ? (react_1.default.createElement(mui_core_1.InputAdornment, { position: "end" },
            react_1.default.createElement(mui_core_1.IconButton, { tabIndex: -1, className: this.props.classes.icon, onClick: this.props.canRestore && this.props.currentAppliedValue ? this.props.onRestore : null }, icon))) : null;
        const descriptionAsAlert = this.props.args["descriptionAsAlert"];
        return (react_1.default.createElement("div", { className: this.props.classes.container },
            this.props.description && descriptionAsAlert ?
                react_1.default.createElement(mui_core_1.Alert, { severity: "info", className: this.props.classes.description }, this.props.description) :
                null,
            this.props.description && !descriptionAsAlert ?
                react_1.default.createElement(mui_core_1.Typography, { variant: "caption", className: this.props.classes.description }, this.props.description) :
                null,
            react_1.default.createElement(mui_core_1.FormControl, { variant: "filled", className: this.props.classes.entry },
                react_1.default.createElement(mui_core_1.InputLabel, { htmlFor: this.props.propertyId, classes: {
                        root: this.props.classes.label,
                        focused: "focused",
                    }, shrink: this.props.isNullable ? true : undefined }, this.props.label),
                react_1.default.createElement(mui_core_1.Select, { value: this.props.currentValue || "", onChange: this.onChange, displayEmpty: true, disabled: this.props.disabled, variant: "filled", classes: {
                        icon: addornment ? this.props.classes.selectFieldIconWhenAddornmentIsActive : null,
                    }, input: react_1.default.createElement(mui_core_1.FilledInput, { id: this.props.propertyId, placeholder: this.props.placeholder, endAdornment: addornment, classes: {
                            root: this.props.classes.fieldInput,
                            focused: "focused",
                        } }) },
                    react_1.default.createElement(mui_core_1.MenuItem, { selected: false, role: "none", disabled: true },
                        react_1.default.createElement("em", null, this.props.placeholder)),
                    react_1.default.createElement(mui_core_1.Divider, null),
                    this.props.isNullable ? react_1.default.createElement(mui_core_1.MenuItem, { value: "" },
                        react_1.default.createElement("em", null, this.props.nullValue.i18nValue)) : null,
                    // render the valid values that we display and choose
                    this.props.values.map((vv) => {
                        // the i18n value from the i18n data
                        return react_1.default.createElement(mui_core_1.MenuItem, { key: vv.value, value: vv.value }, vv.i18nValue);
                    }))),
            react_1.default.createElement("div", { className: this.props.classes.errorMessage }, this.props.currentInvalidReason)));
    }
}
/**
 * The property entry select is the renderer used when the property has specific valid values
 * these valid values are only supported as either string or number, so only types string, text,
 * integer, year and number are truly supported for this
 *
 * Supported renderer args:
 * - descriptionAsAlert: displays the description if exists as alert rather than the standard
 */
const PropertyEntrySelectRenderer = mui_core_1.withStyles(exports.style)(ActualPropertyEntrySelectRenderer);
exports.default = PropertyEntrySelectRenderer;
