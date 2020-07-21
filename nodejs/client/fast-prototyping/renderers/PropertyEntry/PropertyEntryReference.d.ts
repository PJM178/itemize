import React from "react";
import { WithStyles } from "../../mui-core/index";
import { IPropertyEntryReferenceRendererProps } from "../../../internal/components/PropertyEntry/PropertyEntryReference";
export declare const style: Record<"entry" | "label" | "description" | "container" | "errorMessage" | "standardAddornment" | "smallAddornment" | "iconButtonPassword" | "iconButton" | "iconButtonSmall" | "textButton" | "labelSingleLine" | "fieldInput" | "unitDialog" | "unitDialogSubheader" | "autosuggestContainer" | "autosuggestContainerOpen" | "autosuggestInput" | "autosuggestInputOpen" | "autosuggestSuggestionsContainer" | "autosuggestSuggestionsContainerOpen" | "autosuggestSuggestionsList" | "autosuggestSuggestion" | "autosuggestFirstSuggestion" | "autosuggestSuggestionHighlighted" | "autosuggestSectionContainer" | "autosuggestFirstSectionContainer" | "autosuggestSectionTitle" | "autosuggestMenuItem" | "autosuggestMenuItemMainText" | "autosuggestMenuItemSubText", import("@material-ui/styles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<IPropertyEntryReferenceRendererProps> | ((props: IPropertyEntryReferenceRendererProps) => import("@material-ui/styles").CreateCSSProperties<IPropertyEntryReferenceRendererProps>)>;
interface IPropertyEntryReferenceRendererWithStylesProps extends IPropertyEntryReferenceRendererProps, WithStyles<typeof style> {
}
declare const PropertyEntryReferenceRenderer: React.ComponentType<Pick<IPropertyEntryReferenceRendererWithStylesProps, "label" | "placeholder" | "description" | "rtl" | "args" | "onChange" | "onRestore" | "autoFocus" | "icon" | "propertyId" | "currentAppliedValue" | "canRestore" | "currentValue" | "currentValid" | "currentInvalidReason" | "currentInternalValue" | "disabled" | "currentFindError" | "currentStrValue" | "currentOptions" | "currentSearchError" | "currentValueIsFullfilled" | "onChangeSearch" | "onSelect" | "onCancel" | "dismissSearchError" | "dismissFindError"> & import("@material-ui/styles").StyledComponentProps<"entry" | "label" | "description" | "container" | "errorMessage" | "standardAddornment" | "smallAddornment" | "iconButtonPassword" | "iconButton" | "iconButtonSmall" | "textButton" | "labelSingleLine" | "fieldInput" | "unitDialog" | "unitDialogSubheader" | "autosuggestContainer" | "autosuggestContainerOpen" | "autosuggestInput" | "autosuggestInputOpen" | "autosuggestSuggestionsContainer" | "autosuggestSuggestionsContainerOpen" | "autosuggestSuggestionsList" | "autosuggestSuggestion" | "autosuggestFirstSuggestion" | "autosuggestSuggestionHighlighted" | "autosuggestSectionContainer" | "autosuggestFirstSectionContainer" | "autosuggestSectionTitle" | "autosuggestMenuItem" | "autosuggestMenuItemMainText" | "autosuggestMenuItemSubText"> & IPropertyEntryReferenceRendererProps>;
export default PropertyEntryReferenceRenderer;
