import React, {useContext} from 'react';
import {PropTypes} from 'prop-types';
import {LoadingInlay, MessageDisplay, SearchAPI, handleSearchError, SORT_ALPHABETICALLY} from '@fairspace/shared-frontend';

import {valuesContainsValueOrId} from "../../common/utils/linkeddata/metadataUtils";
import Dropdown from './values/Dropdown';
import {SEARCH_DROPDOWN_DEFAULT_SIZE, ES_INDEX} from "../../constants";
import Iri from "../../common/components/Iri";
import LinkedDataContext from "../LinkedDataContext";
import Config from "../../common/services/Config";

export const LinkedDataDropdown = ({property, currentValues, fetchItems, types, debounce, ...otherProps}) => {
    let fetchRequest = null;

    const search = query => fetchItems({types, size: SEARCH_DROPDOWN_DEFAULT_SIZE, query})
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
        <Dropdown
            {...otherProps}
            async
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
    fetchItems: ({types, size, query}) => SearchAPI(Config.get(), ES_INDEX)
        .searchLinkedData({types, size, query, sort: SORT_ALPHABETICALLY})
        .catch(handleSearchError),
    debounce: 300
};

export default props => {
    const {getDescendants, shapesLoading, shapesError} = useContext(LinkedDataContext);

    if (shapesError) {
        return <MessageDisplay withIcon={false} message="Unable to fetch options" />;
    }

    if (shapesLoading) {
        return <LoadingInlay />;
    }

    const {className} = props.property;
    const types = [className, ...getDescendants(className)];

    return (
        <LinkedDataDropdown
            types={types}
            {...props}
        />
    );
};
