import React from "react";
import { GraphQLEndpointErrorType } from "../../../itemize/base/errors";
import { I18nReadError } from "../../../itemize/client/app/elements";

export function ErrorPage(props: { error: GraphQLEndpointErrorType }) {
  return (
    <React.Fragment>
      <div>
        <I18nReadError error={props.error}/>
      </div>
    </React.Fragment>
  );
}