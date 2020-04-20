import React from "react";
import { ModuleProvider } from "../../../providers/module";
import { ItemDefinitionProvider } from "../../../providers/item-definition";
import { UserDataRetriever } from "../../../components/user";
import { ItemDefinitionLoader } from "../../components/item-definition-loader";
import { TitleSetter } from "../../../components/util";
import { I18nRead } from "../../../components/localization";
import { SlowLoadingElement } from "../../components/util";

interface ProfileProps {
  match: {
    params: {
      id: string;
    };
  };
}

export function Profile(props: ProfileProps) {
  const currentUserId = parseInt(props.match.params.id);
  return (
    <SlowLoadingElement id="profile">
      <UserDataRetriever>
        {(userData) => {
          let properties = [
            "username",
            "app_language",
            "app_country",
            "app_currency",
            "e_validated",
            "role",
            "profile_picture",
          ];
          return (
            <ModuleProvider module="users">
              <ItemDefinitionProvider
                itemDefinition="user"
                properties={properties}
                forId={currentUserId}
                assumeOwnership={false}
                includePolicies={false}
              >
                <I18nRead id="profile" capitalize={true}>
                  {(i18nProfile: string) => {
                    return (
                      <TitleSetter>
                        {i18nProfile}
                      </TitleSetter>
                    );
                  }}
                </I18nRead>
                <ItemDefinitionLoader>
                  {
                    null
                  }
                </ItemDefinitionLoader>
              </ItemDefinitionProvider>
            </ModuleProvider>
          )
        }}
      </UserDataRetriever>
    </SlowLoadingElement>
  );
}