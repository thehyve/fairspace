import React from 'react';
import {PropTypes} from 'prop-types';
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../constants";
import KeycloakAPI from "./KeycloakAPI";
import MaterialReactSelect from "../common/components/MaterialReactSelect";

export const UserSelect = ({fetchItems, debounce, ...otherProps}) => {
    let fetchRequest = null;

    const search = query => fetchItems({size: SEARCH_DROPDOWN_DEFAULT_SIZE, query})
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
        if (fetchRequest) {
            clearTimeout(fetchRequest);
        }

        return new Promise((resolve, reject) => {
            if (fetchRequest) {
                clearTimeout(fetchRequest);
            }

            fetchRequest = setTimeout(() => {
                search(query)
                    .then(resolve)
                    .catch(reject);
            }, debounce);
        });
    };

    return (
        <MaterialReactSelect
            {...otherProps}
            style={{width: '100%'}}
            async
            loadOptions={debouncedSearch}
        />
    );
};

UserSelect.propTypes = {
    fetchItems: PropTypes.func,
    debounce: PropTypes.number
};

UserSelect.defaultProps = {
    fetchItems: ({size, query}) => KeycloakAPI.users({size, query}),
    debounce: 300
};

export default UserSelect;
