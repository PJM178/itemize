import React from "react";
import { WithStyles } from "../mui-core";
declare const dialogStyles: Record<"title" | "content" | "paper" | "appbar" | "actions", import("@material-ui/styles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<{}> | ((props: {}) => import("@material-ui/styles").CreateCSSProperties<{}>)>;
interface IDialogProps extends WithStyles<typeof dialogStyles> {
    open: boolean;
    title: string;
    onClose: () => void;
    children?: React.ReactNode;
    fullScreen?: boolean;
    buttons?: React.ReactNode;
    className?: string;
}
export declare const Dialog: React.ComponentType<Pick<IDialogProps, "title" | "children" | "className" | "open" | "fullScreen" | "onClose" | "buttons"> & import("@material-ui/styles").StyledComponentProps<"title" | "content" | "paper" | "appbar" | "actions">>;
declare const DialogResponsive: React.ComponentType<(Pick<Pick<IDialogProps, "title" | "children" | "className" | "open" | "fullScreen" | "onClose" | "buttons"> & import("@material-ui/styles").StyledComponentProps<"title" | "content" | "paper" | "appbar" | "actions">, "title" | "children" | "className" | "classes" | "innerRef" | "open" | "onClose" | "buttons"> & Partial<import("@material-ui/core").WithMobileDialog>) | (Pick<React.PropsWithChildren<Pick<IDialogProps, "title" | "children" | "className" | "open" | "fullScreen" | "onClose" | "buttons"> & import("@material-ui/styles").StyledComponentProps<"title" | "content" | "paper" | "appbar" | "actions">>, "title" | "children" | "className" | "classes" | "innerRef" | "open" | "onClose" | "buttons"> & Partial<import("@material-ui/core").WithMobileDialog>)>;
export { DialogResponsive };
