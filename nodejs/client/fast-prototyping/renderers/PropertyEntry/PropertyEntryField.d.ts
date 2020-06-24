import React from "react";
import { WithStyles } from "../../mui-core/index";
import { IPropertyEntryFieldRendererProps } from "../../../internal/components/PropertyEntry/PropertyEntryField";
export declare const style: Record<"entry" | "label" | "description" | "container" | "errorMessage" | "standardAddornment" | "iconButtonPassword" | "iconButton" | "textButton" | "labelSingleLine" | "fieldInput" | "unitDialog" | "unitDialogSubheader" | "autosuggestContainer", import("@material-ui/styles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<IPropertyEntryFieldRendererProps> | ((props: IPropertyEntryFieldRendererProps) => import("@material-ui/styles").CreateCSSProperties<IPropertyEntryFieldRendererProps>)>;
interface IPropertyEntryFieldRendererWithStylesProps extends IPropertyEntryFieldRendererProps, WithStyles<typeof style> {
}
declare const PropertyEntryFieldRenderer: React.ComponentType<Pick<IPropertyEntryFieldRendererWithStylesProps, "currency" | "unit" | "label" | "type" | "placeholder" | "description" | "rtl" | "args" | "onChange" | "onRestore" | "autoFocus" | "icon" | "currentAppliedValue" | "canRestore" | "currentValue" | "currentValid" | "currentInvalidReason" | "currentInternalValue" | "disabled" | "subtype" | "currentInternalStrOnlyValue" | "currentStrOnlyValue" | "htmlAutocomplete" | "isNumericType" | "onChangeByNumber" | "currencyFormat" | "unitPrimary" | "unitPrimaryImperial" | "unitOptions" | "unitImperialOptions" | "unitPrefersImperial" | "unitIsLockedToPrimaries" | "unitI18n" | "unitToNode" | "onChangeUnit"> & import("@material-ui/core").StyledComponentProps<"entry" | "label" | "description" | "container" | "errorMessage" | "standardAddornment" | "iconButtonPassword" | "iconButton" | "textButton" | "labelSingleLine" | "fieldInput" | "unitDialog" | "unitDialogSubheader" | "autosuggestContainer"> & IPropertyEntryFieldRendererProps>;
export default PropertyEntryFieldRenderer;
