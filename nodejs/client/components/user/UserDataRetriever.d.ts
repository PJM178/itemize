/**
 * Does the very simple job of retrieving the current user data
 *
 * @packageDocumentation
 */
import React from "react";
/**
 * The user data retriever props provide a children function
 * that should be passed to give the id and the role
 */
interface IUserDataRetrieverProps {
    children: (arg: {
        id: number;
        role: string;
    }) => React.ReactNode;
}
/**
 * Provides the current user data, aka id and role, of the logged in user,
 * id might be null, and role can be the GUEST_METAROLE in such case
 *
 * If you need more information about the user you should use the item definition
 * provider under this data retriever, aka ModuleProvider for users, ItemDefinitionProvider for
 * user, forId the id used here; then you might read things like email and username
 *
 * remember to put assumeOwnership as true, while it has little effect, given that there are no
 * includes in the user
 *
 * @param props the data retriver props
 * @returns a react element
 */
export default function UserDataRetriever(props: IUserDataRetrieverProps): JSX.Element;
export {};
