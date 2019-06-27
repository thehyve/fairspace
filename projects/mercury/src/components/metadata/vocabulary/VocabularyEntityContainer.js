import React from "react";
import {connect} from 'react-redux';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
    fetchMetadataVocabularyIfNeeded,
    fetchMetaVocabularyIfNeeded,
    submitVocabularyChangesFromState
} from "../../../actions/vocabularyActions";
import {
    getMetaVocabulary,
    getVocabulary,
    hasMetaVocabularyError,
    hasVocabularyError,
    isMetaVocabularyPending,
    isVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";
import {partitionErrors, propertiesToShow, url2iri} from "../../../utils/linkeddata/metadataUtils";
import ErrorDialog from "../../common/ErrorDialog";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} from "../../../reducers/linkedDataFormReducers";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";
import {LinkedDataValuesContext} from "../common/LinkedDataValuesContext";
import {getAuthorizations} from "../../../reducers/account/authorizationsReducers";
import Config from "../../../services/Config/Config";
import {isDataSteward} from "../../../utils/userUtils";
import {fromJsonLd} from "../../../utils/linkeddata/jsonLdConverter";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import {
    extendPropertiesWithVocabularyEditingInfo,
    getSystemProperties,
    isFixedShape
} from "../../../utils/linkeddata/vocabularyUtils";
import {VOCABULARY_PATH} from "../../../constants";

const VocabularyEntityContainer = props => {
    const {isEditable, error, buttonDisabled, onSubmit, subject, fetchLinkedData, ...otherProps} = props;

    const handleButtonClick = () => {
        onSubmit(props.subject)
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, subject), e.message);
                } else {
                    ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
                }
            });
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityFormContainer
                    formKey={subject}
                    fetchLinkedData={() => fetchLinkedData(subject)}
                    error={error}
                    {...otherProps}
                />
            </Grid>
            {
                isEditable && !error
                && (
                    <Grid item>
                        <Button
                            onClick={handleButtonClick}
                            color="primary"
                            disabled={buttonDisabled}
                        >
                            Update
                        </Button>
                    </Grid>
                )
            }
        </Grid>
    );
};


const mapStateToProps = (state, ownProps) => {
    const subject = ownProps.subject || url2iri(window.location.href);
    const loading = isVocabularyPending(state) || isMetaVocabularyPending(state);

    const vocabulary = getVocabulary(state);
    const metaVocabulary = getMetaVocabulary(state);
    const metadata = loading ? [] : fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);

    const hasNoMetadata = !metadata || metadata.length === 0;
    const failedLoading = hasNoMetadata && !loading;
    const hasOtherErrors = hasVocabularyError(state) || hasMetaVocabularyError(state);
    const error = failedLoading || hasOtherErrors ? 'An error occurred while loading vocabulary.' : '';

    const isEditable = isDataSteward(getAuthorizations(state), Config.get());
    const buttonDisabled = !hasLinkedDataFormUpdates(state, subject) || hasLinkedDataFormValidationErrors(state, subject);

    // Use the SHACL shape of the subject to determine whether it is fixed
    const shape = vocabulary.get(subject);

    const properties = hasNoMetadata ? [] : extendPropertiesWithVocabularyEditingInfo({
        properties: propertiesToShow(metadata),
        isFixed: isFixedShape(shape),
        systemProperties: getSystemProperties(shape),
        isEditable
    });

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
    fetchShapes: () => dispatch(fetchMetaVocabularyIfNeeded()),
    fetchLinkedData: () => dispatch(fetchMetadataVocabularyIfNeeded()),
    onSubmit: (subject) => dispatch(submitVocabularyChangesFromState(subject))
        .then(() => dispatch(fetchMetadataVocabularyIfNeeded()))
});

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyEntityContainer);
