import {useContext} from "react";

import LinkedDataContext from './LinkedDataContext';

const useNewEntity = (formKey, shape) => {
    if (!formKey && !shape) {
        throw new Error('Formkey and/or shape are not provided');
    }

    const {getEmptyLinkedData} = useContext(LinkedDataContext);

    return {
        properties: getEmptyLinkedData(shape)
    };
};

export default useNewEntity;
