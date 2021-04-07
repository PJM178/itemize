/**
 * The property entry boolean fast prototyping renderer uses material ui to render
 * an entry for a boolean value
 * 
 * @module
 */

import { IPropertyEntryPaymentRendererProps } from "../../../internal/components/PropertyEntry/PropertyEntryPayment";
import React from "react";
import {
  Alert, FormControl, FormControlLabel, Switch,
  Typography, Radio, RadioGroup, FormLabel, IconButton,
  createStyles, WithStyles, withStyles, RestoreIcon, InputLabel
} from "../../mui-core";
import { capitalize } from "../../../components/localization";
import PropertyEntrySelectRenderer from "./PropertyEntrySelect";
import { paymentTypesArr } from "../../../../base/Root/Module/ItemDefinition/PropertyDefinition/types/payment";

/**
 * A simple helper function that says when it should show invalid
 * @param props the renderer props
 * @returns a boolean on whether is invalid
 */
function shouldShowInvalid(props: IPropertyEntryPaymentRendererProps) {
  return !props.currentValid;
}

/**
 * The styles of the renderer
 */
export const style = createStyles({
  entry: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    width: "100%",
    paddingBottom: "1.3rem",
  },
  description: {
    width: "100%",
  },
  icon: {
    color: "#424242",
  },
  label: (props: IPropertyEntryPaymentRendererProps) => ({
    color: shouldShowInvalid(props) ? "#f44336" : "rgb(66, 66, 66)",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  errorMessage: {
    color: "#f44336",
    height: "1.3rem",
    fontSize: "0.85rem",
  },
});

/**
 * The renderer props, based on the properties it will take
 */
interface IPropertyEntryPaymentRendererWithStylesProps extends IPropertyEntryPaymentRendererProps, WithStyles<typeof style> {
}

/**
 * This is the fast prototyping boolean renderer and uses material ui in order to render a slick
 * boolean entry for it, supports the following args
 * 
 * - descriptionAsAlert: displays the description as an alert rather than its normal form
 * 
 * @param props the entry boolean props
 * @returns a react element
 */
const PropertyEntryPaymentRenderer = withStyles(style)((props: IPropertyEntryPaymentRendererWithStylesProps) => {
  const descriptionAsAlert = props.args["descriptionAsAlert"];
  const onlyStatus = props.args["onlyStatus"];

  let icon: React.ReactNode = null;
  if (props.canRestore) {
    if (props.currentAppliedValue !== null) {
      icon = <RestoreIcon />
    }
  } else if (props.icon) {
    icon = props.icon;
  }

  const iconComponent = icon ? (
    <IconButton
      tabIndex={-1}
      className={props.classes.icon}
      onClick={props.canRestore ? props.onRestore : null}
    >
      {icon}
    </IconButton>
  ) : null;

  const typesValue = paymentTypesArr.map((type) => {
    return {
      i18nValue: props.i18nPayment[type],
      value: type,
    }
  });

  const typePaymentSelector = (
    <PropertyEntrySelectRenderer
      values={typesValue}
      canRestore={false}
      currentAppliedValue={props.currentAppliedValue && props.currentAppliedValue.status}
      currentI18nValue={props.currentValue && typesValue.find((v) => v.value === props.currentValue.type).i18nValue}
      currentValid={props.currentValid}
      currentValue={props.currentValue && props.currentValue.status}
      currentInternalValue={props.currentValue && props.currentValue.status}
      currentInvalidReason={null}
      rtl={props.rtl}
      propertyId={props.propertyId + "-status"}
      placeholder={props.i18nPayment.type}
      args={null}
      label={props.label}
      icon={null}
      disabled={props.disabled}
      autoFocus={props.autoFocus}
      onChange={props.onTypeChange}
      enableUserSetErrors={props.enableUserSetErrors}
      onRestore={props.onRestore}
      nullValue={null}
      isNullable={false}
      isNumeric={false}
    />
  );

  let internalContent: React.ReactNode = null;
  // if (props.isTernary) {
  //   const values = [{
  //     value: "true",
  //     label: capitalize(props.trueLabel),
  //   }, {
  //     value: "false",
  //     label: capitalize(props.falseLabel),
  //   }, {
  //     value: "null",
  //     label: capitalize(props.nullLabel),
  //   }];
  //   internalContent = (
  //     <FormControl
  //       component={"fieldset" as any}
  //       className={props.classes.entry}
  //     >
  //       <FormLabel
  //         aria-label={props.label}
  //         component={"legend" as any}
  //         classes={{
  //           root: props.classes.label + " " + props.classes.labelSingleLine,
  //           focused: "focused",
  //         }}
  //       >
  //         {props.label}{icon ? <IconButton
  //           tabIndex={-1}
  //           className={props.classes.icon}
  //           onClick={props.canRestore && props.currentAppliedValue ? props.onRestore : null}
  //         >{icon}</IconButton> : null}
  //       </FormLabel>
  //       <RadioGroup
  //         value={JSON.stringify(props.currentValue)}
  //         onChange={handleOnChange.bind(this, props)}
  //       >
  //         {values.map((v) => <FormControlLabel
  //           key={v.value}
  //           classes={{
  //             label: props.classes.label
  //           }}
  //           value={v.value}
  //           control={<Radio/>}
  //           label={v.label}
  //           disabled={props.disabled}
  //         />)}
  //       </RadioGroup>
  //     </FormControl>
  //   )
  // } else {
  //   internalContent = (
  //     <FormControl className={props.classes.entry}>
  //       <FormControlLabel
  //         aria-label={props.label}
  //         classes={{
  //           label: props.classes.label,
  //         }}
  //         control={
  //           <Switch
  //             checked={props.currentValue}
  //             onChange={props.onChange.bind(null, !props.currentValue, null)}
  //             disabled={props.disabled}
  //           />
  //         }
  //         label={props.label}
  //       />
  //       {icon ? <IconButton className={props.classes.icon} onClick={props.canRestore ? props.onRestore : null}>{icon}</IconButton> : null}
  //     </FormControl>
  //   )
  // }

  return (
    <div className={props.classes.container}>
      {
        props.description && descriptionAsAlert ?
          <Alert severity="info" className={props.classes.description}>
            {props.description}
          </Alert> :
          null
      }
      {
        props.description && !descriptionAsAlert ?
          <Typography variant="caption" className={props.classes.description}>
            {props.description}
          </Typography> :
          null
      }
      <div>
        <InputLabel
          classes={{
            root: props.classes.label,
          }}
        >
          {capitalize(props.label)}{iconComponent}
        </InputLabel>
        {internalContent}
      </div>
      <div className={props.classes.errorMessage}>
        {props.currentInvalidReason}
      </div>
    </div>
  );
});

export default PropertyEntryPaymentRenderer;
