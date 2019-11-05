import React, {useRef} from "react";

import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../constants";
import KeycloakAPI from "./KeycloakAPI";
import Dropdown from "../metadata/common/values/Dropdown";

const UserSelect = ({debounce = 300, ...otherProps}) => {
    const fetchRequest = useRef(null);

    const search = (query, size = SEARCH_DROPDOWN_DEFAULT_SIZE) => KeycloakAPI.searchUsers({size, query})
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

    const debouncedSearch = (query) => {
        if (fetchRequest.current) {
            clearTimeout(fetchRequest.current);
        }

        return new Promise((resolve, reject) => {
            if (fetchRequest.current) {
                clearTimeout(fetchRequest.current);
            }

            fetchRequest.current = setTimeout(() => {
                search(query)
                    .then(resolve)
                    .catch(reject);
            }, debounce);
        });
    };

    return (
        <Dropdown
            {...otherProps}
            async
            clearTextOnSelection={false}
            loadOptions={debouncedSearch}
        />
    );
};

export default UserSelect;
