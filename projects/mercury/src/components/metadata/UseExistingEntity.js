import {useEffect} from "react";
import {useDispatch} from 'react-redux';

import useLinkedData from './UseLinkedData';
import {initializeLinkedDataForm} from "../../actions/linkedDataFormActions";

const useExistingEntity = (formKey) => {
    if (!formKey) {
        throw new Error('Please provide a valid form key.');
    }

    const {
        linkedDataForSubject, linkedDataLoading, linkedDataError, getPropertiesForLinkedData
    } = useLinkedData(formKey);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeLinkedDataForm(formKey));
    }, [formKey, dispatch]);

    let error = linkedDataError;

    if (!linkedDataLoading && !(linkedDataForSubject && linkedDataForSubject.length > 0)) {
        error = 'No metadata found for this subject';
    }

    return {
        properties: getPropertiesForLinkedData(),
        loading: linkedDataLoading,
        error,
    };
};

export default useExistingEntity;
