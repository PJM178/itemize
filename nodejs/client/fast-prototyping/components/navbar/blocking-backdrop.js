"use strict";
/**
 * The blocking backdrop is the component that appears when the app is blocked from an update
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mui_core_1 = require("../../mui-core");
const AppIsBlockedFromUpdate_1 = require("../../../components/outdated/AppIsBlockedFromUpdate");
const I18nRead_1 = __importDefault(require("../../../components/localization/I18nRead"));
/**
 * the blocking backdrop styles
 * @param theme the mui theme
 * @retuns a bunch of styles
 */
const blockingBackdropStyles = (theme) => mui_core_1.createStyles({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        flexDirection: "column",
        padding: "2rem",
    },
    backdropTextContainer: {
        fontSize: "0.95rem",
        textAlign: "center",
        paddingBottom: "2rem",
    },
});
/**
 * The blocking backdrop fast prototyping class which appears when the app is blocked
 * from an update check AppIsBlockedFromUpdate component to see when this appears
 *
 * it is part of the navbar by default
 * @param props the props for the blocking backdrop
 * @returns a react component
 */
exports.BlockingBackdrop = mui_core_1.withStyles(blockingBackdropStyles)((props) => {
    if (props.exclude) {
        return null;
    }
    return (react_1.default.createElement(AppIsBlockedFromUpdate_1.AppIsBlockedFromUpdate, null, (isBlocked) => {
        if (!isBlocked) {
            return null;
        }
        return (react_1.default.createElement(mui_core_1.Backdrop, { className: props.classes.backdrop, open: isBlocked },
            react_1.default.createElement("div", { className: props.classes.backdropTextContainer },
                react_1.default.createElement(I18nRead_1.default, { id: "blocked_update" })),
            react_1.default.createElement(mui_core_1.CircularProgress, { color: "inherit" })));
    }));
});
