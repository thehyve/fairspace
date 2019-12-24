import {useContext, useState} from "react";
import useIsMounted from "react-is-mounted-hook";
import {ErrorDialog} from "../common";

import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';
import {getNamespacedIri, partitionErrors} from "../common/utils/linkeddata/metadataUtils";
import VocabularyContext from "./VocabularyContext";
import {getNamespaces} from "../common/utils/linkeddata/vocabularyUtils";

export const useFormSubmission = (submitFunc, subject, namespaces, errorDialog = ErrorDialog) => {
    const [isUpdating, setUpdating] = useState(false);
    const isMounted = useIsMounted();

    // from the full IRI to the shortcut/namespaced IRI
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

            errorDialog.renderError(ValidationErrorsDisplay, {otherErrors, entityErrors}, error.message);
        } else {
            errorDialog.showError(error, `Error saving entity.\n${error.message}`);
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
    const {vocabulary} = useContext(VocabularyContext);
    return useFormSubmission(submitFunc, subject, getNamespaces(vocabulary));
};

export default useStatefulFormSubmission;
