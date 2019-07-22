import {useState} from "react";
import ErrorDialog from "../common/ErrorDialog";
import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';
import {partitionErrors} from "../../utils/linkeddata/metadataUtils";

const onFormSubmissionError = (e, id) => {
    if (e.details) {
        ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, id), e.message);
    } else {
        ErrorDialog.showError(e, `Error saving entity.\n${e.message}`);
    }
};

const useFormSubmission = (submitFunc, subject) => {
    const [isUpdating, setUpdating] = useState(false);

    const submitForm = () => {
        setUpdating(true);

        submitFunc()
            .catch(e => onFormSubmissionError(e, subject))
            .then(() => setUpdating(false));
    };

    return {isUpdating, submitForm};
};

export default useFormSubmission;
