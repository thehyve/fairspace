// @ts-nocheck
import React, {useRef} from "react";
import {PropTypes} from "prop-types";
import {valuesContainsValueOrId} from "./metadataUtils";
import Dropdown from "./values/Dropdown";
import {LocalSearchAPI} from "../../search/SearchAPI";
export const LinkedDataDropdown = ({
    property,
    currentValues,
    fetchItems,
    type,
    debounce,
    ...otherProps
}) => {
    const fetchRequest = useRef(null);

    const search = query => fetchItems({
        type,
        query
    });

    const debouncedSearch = query => {
        if (fetchRequest.current) {
            clearTimeout(fetchRequest.current);
        }

        return new Promise((resolve, reject) => {
            if (fetchRequest.current) {
                clearTimeout(fetchRequest.current);
            }

            fetchRequest.current = setTimeout(() => {
                search(query).then(resolve).catch(reject);
            }, debounce);
        });
    };

    return <Dropdown {...otherProps} clearTextOnSelection loadOptionsOnMount={false} loadOptions={debouncedSearch} isOptionDisabled={option => valuesContainsValueOrId(currentValues, undefined, option.id)} />;
};
LinkedDataDropdown.propTypes = {
    fetchItems: PropTypes.func,
    property: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    debounce: PropTypes.number
};
LinkedDataDropdown.defaultProps = {
    fetchItems: ({
        type,
        query
    }) => LocalSearchAPI.lookupSearch(query, type),
    debounce: 300
};
export default (props => <LinkedDataDropdown type={props.property.className} {...props} />);