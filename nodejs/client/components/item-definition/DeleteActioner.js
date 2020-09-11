"use strict";
/**
 * One of the most useful classes allows for deleting data to the server side
 * as well as do cleanup processes after the fact, most delete buttons will be built
 * upon this class, as it's meant to apply for a button, however it also allows
 * for displaying errors and trigger actions after success or failure
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const item_definition_1 = require("../../providers/item-definition");
/**
 * This is where the main logic happens, its in its own class in order to be
 * able to perform conditional rendering and avoid useless updates
 */
class ActualDeleteActioner extends react_1.default.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.children !== this.props.children ||
            nextProps.itemDefinitionContext.deleteError !== this.props.itemDefinitionContext.deleteError ||
            nextProps.itemDefinitionContext.deleting !== this.props.itemDefinitionContext.deleting ||
            nextProps.itemDefinitionContext.deleted !== this.props.itemDefinitionContext.deleted;
    }
    render() {
        return this.props.children({
            deleteError: this.props.itemDefinitionContext.deleteError,
            deleting: this.props.itemDefinitionContext.deleting,
            deleted: this.props.itemDefinitionContext.deleted,
            delete: this.props.itemDefinitionContext.delete,
            dismissError: this.props.itemDefinitionContext.dismissDeleteError,
            dismissDeleted: this.props.itemDefinitionContext.dismissDeleted,
            clean: this.props.itemDefinitionContext.clean,
        });
    }
}
/**
 * The delete actioner class allows for usage for triggering a delete of
 * a given item definition slot
 *
 * @param props the props
 * @returns a react component
 */
function DeleteActioner(props) {
    return (react_1.default.createElement(item_definition_1.ItemDefinitionContext.Consumer, null, (itemDefinitionContext) => (react_1.default.createElement(ActualDeleteActioner, Object.assign({}, props, { itemDefinitionContext: itemDefinitionContext })))));
}
exports.default = DeleteActioner;