import React from "react";
import {connect} from 'react-redux';
import {Button} from "@material-ui/core";
import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {
    getVocabulary,
    hasMetaVocabularyError,
    hasVocabularyError,
    isMetaVocabularyPending,
    isVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";
import {getTypeInfo, isDateTimeProperty, linkLabel, propertiesToShow, url2iri} from "../../../utils/metadataUtils";
import ErrorDialog from "../../common/ErrorDialog";
import Grid from "../metadata/MetadataEntityContainer";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";

const VocabularyEntityContainer = props => {
    const {editable, buttonDisabled, onSubmit, subject, ...otherProps} = props;

    const handleButtonClick = () => {
        props.onSubmit(props.subject)
            .catch(err => ErrorDialog.showError(err, "Error while updating vocabulary"));
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityFormContainer editable={editable} subject={subject} {...otherProps} />
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
    const metadata = getVocabulary(state).get(subject);

    const hasNoMetadata = !metadata || metadata.length === 0;
    const hasOtherErrors = hasVocabularyError(state) || hasMetaVocabularyError(state);
    const error = hasNoMetadata || hasOtherErrors ? 'An error occurred while loading metadata.' : '';

    // Find information on the type
    const typeInfo = getTypeInfo(metadata);
    const label = linkLabel(subject);
    const editable = Object.prototype.hasOwnProperty.call(ownProps, "editable") ? ownProps.editable : true;

    const properties = hasNoMetadata ? [] : propertiesToShow(metadata)
        .map(p => ({
            ...p,
            editable: editable && !isDateTimeProperty(p)
        }));

    return {
        loading: isVocabularyPending(state, subject) || isMetaVocabularyPending(state),
        properties,
        subject,
        typeInfo,
        label,
        error,
        showHeader: ownProps.showHeader || false,
        editable,
    };
};

const mapDispatchToProps = {
    fetchShapes: fetchMetaVocabularyIfNeeded,
    fetchLinkedData: fetchMetadataVocabularyIfNeeded
}

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyEntityContainer);
