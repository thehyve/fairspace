import {useEffect, useContext} from "react";
import {useDispatch} from 'react-redux';

import {initializeLinkedDataForm} from "../../actions/linkedDataFormActions";
import LinkedDataContext from './LinkedDataContext';

const useNewEntity = (formKey, shape) => {
    if (!formKey && !shape) {
        throw new Error('Formkey and/or shape are not provided');
    }

    const {getEmptyLinkedData} = useContext(LinkedDataContext);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeLinkedDataForm(formKey));
    }, [formKey, dispatch]);

    return {
        properties: getEmptyLinkedData(shape)
    };
};

export default useNewEntity;
