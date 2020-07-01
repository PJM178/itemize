import { IPropertyEntryFileRendererProps } from "../../../internal/components/PropertyEntry/PropertyEntryFile";
import { WithStyles } from "../../mui-core";
import React from "react";
export declare const style: Record<"entry" | "button" | "label" | "description" | "icon" | "container" | "errorMessage" | "paper" | "fileDeleteButton" | "fileRejectedDescription" | "paperPlaceholder" | "paperPlaceholderAccepting" | "paperPlaceholderRejecting" | "paperIconAdd" | "buttonContainer" | "buttonIcon", import("@material-ui/styles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<IPropertyEntryFileRendererProps> | ((props: IPropertyEntryFileRendererProps) => import("@material-ui/styles").CreateCSSProperties<IPropertyEntryFileRendererProps>)>;
interface IPropertyEntryFileRendererWithStylesProps extends IPropertyEntryFileRendererProps, WithStyles<typeof style> {
}
declare const PropertyEntryFileRenderer: React.ComponentType<Pick<IPropertyEntryFileRendererWithStylesProps, "label" | "placeholder" | "description" | "rtl" | "args" | "onChange" | "onRestore" | "autoFocus" | "icon" | "propertyId" | "currentAppliedValue" | "canRestore" | "currentValue" | "currentValid" | "currentInvalidReason" | "currentInternalValue" | "disabled" | "accept" | "isSupportedImage" | "imageSrcSet" | "prettySize" | "extension" | "openFile" | "rejected" | "rejectedReason" | "isExpectingImages" | "genericActivePlaceholder" | "genericDeleteLabel" | "genericSelectLabel" | "imageSizes" | "onSetFile" | "onRemoveFile"> & import("@material-ui/styles").StyledComponentProps<"entry" | "button" | "label" | "description" | "icon" | "container" | "errorMessage" | "paper" | "fileDeleteButton" | "fileRejectedDescription" | "paperPlaceholder" | "paperPlaceholderAccepting" | "paperPlaceholderRejecting" | "paperIconAdd" | "buttonContainer" | "buttonIcon"> & IPropertyEntryFileRendererProps>;
export default PropertyEntryFileRenderer;
