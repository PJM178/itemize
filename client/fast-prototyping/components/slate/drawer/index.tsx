/**
 * This file provides the drawer content that exists side to the rich text editor
 * when it is allowed to hold a drawer, the drawer contains a range of options to enable
 * templating or custom styling
 * @module
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { IDrawerContainerProps } from "../wrapper";
import { GeneralOptions } from "./general";
import { StylesOptions } from "./styles";
import { ActionsOptions } from "./actions";
import { TemplatingOptions } from "./templating";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SettingsIcon from "@mui/icons-material/Settings";
import BorderStyleIcon from "@mui/icons-material/BorderStyle";
import WebIcon from "@mui/icons-material/Web";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import Typography from "@mui/material/Typography";
import { getInfoFor } from "../../../../internal/text/serializer";
import { AltBadgeReactioner } from "../../alt-badge-reactioner";
import { AltSectionScroller } from "../../alt-section-scroller";
import AltPriorityShifter from "../../../../components/accessibility/AltPriorityShifter";

const style = {
  tab: {
    minWidth: "auto",
  },
  elementTitle: {
    textTransform: "capitalize",
    fontWeight: 700,
    color: "#444",
    fontSize: "1rem",
    height: "1rem",
    flex: "0 0 1rem",
  },
};

/**
 * This is the wrapper drawer itself
 * @param props it takes the entire wrapper props with the styles
 */
export function WrapperDrawer(props: IDrawerContainerProps) {
  // we grab this from local storage, this won't affect SSR because the drawer won't
  // ever render in the server side, it's client side only, it's always technically closed
  // on the server side
  const [location, setLocation] = useState(localStorage.getItem("SLATE_DRAWER_LAST_LOCATION") || "MAIN");
  const [accessibilitySelectedOption, useAccessibilitySelectedOption] = useState(null as string);

  useEffect(() => {
    if (!props.drawerOpen) {
      console.log("EFFECT NULL");
      useAccessibilitySelectedOption(null);
    }
  }, [props.drawerOpen]);

  console.log("SELECTED", accessibilitySelectedOption);

  // update the given location
  const setLocationCallback = useCallback((e: React.ChangeEvent, value: string) => {
    localStorage.setItem("SLATE_DRAWER_LAST_LOCATION", value);
    useAccessibilitySelectedOption(value);
    setLocation(value);
  }, []);

  const forceOnClickEvent = useCallback((e: React.MouseEvent<HTMLElement>) => {
    useAccessibilitySelectedOption((e.target as HTMLElement).dataset.value);
  }, []);

  // now we need to build the settings
  let settingsForNode: React.ReactNode = null;
  let titleForNode: string = null;

  // and that's done based on the selected node
  if (props.state.currentSelectedElement) {
    // and according to that decide which panel to render
    let infoPanel: React.ReactNode = null;
    switch (location) {
      case "MAIN":
        infoPanel = <GeneralOptions {...props} />;
        break;
      case "STYLES":
        infoPanel = <StylesOptions {...props} />;
        break;
      case "ACTIONS":
        infoPanel = <ActionsOptions {...props} />;
        break;
      case "TEMPLATING":
        infoPanel = <TemplatingOptions {...props} />;
        break;
    }

    const selectedNodeInfo = getInfoFor(
      props.state.currentSelectedElement,
      props.i18nRichInfo,
    );

    titleForNode = selectedNodeInfo.name;

    // and now we can build these settings
    // basically here we are building the divider and then
    // adding the panel, where the tabs allow us to switch
    // from each panel
    settingsForNode = (
      <>
        {
          !selectedNodeInfo.isText ?
            (
              <>
                <AltBadgeReactioner
                  reactionKey="escape"
                  label="esc"
                  priority={3}
                  disabled={!accessibilitySelectedOption}
                  triggerAltAfterAction={true}
                  groupPosition={1}
                  fullWidth={true}
                  tabbable={false}
                  selector="div"
                >
                  <div onClick={useAccessibilitySelectedOption.bind(null, null)}/>
                </AltBadgeReactioner>
                <Tabs
                  value={location}
                  onChange={setLocationCallback}
                  onClick={forceOnClickEvent}
                >
                  <Tab
                    sx={style.tab}
                    label={
                      <AltBadgeReactioner
                        reactionKey="m"
                        priority={2}
                        disabled={!props.state.currentSelectedElement}
                        selectorGoUp={1}
                        triggerAltAfterAction={true}
                        groupPosition={1}
                      >
                        <SettingsIcon />
                      </AltBadgeReactioner>
                    }
                    value="MAIN"
                    data-value="MAIN"
                    title={props.i18nRichInfo.settings}
                  />

                  {
                    props.featureSupport.supportsCustomStyles || props.featureSupport.supportsRichClasses ?
                      (

                        <Tab
                          sx={style.tab}
                          data-value="STYLES"
                          label={
                            <AltBadgeReactioner
                              reactionKey="s"
                              priority={2}
                              disabled={!props.state.currentSelectedElement}
                              selectorGoUp={1}
                              triggerAltAfterAction={true}
                              groupPosition={2}
                            >
                              <BorderStyleIcon />
                            </AltBadgeReactioner>
                          }
                          value="STYLES"
                          title={props.i18nRichInfo.styles}
                        />
                      ) :
                      null
                  }
                  {
                    (props.featureSupport.supportsTemplating) ?
                      (
                        <Tab
                          sx={style.tab}
                          label={
                            <AltBadgeReactioner
                              reactionKey="t"
                              priority={2}
                              disabled={!props.state.currentSelectedElement}
                              selectorGoUp={1}
                              triggerAltAfterAction={true}
                              groupPosition={3}
                            >
                              <WebIcon />
                            </AltBadgeReactioner>
                          }
                          value="TEMPLATING"
                          data-value="TEMPLATING"
                          title={props.i18nRichInfo.templating}
                        />
                      ) :
                      null
                  }
                  {
                    (props.featureSupport.supportsTemplating) ?
                      (
                        <Tab
                          sx={style.tab}
                          label={
                            <AltBadgeReactioner
                              reactionKey="a"
                              priority={2}
                              disabled={!props.state.currentSelectedElement}
                              selectorGoUp={1}
                              triggerAltAfterAction={true}
                              groupPosition={4}
                            >
                              <TouchAppIcon />
                            </AltBadgeReactioner>
                          }
                          value="ACTIONS"
                          data-value="ACTIONS"
                          title={props.i18nRichInfo.actions}
                        />
                      ) :
                      null
                  }
                </Tabs>
              </>
            ) : null
        }
        <AltPriorityShifter amount={!accessibilitySelectedOption ? -100 : 0}>
          {infoPanel}
        </AltPriorityShifter>
      </>
    );
  }

  // now we return
  return (
    <>
      <Typography sx={style.elementTitle} variant="h6">{titleForNode}</Typography>
      {settingsForNode}
      <AltSectionScroller priority={1} positioning="absolute" />
    </>
  );
}
