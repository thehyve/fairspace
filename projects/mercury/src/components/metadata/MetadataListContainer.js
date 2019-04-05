import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {Button} from "@material-ui/core";
import {getLabel, relativeLink} from "../../utils/metadataUtils";
import * as metadataActions from "../../actions/metadataActions";
import MetadataTypeChooserDialog from "./MetadataTypeChooserDialog";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../common";
import MetaList from './MetaList';
import NewMetadataEntityDialog from "./NewMetadataEntityDialog";

class MetadataListContainer extends React.Component {
    static CREATION_STATE_CHOOSE_TYPE = 'CHOOSE_TYPE';

    static CREATION_STATE_CREATE_ENTITY = 'CREATE_ENTITY';

    state = {
        shape: null,
        creationState: false
    };

    componentDidMount() {
        this.props.fetchAllEntitiesIfNeeded();
        this.props.fetchMetadataVocabularyIfNeeded();
    }

    startCreating = (e) => {
        e.stopPropagation();

        this.setState({creationState: MetadataListContainer.CREATION_STATE_CHOOSE_TYPE});
    };

    chooseType = (shape) => {
        this.setState({
            shape,
            creationState: MetadataListContainer.CREATION_STATE_CREATE_ENTITY
        });
    };

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({creationState: false});
    };

    handleEntityCreation = (shape, id) => {
        this.props.createMetadataEntity(shape, id)
            .then((res) => {
                this.props.fetchAllEntitiesIfNeeded();
                this.props.history.push(relativeLink(res.value));
            })
            .catch(e => ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`));
    };

    render() {
        const {loading, creatingMetadataEntity, error, entities} = this.props;

        if (loading) {
            return <LoadingInlay />;
        }

        if (error) {
            return <ErrorMessage message="An error occurred while loading metadata" />;
        }

        return (
            <>
                <Button
                    variant="contained"
                    color="primary"
                    aria-label="Add"
                    title="Create a new metadata entity"
                    onClick={this.startCreating}
                    style={{margin: '10px 0'}}
                    disabled={!this.props.shapes}
                >
                    Create
                </Button>

                <MetadataTypeChooserDialog
                    open={this.state.creationState === MetadataListContainer.CREATION_STATE_CHOOSE_TYPE}
                    shapes={this.props.shapes}
                    onChooseShape={this.chooseType}
                    onClose={this.closeDialog}
                />
                <NewMetadataEntityDialog
                    open={this.state.creationState === MetadataListContainer.CREATION_STATE_CREATE_ENTITY}
                    shape={this.state.shape}
                    onCreate={this.handleEntityCreation}
                    onClose={this.closeDialog}
                />

                {entities && entities.length > 0 ? <MetaList items={entities} /> : null}
                <LoadingOverlay loading={creatingMetadataEntity} />
            </>
        );
    }
}

const mapStateToProps = ({metadataBySubject, cache: {allEntities, vocabulary}}) => {
    const pending = !allEntities || allEntities.pending || !vocabulary || vocabulary.pending;
    const allEntitiesData = allEntities && allEntities.data ? allEntities.data : [];
    const vocabularyData = vocabulary ? vocabulary.data : undefined;
    const entities = allEntitiesData.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: getLabel(vocabularyData.determineShapeForType(e['@type'][0]), true)
    }));

    return ({
        loading: pending,
        error: allEntities ? allEntities.error : false,
        shapes: vocabularyData && vocabularyData.getFairspaceClasses(),
        entities,
        creatingMetadataEntity: metadataBySubject.creatingMetadataEntity
    });
};

const mapDispatchToProps = {
    ...metadataActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MetadataListContainer));
