import React, {useEffect, useState} from 'react';

import searchAPI from "../../../services/SearchAPI";
import {linkLabel, propertyContainsValueOrId} from "../../../utils/linkeddata/metadataUtils";
import {LoadingInlay, MessageDisplay} from "../../common";
import Dropdown from './values/Dropdown';
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../../../constants";

const LinkedDataDropdown = ({types, property, ...otherProps}) => {
    const [fetchedItems, setFetchedItems] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setFetchedItems(null);
        setError(null);
        searchAPI()
            .searchLinkedData({types: types || [property.className], size: SEARCH_DROPDOWN_DEFAULT_SIZE})
            .then(({items}) => {
                setFetchedItems(items);
            })
            .catch(setError);
    }, [property.className, types]);

    if (error) {
        return <MessageDisplay withIcon={false} message={error.message} />;
    }

    if (!fetchedItems) {
        return <LoadingInlay />;
    }

    const options = fetchedItems
        .map(({id, label, name, value}) => {
            const disabled = propertyContainsValueOrId(property, value, id);
            const l = (label && label[0]) || (name && name[0]) || linkLabel(id, true);

            return {
                disabled,
                label: l,
                id,
            };
        });

    return (
        <Dropdown {...otherProps} options={options} />
    );
};

export default LinkedDataDropdown;
