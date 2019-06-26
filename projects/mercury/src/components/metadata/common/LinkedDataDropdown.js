import React from 'react';
import {PropTypes} from 'prop-types';

import searchAPI, {SORT_ALPHABETICALLY} from "../../../services/SearchAPI";
import {propertyContainsValueOrId} from "../../../utils/linkeddata/metadataUtils";
import Dropdown from './values/Dropdown';
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../../../constants";
import Iri from "../../common/Iri";

const LinkedDataDropdown = ({property, fetchItems, types, debounce, ...otherProps}) => {
    let fetchRequest = null;

    const search = query => {
        const typesToFetch = Array.isArray(types) && types.length > 0 ? types : [property.className];

        return fetchItems({types: typesToFetch, size: SEARCH_DROPDOWN_DEFAULT_SIZE, query})
            .then(
                ({items}) => items.map(metadataItem => {
                    const {id, label, name} = metadataItem;
                    const displayLabel = (label && label[0]) || (name && name[0]) || <Iri iri={id} />;

                    return {
                        label: displayLabel,
                        id,
                        otherEntry: metadataItem
                    };
                })
            );
    }

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
    }

    return (
        <Dropdown
            {...otherProps}
            async
            loadOptions={debouncedSearch}
            isOptionDisabled={option => propertyContainsValueOrId(property, undefined, option.id)}
        />
    );
}

LinkedDataDropdown.propTypes = {
    fetchItems: PropTypes.func,
    property: PropTypes.object.isRequired,
    types: PropTypes.arrayOf(PropTypes.string),
    debounce: PropTypes.number
};

LinkedDataDropdown.defaultProps = {
    fetchItems: ({types, size, query}) => searchAPI().searchLinkedData({types, size, query, sort: SORT_ALPHABETICALLY}),
    debounce: 300
};


export default LinkedDataDropdown;
