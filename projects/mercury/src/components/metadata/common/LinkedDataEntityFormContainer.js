import React from "react";
import PropTypes from "prop-types";
import {Button, Grid} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useExistingEntity from '../UseExistingEntity';
import useFormData from '../UseFormData';

const LinkedDataEntityFormContainer = ({subject, isEditable = true, ...otherProps}) => {
    const {properties, loading, error} = useExistingEntity(subject);
    const {
        extendPropertiesWithChanges, canSubmit, onSubmit,
        submitDisabled, onAdd, onChange, onDelete,
    } = useFormData(subject);

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityForm
                    {...otherProps}
                    error={error}
                    loading={loading}
                    properties={extendPropertiesWithChanges(properties)}
                    onAdd={onAdd}
                    onChange={onChange}
                    onDelete={onDelete}
                />
            </Grid>
            {
                canSubmit && isEditable
                && (
                    <Grid item>
                        <Button
                            onClick={onSubmit}
                            color="primary"
                            disabled={submitDisabled}
                        >
                            Update
                        </Button>
                    </Grid>
                )
            }
        </Grid>
    );
};

LinkedDataEntityFormContainer.propTypes = {
    formKey: PropTypes.string.isRequired,
    isEditable: PropTypes.bool,
};

export default LinkedDataEntityFormContainer;
