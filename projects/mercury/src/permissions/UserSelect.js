import React, {useRef} from "react";

import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../constants";
import KeycloakAPI from "./KeycloakAPI";
import Dropdown from "../metadata/common/values/Dropdown";

const UserSelect = ({debounce = 300, ...otherProps}) => {
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

    const fetchRequest = useRef(null);


    const search = query => fetchItems({size: SEARCH_DROPDOWN_DEFAULT_SIZE, query});

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
            style={{width: '100%'}}
            async
            loadOptions={debouncedSearch}
        />
    );
};

export default UserSelect;
