import React from "react";
import { Button, createStyles, withStyles, WithStyles, Icon } from "@material-ui/core";
import { DialogResponsive } from "./dialog";
import { Entry, I18nRead, LogActioner, I18nReadError } from "../../../itemize/client/app/elements";
import { ModuleProvider, ItemDefinitionProvider } from "../../../itemize/client/app/providers";

const signupDialogStyles = createStyles({});

interface ISignupDialogProps extends WithStyles<typeof signupDialogStyles> {
  open: boolean;
  onClose: () => void;
  onLoginRequest: () => void;
}

export const SignupDialog = withStyles(signupDialogStyles)((props: ISignupDialogProps) => {
  return (
    <ModuleProvider module="users">
      <ItemDefinitionProvider itemDefinition="user">
        <LogActioner>
          {(actioner) => (
            <I18nRead id="signup">
              {(i18nSignup: string) => (
                <DialogResponsive
                  open={props.open}
                  onClose={props.onClose}
                  title={i18nSignup}
                  buttons={
                    <Button
                      color="primary"
                      aria-label={i18nSignup}
                      startIcon={<Icon>done</Icon>}
                      onClick={actioner.signup}
                    >
                      {i18nSignup}
                    </Button>
                  }
                >
                  <form>
                    <Entry id="username" onChange={actioner.dismissError} showAsInvalid={!!actioner.error}/>
                    <Entry id="password" onChange={actioner.dismissError} showAsInvalid={!!actioner.error}/>

                    <I18nReadError error={actioner.error}/>
                  </form>
                  <Button color="secondary" onClick={props.onLoginRequest}>
                    <I18nRead id="loginInstead"/>
                  </Button>
                </DialogResponsive>
              )}
            </I18nRead>
          )}
        </LogActioner>
      </ItemDefinitionProvider>
    </ModuleProvider>
  );
});
