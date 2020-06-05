"use strict";
/**
 * This file contents functionality that is used as a component in order to perform
 * login and logout actions, they must be placed inside the provider of an item definition
 * of type user
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const token_provider_1 = require("../../internal/providers/token-provider");
const item_definition_1 = require("../../providers/item-definition");
const constants_1 = require("../../../constants");
// TODO add analytics
class ActualLogActioner extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.logoutAll = this.logoutAll.bind(this);
        this.signup = this.signup.bind(this);
        this.dismissError = this.dismissError.bind(this);
        this.cleanUnsafeFields = this.cleanUnsafeFields.bind(this);
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.children !== this.props.children ||
            nextProps.tokenContextValue.isLoggingIn !== this.props.tokenContextValue.isLoggingIn ||
            nextProps.tokenContextValue.error !== this.props.tokenContextValue.error ||
            nextProps.itemDefinitionContextualValue.submitError !== this.props.itemDefinitionContextualValue.submitError ||
            nextProps.itemDefinitionContextualValue.submitting !== this.props.itemDefinitionContextualValue.submitting;
    }
    cleanUnsafeFields(addDelay) {
        if (addDelay) {
            setTimeout(this.cleanUnsafeFields, 300);
            return;
        }
        const passwordPdef = this.props.itemDefinitionContextualValue.idef.getPropertyDefinitionFor("password", false);
        passwordPdef.cleanValueFor(this.props.itemDefinitionContextualValue.forId, this.props.itemDefinitionContextualValue.forVersion);
        this.props.itemDefinitionContextualValue.idef.triggerListeners("change", this.props.itemDefinitionContextualValue.forId, this.props.itemDefinitionContextualValue.forVersion);
    }
    async login(cleanWhenSuccesful = true) {
        const username = this.props.itemDefinitionContextualValue.state.properties
            .find((pv) => pv.propertyId === "username");
        const password = this.props.itemDefinitionContextualValue.state.properties
            .find((pv) => pv.propertyId === "password");
        if (!username) {
            throw new Error("The LogActioner ItemDefinitionProvider context does not contain an username property");
        }
        else if (!password) {
            throw new Error("The LogActioner ItemDefinitionProvider context does not contain an password property");
        }
        const usernameValue = username.value;
        const passwordValue = password.value;
        const userData = await this.props.tokenContextValue.login(usernameValue, passwordValue, null);
        // if we get a sucesful login
        if (cleanWhenSuccesful && userData && !userData.error) {
            // we do it but on a delay in order to avoid flickering for example
            // in dialogs that are going to close
            this.cleanUnsafeFields(true);
        }
        return userData;
    }
    logout() {
        this.props.tokenContextValue.logout();
    }
    async logoutAll() {
        // NOTE there's a possibility for the random number to be the same, even when this one is small
        // and an edge case and is very unlikely to fail, in case this is not enough, we can very likely use
        // a trigger in the server side for users in order to patch the edge case, but this might as well not
        // be necessary at all
        // we create a new session id
        const newSessionId = Math.floor(Math.random() * Math.floor(constants_1.MAX_SUPPORTED_INTEGER));
        // we need to retrieve the session id property in order to botch a change event
        // as if it was the UI
        const sessionIdProperty = this.props.itemDefinitionContextualValue.idef.getPropertyDefinitionFor("session_id", false);
        // now we trigger the change
        this.props.itemDefinitionContextualValue.onPropertyChange(sessionIdProperty, newSessionId, null);
        // and we submit now
        const result = await this.props.itemDefinitionContextualValue.submit({
            properties: ["session_id"],
        });
        // if we don't get an error we call logout
        if (!result.error) {
            this.props.tokenContextValue.logout();
        }
    }
    async signup(cleanWhenSuccesful = true) {
        const result = await this.props.itemDefinitionContextualValue.submit({
            properties: ["username", "password", "app_language", "app_country", "app_currency"],
        });
        if (!result.error) {
            return await this.login(cleanWhenSuccesful);
        }
        return {
            id: null,
            role: null,
            error: result.error,
        };
    }
    dismissError() {
        this.props.tokenContextValue.dismissError();
        this.props.itemDefinitionContextualValue.dismissSubmitError();
    }
    render() {
        let login;
        let logout;
        let signup;
        let logoutAll;
        const dismissError = this.dismissError;
        if (!this.props.tokenContextValue.isLoggingIn && !this.props.itemDefinitionContextualValue.submitting) {
            login = this.login;
            logout = this.logout;
            signup = this.signup;
            logoutAll = this.logoutAll;
        }
        else {
            login = () => null;
            logout = () => null;
            signup = () => null;
            logoutAll = () => null;
        }
        const output = this.props.children({
            login,
            signup,
            logout,
            logoutAll,
            error: this.props.tokenContextValue.error || this.props.itemDefinitionContextualValue.submitError,
            dismissError,
            cleanUnsafeFields: this.cleanUnsafeFields,
            isLoggingIn: this.props.tokenContextValue.isLoggingIn || this.props.itemDefinitionContextualValue.submitting,
        });
        return output;
    }
}
function LogActioner(props) {
    return (react_1.default.createElement(token_provider_1.TokenContext.Consumer, null, (tokenContextValue) => {
        return (react_1.default.createElement(item_definition_1.ItemDefinitionContext.Consumer, null, (itemDefinitionContextualValue) => {
            if (!itemDefinitionContextualValue) {
                throw new Error("The LogActioner must be in a ItemDefinitionProvider context");
            }
            return (react_1.default.createElement(ActualLogActioner, Object.assign({}, props, { tokenContextValue: tokenContextValue, itemDefinitionContextualValue: itemDefinitionContextualValue })));
        }));
    }));
}
exports.LogActioner = LogActioner;