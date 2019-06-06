import React, {useState, useEffect} from "react";

import LinkedDataDropdown from "../common/LinkedDataDropdown";
import searchAPI from "../../../services/SearchAPI";
import {LoadingInlay, MessageDisplay} from "../../common";
import {SEARCH_MAX_SIZE} from "../../../constants";

const VocabularyDropdownContainer = (props) => {
    const [types, setTypes] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTypes(null);
        setError(null);
        searchAPI()
            .searchLinkedDataOfSubclass({subClassOf: [props.property.className], size: SEARCH_MAX_SIZE})
            .then(({items}) => {
                setTypes(items.map(({id}) => id));
            })
            .catch(setError);
    }, [props.property.className]);

    if (error) {
        return <MessageDisplay withIcon={false} message={error.message} />;
    }

    if (!types) {
        return <LoadingInlay />;
    }

    return types && <LinkedDataDropdown {...props} types={types} />;
};

export default VocabularyDropdownContainer;
