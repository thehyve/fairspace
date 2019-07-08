import useLinkedData from './UseLinkedData';

const useExistingEntity = (subject) => {
    if (!subject) {
        throw new Error('Please provide a valid form key.');
    }

    const {
        linkedDataForSubject, linkedDataLoading, linkedDataError, getPropertiesForLinkedData
    } = useLinkedData(subject);

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
