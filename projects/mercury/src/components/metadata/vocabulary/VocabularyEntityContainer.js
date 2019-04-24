import React from "react";
import {connect} from 'react-redux';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import {
    getMetaVocabulary,
    getVocabulary,
    hasMetaVocabularyError,
    hasVocabularyError,
    isMetaVocabularyPending,
    isVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";
import {isDateTimeProperty, propertiesToShow, url2iri} from "../../../utils/linkeddata/metadataUtils";
import ErrorDialog from "../../common/ErrorDialog";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {hasLinkedDataFormUpdates} from "../../../reducers/linkedDataFormReducers";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";
import {getAuthorizations} from "../../../reducers/account/authorizationsReducers";
import Config from "../../../services/Config/Config";
import {isDataSteward} from "../../../utils/userUtils";
import {fromJsonLd} from "../../../utils/linkeddata/jsonLdConverter";

const VocabularyEntityContainer = props => {
    const {editable, buttonDisabled, onSubmit, subject, fetchLinkedData, ...otherProps} = props;

    const handleButtonClick = () => {
        onSubmit(props.subject)
            .catch(err => ErrorDialog.showError(err, "Error while updating vocabulary"));
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityFormContainer
                    editable={editable}
                    formKey={subject}
                    valueComponentFactory={VocabularyValueComponentFactory}
                    fetchLinkedData={() => fetchLinkedData(subject)}
                    {...otherProps}
                />
            </Grid>
            {
                editable
                    ? (
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
                    : null
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
    const hasOtherErrors = hasVocabularyError(state) || hasMetaVocabularyError(state);
    const error = hasNoMetadata || hasOtherErrors ? 'An error occurred while loading vocabulary.' : '';

    const editable = isDataSteward(getAuthorizations(state), Config.get());

    const buttonDisabled = !hasLinkedDataFormUpdates(state, subject);

    const properties = hasNoMetadata ? [] : propertiesToShow(metadata)
        .map(p => ({
            ...p,
            editable: editable && !isDateTimeProperty(p)
        }));

    return {
        loading,
        error,

        properties,
        subject,

        editable,
        buttonDisabled,
        vocabulary: metaVocabulary
    };
};

const mapDispatchToProps = (dispatch) => ({
    fetchShapes: () => dispatch(vocabularyActions.fetchMetaVocabularyIfNeeded()),
    fetchLinkedData: () => dispatch(vocabularyActions.fetchMetadataVocabularyIfNeeded()),
    onSubmit: (subject) => dispatch(vocabularyActions.submitVocabularyChangesFromState(subject))
        .then(() => dispatch(vocabularyActions.fetchMetadataVocabularyIfNeeded()))
});

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyEntityContainer);
