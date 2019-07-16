import React, {useContext, useState} from "react";
import PropTypes from "prop-types";
import {Button, CircularProgress, Grid} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useLinkedData from '../UseLinkedData';
import useFormData from '../UseFormData';
import {getValuesFromProperties, partitionErrors} from "../../../utils/linkeddata/metadataUtils";
import LinkedDataContext from "../LinkedDataContext";
import ErrorDialog from "../../common/ErrorDialog";
import ValidationErrorsDisplay from "./ValidationErrorsDisplay";

const LinkedDataEntityFormContainer = ({subject, defaultType = null, isEditable = true, ...otherProps}) => {
    const {properties, linkedDataLoading, linkedDataError} = useLinkedData(subject, defaultType, isEditable);

    const visibleProperties = properties.filter(p => p.isEditable || p.values.length);
    const values = getValuesFromProperties(properties);

    const {
        addValue, updateValue, deleteValue,
        updates, hasFormUpdates, valuesWithUpdates,
        clearForm
    } = useFormData(values);

    const {submitLinkedDataChanges} = useContext(LinkedDataContext);
    const [isUpdating, setUpdating] = useState(false);

    const reset = () => {
        clearForm();
    };

    const submitForm = () => {
        setUpdating(true);

        submitLinkedDataChanges(subject, updates, defaultType)
            .then(() => reset())
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, subject), e.message);
                } else {
                    ErrorDialog.showError(e, `Error while updating entity.\n${e.message}`);
                }
            })
            .then(() => setUpdating(false));
    };

    let footer;

    if (isUpdating) {
        footer = <CircularProgress />;
    } else if (isEditable) {
        footer = (
            <Button
                onClick={submitForm}
                color="primary"
                disabled={!hasFormUpdates}
            >
                Update
            </Button>
        );
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityForm
                    {...otherProps}
                    error={linkedDataError}
                    loading={linkedDataLoading}
                    properties={visibleProperties}
                    values={valuesWithUpdates}
                    onAdd={addValue}
                    onChange={updateValue}
                    onDelete={deleteValue}
                />
            </Grid>
            {footer && <Grid item>{footer}</Grid>}
        </Grid>
    );
};

LinkedDataEntityFormContainer.propTypes = {
    subject: PropTypes.string.isRequired,
    isEditable: PropTypes.bool,
};

export default LinkedDataEntityFormContainer;
