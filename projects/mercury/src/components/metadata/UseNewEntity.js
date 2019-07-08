import {useContext} from "react";

import LinkedDataContext from './LinkedDataContext';

const useNewEntity = (shape) => {
    if (!shape) {
        throw new Error('Shape is not provided');
    }

    const {getEmptyLinkedData} = useContext(LinkedDataContext);

    return {
        properties: getEmptyLinkedData(shape)
    };
};

export default useNewEntity;
