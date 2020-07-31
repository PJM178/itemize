/**
 * The social section contains this for the frontpage
 *
 * @packageDocumentation
 */
import React from "react";
import { Theme } from "../../mui-core";
/**
 * provides the styles for the social section
 * @param theme the mui theme
 * @returns a bunch of styles
 */
export declare const socialStyles: (theme: Theme) => Record<"button" | "icon" | "youtube" | "container" | "paper" | "paper2" | "socialTitle" | "facebook" | "instagram" | "twitter" | "reddit" | "linkedin" | "pinterest", import("@material-ui/styles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<{}> | ((props: {}) => import("@material-ui/styles").CreateCSSProperties<{}>)>;
/**
 * The social section provides the buttons and urls for the different social networks that can be
 * used as defined by the developer, these networks are language sensitive and are read
 * from the i18n properties data
 *
 * @param props the social props
 * @returns a react element
 */
export declare const Social: React.ComponentType<Pick<{
    classes: Record<"button" | "icon" | "youtube" | "container" | "paper" | "paper2" | "socialTitle" | "facebook" | "instagram" | "twitter" | "reddit" | "linkedin" | "pinterest", string>;
}, never> & import("@material-ui/styles").StyledComponentProps<"button" | "icon" | "youtube" | "container" | "paper" | "paper2" | "socialTitle" | "facebook" | "instagram" | "twitter" | "reddit" | "linkedin" | "pinterest">>;
