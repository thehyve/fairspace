import React, {useEffect, useState} from 'react';

import searchAPI from "../../../services/SearchAPI";
import {linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {LoadingInlay, MessageDisplay} from "../../common";
import Dropdown from './values/Dropdown';

const LinkedDataDropdown = ({types, property, ...otherProps}) => {
    const [fetchedItems, setFetchedItems] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setFetchedItems(null);
        searchAPI()
            .searchLinkedData({types: types || [property.className], size: 100})
            .then(({items}) => {
                setFetchedItems(items);
            })
            .catch(setError);
    }, [property.className, types]);

    if (error) {
        return <MessageDisplay noIcon message={error.message} />;
    }

    if (!fetchedItems) {
        return <LoadingInlay />;
    }

    const options = fetchedItems
        .map(({id, label, name, value}) => {
            const disabled = property.values.some(v => (v.id && v.id === id) || (v.value && v.value === value));
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
