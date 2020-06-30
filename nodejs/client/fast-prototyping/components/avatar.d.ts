import React from "react";
import { WithStyles } from "../mui-core";
import { IPropertyEntryFileRendererProps } from "../../internal/components/PropertyEntry/PropertyEntryFile";
declare const avatarStyles: Record<"fullWidth" | "flag" | "hoverAddBackdrop" | "avatar" | "avatarContainer" | "avatarUploadError" | "avatarContainerLarge" | "avatarBadge" | "avatarLarge" | "avatarMedium" | "randomColor0" | "randomColor1" | "randomColor2" | "randomColor3" | "randomColor4" | "randomColor5" | "randomColor6" | "randomColor7" | "randomColor8" | "randomColor9" | "specialUser" | "specialUserMedium" | "specialUserLarge", import("@material-ui/styles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<{}> | ((props: {}) => import("@material-ui/styles").CreateCSSProperties<{}>)>;
declare type profileURLFn = (id: number) => string;
interface IAvatarProps extends WithStyles<typeof avatarStyles> {
    hideFlag?: boolean;
    size: "small" | "medium" | "large";
    showWarnings?: boolean;
    profileURL?: string | profileURLFn;
    cacheImage?: boolean;
    fullWidth?: boolean;
    className?: string;
}
interface IAvatarRendererProps extends IPropertyEntryFileRendererProps, WithStyles<typeof avatarStyles> {
}
export declare const Avatar: React.ComponentType<Pick<IAvatarProps, "className" | "size" | "fullWidth" | "hideFlag" | "showWarnings" | "profileURL" | "cacheImage"> & import("@material-ui/styles").StyledComponentProps<"fullWidth" | "flag" | "hoverAddBackdrop" | "avatar" | "avatarContainer" | "avatarUploadError" | "avatarContainerLarge" | "avatarBadge" | "avatarLarge" | "avatarMedium" | "randomColor0" | "randomColor1" | "randomColor2" | "randomColor3" | "randomColor4" | "randomColor5" | "randomColor6" | "randomColor7" | "randomColor8" | "randomColor9" | "specialUser" | "specialUserMedium" | "specialUserLarge">>;
export declare const AvatarRenderer: React.ComponentType<Pick<IAvatarRendererProps, "label" | "placeholder" | "description" | "rtl" | "args" | "onChange" | "onRestore" | "autoFocus" | "icon" | "currentAppliedValue" | "canRestore" | "currentValue" | "currentValid" | "currentInvalidReason" | "currentInternalValue" | "disabled" | "accept" | "isSupportedImage" | "imageSrcSet" | "prettySize" | "extension" | "openFile" | "rejected" | "rejectedReason" | "isExpectingImages" | "genericActivePlaceholder" | "genericDeleteLabel" | "genericSelectLabel" | "imageSizes" | "onSetFile" | "onRemoveFile"> & import("@material-ui/styles").StyledComponentProps<"fullWidth" | "flag" | "hoverAddBackdrop" | "avatar" | "avatarContainer" | "avatarUploadError" | "avatarContainerLarge" | "avatarBadge" | "avatarLarge" | "avatarMedium" | "randomColor0" | "randomColor1" | "randomColor2" | "randomColor3" | "randomColor4" | "randomColor5" | "randomColor6" | "randomColor7" | "randomColor8" | "randomColor9" | "specialUser" | "specialUserMedium" | "specialUserLarge">>;
export {};
