import {useState} from "react";
import {useSelector} from "react-redux";
import useIsMounted from "react-is-mounted-hook";
import {ErrorDialog} from "@fairspace/shared-frontend";

import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';
import {partitionErrors, getNamespacedIri} from "../common/utils/linkeddata/metadataUtils";
import {getVocabulary} from "../common/redux/reducers/cache/vocabularyReducers";

export const useFormSubmission = (submitFunc, subject, namespaces) => {
    const [isUpdating, setUpdating] = useState(false);
    const isMounted = useIsMounted();

    const toNamespaced = iri => !!iri && getNamespacedIri(iri, namespaces);

    const withNamespacedProperties = (error) => ({
        ...error,
        subject: toNamespaced(error.subject),
        predicate: toNamespaced(error.predicate)
    });

    const onFormSubmissionError = (error) => {
        if (error.details) {
            const partitionedErrors = partitionErrors(error.details, subject);
            const entityErrors = partitionedErrors.entityErrors.map(withNamespacedProperties);
            const otherErrors = partitionedErrors.otherErrors.map(withNamespacedProperties);

            ErrorDialog.renderError(ValidationErrorsDisplay, {otherErrors, entityErrors}, error.message);
        } else {
            ErrorDialog.showError(error, `Error saving entity.\n${error.message}`);
        }
    };

    const submitForm = () => {
        setUpdating(true);

        submitFunc()
            .catch(onFormSubmissionError)
            .then(() => isMounted() && setUpdating(false));
    };

    return {isUpdating, submitForm};
};

const useStatefulFormSubmission = (submitFunc, subject) => {
    const namespaces = useSelector(state => getVocabulary(state).getNamespaces());
    return useFormSubmission(submitFunc, subject, namespaces);
};

export default useStatefulFormSubmission;
