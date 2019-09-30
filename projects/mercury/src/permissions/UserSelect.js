import React from "react";
import {DebouncedSelect} from "@fairspace/shared-frontend";
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../constants";
import KeycloakAPI from "./KeycloakAPI";

export default props => {
    const fetchItems = ({size = SEARCH_DROPDOWN_DEFAULT_SIZE, query}) => KeycloakAPI.searchUsers({size, query})
        .then(
            items => items.map(user => {
                const {iri, firstName, lastName} = user;
                const displayLabel = (firstName + ' ' + lastName).trim();
                return {
                    label: displayLabel,
                    iri,
                    user
                };
            })
        );

    return <DebouncedSelect {...props} fetchItems={fetchItems} />;
};
