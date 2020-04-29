import React, {useContext, useRef} from 'react';
import {PropTypes} from 'prop-types';
import {LoadingInlay, MessageDisplay} from '../../common';

import {valuesContainsValueOrId} from "./metadataUtils";
import Dropdown from './values/Dropdown';
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../../constants";
import LinkedDataContext from "../LinkedDataContext";
import {getDescendants} from './vocabularyUtils';
import {handleSearchError} from "../../search/searchUtils";
import SearchAPI, {SORT_ALPHABETICALLY} from "../../search/SearchAPI";

export const LinkedDataDropdown = ({property, currentValues, fetchItems, types, debounce, ...otherProps}) => {
    const fetchRequest = useRef(null);

    const search = query => fetchItems({types, size: SEARCH_DROPDOWN_DEFAULT_SIZE, query})
        .then(
            ({items}) => items.map(metadataItem => {
                const {id, label, name} = metadataItem;
                const displayLabel = (label && label[0]) || (name && name[0]) || id;

                return {
                    label: displayLabel,
                    id,
                    otherEntry: metadataItem
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
            loadOptionsOnMount={false}
            loadOptions={debouncedSearch}
            isOptionDisabled={option => valuesContainsValueOrId(currentValues, undefined, option.id)}
        />
    );
};

LinkedDataDropdown.propTypes = {
    fetchItems: PropTypes.func,
    property: PropTypes.object.isRequired,
    types: PropTypes.arrayOf(PropTypes.string).isRequired,
    debounce: PropTypes.number
};

LinkedDataDropdown.defaultProps = {
    fetchItems: ({types, size, query}) => SearchAPI
        .searchLinkedData({types, size, query, sort: SORT_ALPHABETICALLY})
        .catch(handleSearchError),
    debounce: 300
};

export default props => {
    const {shapes, shapesLoading, shapesError} = useContext(LinkedDataContext);

    if (shapesError) {
        return <MessageDisplay withIcon={false} message="Unable to fetch options" />;
    }

    if (shapesLoading) {
        return <LoadingInlay />;
    }

    const {className} = props.property;
    const types = [className, ...getDescendants(shapes, className)];

    return (
        <LinkedDataDropdown
            types={types}
            {...props}
        />
    );
};
