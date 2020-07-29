import React, {useContext, useRef} from 'react';
import {PropTypes} from 'prop-types';

import {valuesContainsValueOrId} from "./metadataUtils";
import Dropdown from './values/Dropdown';
import LinkedDataContext from "../LinkedDataContext";
import {getDescendants} from './vocabularyUtils';
import MessageDisplay from "../../common/components/MessageDisplay";
import LoadingInlay from "../../common/components/LoadingInlay";
import {lookup} from "../../search/lookup";

export const LinkedDataDropdown = ({property, currentValues, fetchItems, types, debounce, ...otherProps}) => {
    const fetchRequest = useRef(null);

    const search = query => fetchItems({types, query});

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
    fetchItems: ({types, query}) => lookup(query, types),
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
