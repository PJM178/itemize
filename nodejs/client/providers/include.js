"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncludeProvider = exports.IncludeContext = void 0;
const react_1 = __importDefault(require("react"));
const item_definition_1 = require("./item-definition");
const deep_equal_1 = __importDefault(require("deep-equal"));
exports.IncludeContext = react_1.default.createContext(null);
// tslint:disable-next-line: max-classes-per-file
class ActualIncludeProvider extends react_1.default.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.include !== this.props.include ||
            nextProps.children !== this.props.children ||
            !deep_equal_1.default(this.props.state, nextProps.state);
    }
    render() {
        return (react_1.default.createElement(exports.IncludeContext.Provider, { value: {
                include: this.props.include,
                state: this.props.state,
            } }, this.props.children));
    }
}
function IncludeProvider(props) {
    return (react_1.default.createElement(item_definition_1.ItemDefinitionContext.Consumer, null, (itemDefinitionContextualValue) => {
        const includeState = itemDefinitionContextualValue.state.includes.find((i) => i.includeId === props.item);
        const includeObject = itemDefinitionContextualValue.idef.getIncludeFor(props.item);
        return (react_1.default.createElement(ActualIncludeProvider, { include: includeObject, state: includeState }, props.children));
    }));
}
exports.IncludeProvider = IncludeProvider;
