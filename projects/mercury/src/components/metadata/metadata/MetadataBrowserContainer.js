import React from 'react';
import Paper from "@material-ui/core/Paper";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {createMetadataIri, getLabel, relativeLink, partitionErrors, linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {createMetadataEntityFromState} from "../../../actions/metadataActions";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataBrowser from "../common/LinkedDataBrowser";
import * as constants from "../../../constants";
import MetadataValueComponentFactory from "./MetadataValueComponentFactory";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";

const MetadataBrowserContainer = ({searchMetadata: search, ...otherProps}) => (
    <>
        <BreadCrumbs />
        <Paper>
            <SearchBar
                placeholder="Search"
                disableUnderline
                onKeyDown={(e, val) => {
                    if (val) {
                        search(val);
                    }
                }}
            />
        </Paper>

        <LinkedDataBrowser {...otherProps} />
    </>
);

const mapStateToProps = (state) => {
    const {cache: {allEntities}} = state;
    const pending = isVocabularyPending(state) || !allEntities || allEntities.pending;
    const allEntitiesData = (allEntities && allEntities.data && allEntities.data.items) || [];
    const vocabulary = getVocabulary(state);

    const entities = allEntitiesData.map(e => ({
        id: e.id,
        label: e.label || e.name || linkLabel(e.id, true),
        type: e.type,
        typeLabel: getLabel(vocabulary.determineShapeForType(e.type), true)
    }));

    const onError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createMetadataIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
        }
    };

    return {
        loading: pending,
        error: allEntities ? allEntities.error : false,
        shapes: vocabulary.getClassesInCatalog(),
        valueComponentFactory: MetadataValueComponentFactory,
        vocabulary,
        entities,
        onError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchMetadata()),
    searchMetadata: (query) => dispatch(searchMetadata(query)),
    fetchShapes: () => dispatch(fetchMetadataVocabularyIfNeeded),
    create: (formKey, shape, id) => {
        const subject = createMetadataIri(id);
        const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);
        return dispatch(createMetadataEntityFromState(formKey, subject, type))
            .then(({value}) => {
                dispatch(searchMetadata());
                ownProps.history.push(relativeLink(value.subject));
            });
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MetadataBrowserContainer));
