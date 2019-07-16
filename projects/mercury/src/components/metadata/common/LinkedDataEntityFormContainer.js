import React, {useContext} from "react";
import PropTypes from "prop-types";
import {Button, CircularProgress, Grid} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useLinkedData from '../UseLinkedData';
import useFormData from '../UseFormData';
import {getValuesFromProperties} from "../../../utils/linkeddata/metadataUtils";
import LinkedDataContext from "../LinkedDataContext";
import useFormSubmission from "../useFormSubmission";

const LinkedDataEntityFormContainer = ({subject, defaultType = null, isEditable = true, ...otherProps}) => {
    const {submitLinkedDataChanges} = useContext(LinkedDataContext);
    const {properties, linkedDataLoading, linkedDataError} = useLinkedData(subject, defaultType, isEditable);

    const visibleProperties = properties.filter(p => p.isEditable || p.values.length);
    const values = getValuesFromProperties(properties);

    const {
        addValue, updateValue, deleteValue, clearForm,
        updates, hasFormUpdates, valuesWithUpdates
    } = useFormData(values);

    const {isUpdating, submitForm} = useFormSubmission(
        () => submitLinkedDataChanges(subject, updates, defaultType)
            .then(() => clearForm()),
        subject
    );

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
