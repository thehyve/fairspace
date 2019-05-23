import React from "react";
import PropTypes from "prop-types";
import {Button} from "@material-ui/core";

import LinkedDataShapeChooserDialog from "./LinkedDataShapeChooserDialog";
import {MessageDisplay, LoadingInlay, LoadingOverlay} from "../../common";
import LinkedDataList from './LinkedDataList';
import NewLinkedDataEntityDialog from "./NewLinkedDataEntityDialog";
import {emptyLinkedData} from "../../../utils/linkeddata/jsonLdConverter";
import {LinkedDataValuesContext} from './LinkedDataValuesContext';

class LinkedDataBrowser extends React.Component {
    static CREATION_STATE_CHOOSE_SHAPE = 'CHOOSE_SHAPE';

    static CREATION_STATE_CREATE_ENTITY = 'CREATE_ENTITY';

    state = {
        shape: null,
        creationState: null
    };

    unMounted = false;

    componentDidMount() {
        this.props.fetchLinkedData();
        this.props.fetchShapes();
    }

    componentWillUnmount() {
        this.unMounted = true;
    }

    startCreating = (e) => {
        e.stopPropagation();

        this.setState({creationState: LinkedDataBrowser.CREATION_STATE_CHOOSE_SHAPE});
    };

    chooseShape = (shape) => {
        this.setState({
            shape,
            creationState: LinkedDataBrowser.CREATION_STATE_CREATE_ENTITY
        });
    };

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({creationState: false});
    };

    handleEntityCreation = (formKey, shape, id) => {
        this.setState({creatingMetadataEntity: true});
        const {create, onError} = this.props;

        create(formKey, shape, id)
            .catch(e => onError(e, id))
            .finally(() => {
                if (!this.unMounted) {
                    this.setState({creatingMetadataEntity: false});
                }
            });
    };

    render() {
        const {loading, hasError, entities, editable, shapes, vocabulary, valueComponentFactory} = this.props;

        if (loading) {
            return <LoadingInlay />;
        }

        if (hasError) {
            return <MessageDisplay message="An error occurred while loading metadata" />;
        }

        return (
            <>
                {editable
                    ? (
                        <Button
                            variant="contained"
                            color="primary"
                            aria-label="Add"
                            title="Create a new metadata entity"
                            onClick={this.startCreating}
                            style={{margin: '10px 0'}}
                            disabled={!shapes}
                        >
                            Create
                        </Button>
                    )
                    : null
                }

                <LinkedDataShapeChooserDialog
                    open={this.state.creationState === LinkedDataBrowser.CREATION_STATE_CHOOSE_SHAPE}
                    shapes={shapes}
                    onChooseShape={this.chooseShape}
                    onClose={this.closeDialog}
                />

                <LinkedDataValuesContext.Provider value={valueComponentFactory}>
                    <NewLinkedDataEntityDialog
                        open={this.state.creationState === LinkedDataBrowser.CREATION_STATE_CREATE_ENTITY}
                        linkedData={emptyLinkedData(vocabulary, this.state.shape)}
                        shape={this.state.shape}
                        onCreate={this.handleEntityCreation}
                        onClose={this.closeDialog}
                    />
                </LinkedDataValuesContext.Provider>

                {entities && entities.length > 0
                    ? <LinkedDataList items={entities} />
                    : <MessageDisplay message="No data is found!" isError={false} />}

                <LoadingOverlay loading={this.state.creatingMetadataEntity} />
            </>
        );
    }
}

LinkedDataBrowser.propTypes = {
    fetchLinkedData: PropTypes.func.isRequired,
    fetchShapes: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,

    loading: PropTypes.bool,
    hasError: PropTypes.bool,
    shapes: PropTypes.array,
    entities: PropTypes.array,
    editable: PropTypes.bool,

    valueComponentFactory: PropTypes.object.isRequired,
    vocabulary: PropTypes.object.isRequired
};

LinkedDataBrowser.defaultProps = {
    editable: true
};

export default LinkedDataBrowser;
