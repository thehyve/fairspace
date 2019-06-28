import React from "react";
import {connect} from 'react-redux';

import {Button, Grid} from "@material-ui/core";

import * as metadataActions from "../../../actions/metadataActions";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import {partitionErrors, propertiesToShow, url2iri} from "../../../utils/linkeddata/metadataUtils";
import {
    getCombinedMetadataForSubject,
    hasMetadataError,
    isMetadataPending
} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import ErrorDialog from "../../common/ErrorDialog";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} from "../../../reducers/linkedDataFormReducers";
import MetadataValueComponentFactory from "./MetadataValueComponentFactory";
import {LinkedDataValuesContext} from "../common/LinkedDataValuesContext";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import {METADATA_PATH} from "../../../constants";

const MetadataEntityContainer = props => {
    const {isEditable, error, buttonDisabled, onSubmit, subject, fetchLinkedData, ...otherProps} = props;

    const handleButtonClick = () => {
        onSubmit(props.subject)
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, subject), e.message);
                } else {
                    ErrorDialog.showError(e, `Error while updating metadata.\n${e.message}`);
                }
            });
    };

    return (
        <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="stretch"
        >
            <Grid item>
                <LinkedDataValuesContext.Provider value={{editorPath: METADATA_PATH, componentFactory: MetadataValueComponentFactory}}>
                    <LinkedDataEntityFormContainer
                        formKey={subject}
                        fetchLinkedData={() => fetchLinkedData(subject)}
                        error={error}
                        {...otherProps}
                    />
                </LinkedDataValuesContext.Provider>
            </Grid>
            {isEditable && !error && (
                <Grid item>
                    <Button
                        onClick={handleButtonClick}
                        color="primary"
                        disabled={buttonDisabled}
                    >
                        Update
                    </Button>
                </Grid>
            )}
        </Grid>
    );
};


const mapStateToProps = (state, ownProps) => {
    const subject = ownProps.subject || url2iri(window.location.href);
    const metadata = getCombinedMetadataForSubject(state, subject);

    const hasNoMetadata = !metadata || metadata.length === 0;
    const loading = isMetadataPending(state, subject) || isVocabularyPending(state);
    const failedLoading = hasNoMetadata && !loading;
    const hasOtherErrors = hasMetadataError(state, subject) || hasVocabularyError(state);
    const error = failedLoading ? 'No metadata found for this subject' : hasOtherErrors ? 'An error occurred while loading metadata.' : '';

    const isEditable = ("isEditable" in ownProps) ? ownProps.isEditable : true;
    const buttonDisabled = !hasLinkedDataFormUpdates(state, subject) || hasLinkedDataFormValidationErrors(state, subject);

    const properties = hasNoMetadata ? [] : propertiesToShow(metadata)
        .map(p => ({
            ...p,
            isEditable: isEditable && !p.machineOnly
        }));

    return {
        loading,
        error,

        properties,
        subject,

        isEditable,
        buttonDisabled
    };
};

const mapDispatchToProps = (dispatch) => ({
    fetchShapes: () => dispatch(vocabularyActions.fetchMetadataVocabularyIfNeeded()),
    fetchLinkedData: (subject) => dispatch(metadataActions.fetchMetadataBySubjectIfNeeded(subject)),
    onSubmit: (subject) => dispatch(metadataActions.submitMetadataChangesFromState(subject))
        .then(() => dispatch(metadataActions.fetchMetadataBySubjectIfNeeded(subject)))
});

export default connect(mapStateToProps, mapDispatchToProps)(MetadataEntityContainer);
