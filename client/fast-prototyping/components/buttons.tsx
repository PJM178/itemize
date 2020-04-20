import React, { useState } from "react";
import { SubmitActioner } from "../../components/item-definition";
import { Button, PropTypes } from "@material-ui/core";
import { I18nRead } from "../../components/localization";
import { IActionSubmitOptions } from "../../providers/item-definition";
import { ProgressingElement } from "./util";
import { localizedRedirectTo } from "../../components/navigaton";

interface ISubmitButtonProps {
  options: IActionSubmitOptions;
  i18nId: string;
  buttonClassName?: string;
  buttonVariant?: "text" | "outlined" | "contained";
  buttonColor?: PropTypes.Color;
  buttonEndIcon?: React.ReactNode;
  buttonStartIcon?: React.ReactNode;
  CustomConfirmationComponent?: React.ComponentType<{isActive: boolean, onClose: (continueWithProcess: boolean) => void}>;
  redirectOnSuccess?: string;
}

export function SubmitButton(props: ISubmitButtonProps) {
  const [confirmationIsActive, setConfirmationIsActive] = useState(false);
  const CustomConfirmationComponent = props.CustomConfirmationComponent;
  return (
    <SubmitActioner>
      {(actioner) => {
        const submitAction = async () => {
          if (props.CustomConfirmationComponent) {
            setConfirmationIsActive(true);
          } else {
            const status = await actioner.submit(props.options);
            if (!status.error && props.redirectOnSuccess) {
              localizedRedirectTo(props.redirectOnSuccess);
            }
          }
        }
        const onCloseAction = async (continueWithProcess: boolean) => {
          setConfirmationIsActive(false);
          if (continueWithProcess) {
            const status = await actioner.submit(props.options);
            if (!status.error && props.redirectOnSuccess) {
              localizedRedirectTo(props.redirectOnSuccess);
            }
          } else {
            actioner.clean(props.options, "fail");
          }
        }
        return (
          <React.Fragment>
            <ProgressingElement isProgressing={actioner.submitting}>
              <Button
                variant={props.buttonVariant}
                color={props.buttonColor}
                endIcon={props.buttonEndIcon}
                startIcon={props.buttonStartIcon}
                className={props.buttonClassName}
                onClick={submitAction}
              >
                <I18nRead capitalize={true} id={props.i18nId} />
              </Button>
            </ProgressingElement>
            {
              CustomConfirmationComponent ?
                <CustomConfirmationComponent isActive={confirmationIsActive} onClose={onCloseAction}/> :
                null
            }
          </React.Fragment>
        );
      }}
    </SubmitActioner>
  )
}

export function SearchButton() {

}

export function DeleteButton() {

}