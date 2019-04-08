import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {Button} from "@material-ui/core";
import {getLabel, relativeLink} from "../../utils/metadataUtils";
import * as metadataActions from "../../actions/metadataActions";
import MetadataShapeChooserDialog from "./MetadataShapeChooserDialog";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../common";
import MetaList from './MetaList';
import {getVocabulary, isVocabularyPending} from "../../selectors/vocabularySelectors";
import NewMetadataEntityDialog from "./NewMetadataEntityDialog";

class MetadataListContainer extends React.Component {
    static CREATION_STATE_CHOOSE_SHAPE = 'CHOOSE_SHAPE';

    static CREATION_STATE_CREATE_ENTITY = 'CREATE_ENTITY';

    state = {
        shape: null,
        creationState: null
    };

    componentDidMount() {
        this.props.fetchAllEntitiesIfNeeded();
        this.props.fetchMetadataVocabularyIfNeeded();
    }

    startCreating = (e) => {
        e.stopPropagation();

        this.setState({creationState: MetadataListContainer.CREATION_STATE_CHOOSE_SHAPE});
    };

    chooseShape = (shape) => {
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
        this.setState({creatingMetadataEntity: true})

        this.props.createMetadataEntity(shape, id)
            .then((res) => {
                this.props.fetchAllEntitiesIfNeeded();
                this.props.history.push(relativeLink(res.value));
                this.setState({creatingMetadataEntity: false})
            })
            .catch(e => {
                ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
                this.setState({creatingMetadataEntity: false});
            });
    }

    render() {
        const {loading, error, entities} = this.props;

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

                <MetadataShapeChooserDialog
                    open={this.state.creationState === MetadataListContainer.CREATION_STATE_CHOOSE_SHAPE}
                    shapes={this.props.shapes}
                    onChooseShape={this.chooseShape}
                    onClose={this.closeDialog}
                />
                <NewMetadataEntityDialog
                    open={this.state.creationState === MetadataListContainer.CREATION_STATE_CREATE_ENTITY}
                    shape={this.state.shape}
                    onCreate={this.handleEntityCreation}
                    onClose={this.closeDialog}
                />

                {entities && entities.length > 0 ? <MetaList items={entities} /> : null}
                <LoadingOverlay loading={this.state.creatingMetadataEntity} />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const {cache: {allEntities}} = state;
    const pending = isVocabularyPending(state) || !allEntities || allEntities.pending;
    const allEntitiesData = allEntities && allEntities.data ? allEntities.data : [];
    const vocabularyData = getVocabulary(state);
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
    });
};

const mapDispatchToProps = {
    ...metadataActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MetadataListContainer));
