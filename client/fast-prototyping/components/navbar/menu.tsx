import React from "react";
import ImportantDevicesIcon from "@material-ui/icons/ImportantDevices";
import Link from "../../../components/navigation/Link";
import { SwipeableDrawer, List, Divider, ListItem, ListItemIcon, ListItemText, createStyles, WithStyles, withStyles } from "@material-ui/core";
import { ModuleProvider } from "../../../providers/module";
import AppLanguageRetriever from "../../../components/localization/AppLanguageRetriever";
import UserDataRetriever from "../../../components/user/UserDataRetriever";
import I18nRead from "../../../components/localization/I18nRead";
import LocationReader from "../../../components/navigation/LocationReader";

interface MenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const menuStyles = createStyles({
  list: {
    width: "250px",
  },
  listLink: {
    textDecoration: "none",
    color: "inherit",
  },
});

interface MenuPropsWithStyles extends WithStyles<typeof menuStyles>, MenuProps {
}

export const Menu = withStyles(menuStyles)((props: MenuPropsWithStyles) => {
  return (
    <AppLanguageRetriever>
      {(retriever) => (
        <SwipeableDrawer
          anchor={retriever.rtl ? "right" : "left"}
          open={props.isOpen}
          onClose={props.onClose}
          onOpen={props.onOpen}
          disableDiscovery={true}
        >
          <div
            className={props.classes.list}
            role="presentation"
            onClick={props.onClose}
            onKeyDown={props.onClose}
          >
            <UserDataRetriever>
              {(userData) => {
                if (userData.role === "ADMIN") {
                  return (
                    <>
                      <List>
                        <Link to="cms" className={props.classes.listLink}>
                          <LocationReader>
                            {(arg) => (
                              <ListItem button={true} selected={arg.pathname === "/cms"}>
                                <ListItemIcon>
                                  <ImportantDevicesIcon />
                                </ListItemIcon>
                                <ModuleProvider module="cms">
                                  <ListItemText>
                                    <I18nRead id="name" capitalize={true} />
                                  </ListItemText>
                                </ModuleProvider>
                              </ListItem>
                            )}
                          </LocationReader>
                        </Link>
                      </List>
                      <Divider />
                    </>
                  )
                }
              }}
            </UserDataRetriever>
          </div>
        </SwipeableDrawer>
      )}
    </AppLanguageRetriever>
  )
});