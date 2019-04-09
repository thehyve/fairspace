import React from "react";
import PropTypes from "prop-types";

import {Button} from "@material-ui/core";
import ShapeChooserDialog from "./ShapeChooserDialog";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../../common";
import MetaList from './MetaList';
import NewEntityDialog from "./NewEntityDialog";

class MetaBrowser extends React.Component {
    static CREATION_STATE_CHOOSE_SHAPE = 'CHOOSE_SHAPE';

    static CREATION_STATE_CREATE_ENTITY = 'CREATE_ENTITY';

    state = {
        shape: null,
        creationState: null
    };

    unMounted = false;

    componentDidMount() {
        this.props.fetch();
        this.props.fetchShapes();
    }

    componentWillUnmount() {
        this.unMounted = true;
    }

    startCreating = (e) => {
        e.stopPropagation();

        this.setState({creationState: MetaBrowser.CREATION_STATE_CHOOSE_SHAPE});
    };

    chooseShape = (shape) => {
        this.setState({
            shape,
            creationState: MetaBrowser.CREATION_STATE_CREATE_ENTITY
        });
    };

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({creationState: false});
    };

    handleEntityCreation = (shape, id) => {
        this.setState({creatingMetadataEntity: true});

        this.props.create(shape, id)
            .then(() => {
                if (!this.unMounted) {
                    this.setState({creatingMetadataEntity: false});
                }
            })
            .catch(e => {
                ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
                if (!this.unMounted) {
                    this.setState({creatingMetadataEntity: false});
                }
            });
    };

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

                <ShapeChooserDialog
                    open={this.state.creationState === MetaBrowser.CREATION_STATE_CHOOSE_SHAPE}
                    shapes={this.props.shapes}
                    onChooseShape={this.chooseShape}
                    onClose={this.closeDialog}
                />
                <NewEntityDialog
                    open={this.state.creationState === MetaBrowser.CREATION_STATE_CREATE_ENTITY}
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

MetaBrowser.propTypes = {
    fetch: PropTypes.func.isRequired,
    fetchShapes: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,

    loading: PropTypes.bool,
    error: PropTypes.bool,
    shapes: PropTypes.array,
    entities: PropTypes.array
};

export default MetaBrowser;
