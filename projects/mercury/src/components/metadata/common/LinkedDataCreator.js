import React from "react";
import PropTypes from "prop-types";
import {Button} from "@material-ui/core";

import LinkedDataShapeChooserDialog from "./LinkedDataShapeChooserDialog";
import {LoadingOverlay} from "../../common";
import NewLinkedDataEntityDialog from "./NewLinkedDataEntityDialog";

class LinkedDataCreator extends React.Component {
    static CREATION_STATE_CHOOSE_SHAPE = 'CHOOSE_SHAPE';

    static CREATION_STATE_CREATE_ENTITY = 'CREATE_ENTITY';

    state = {
        shape: null,
        creationState: null
    };

    unMounted = false;

    componentWillUnmount() {
        this.unMounted = true;
    }

    startCreating = (e) => {
        e.stopPropagation();

        this.setState({creationState: LinkedDataCreator.CREATION_STATE_CHOOSE_SHAPE});
    };

    chooseShape = (shape) => {
        this.setState({
            shape,
            creationState: LinkedDataCreator.CREATION_STATE_CREATE_ENTITY
        });
    };

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        if (!this.unMounted) {
            this.setState({creationState: false});
        }
    };

    render() {
        const {children, shapesLoading, shapesError, shapes, requireIdentifier, onCreate} = this.props;
        const {creationState, shape, creatingMetadataEntity} = this.state;

        return (
            <>
                <Button
                    variant="contained"
                    color="primary"
                    aria-label="Add"
                    title="Create a new metadata entity"
                    onClick={this.startCreating}
                    style={{margin: '10px 0'}}
                    disabled={shapesLoading || shapesError || !shapes}
                >
                    Create
                </Button>

                <LinkedDataShapeChooserDialog
                    open={creationState === LinkedDataCreator.CREATION_STATE_CHOOSE_SHAPE}
                    shapes={shapes}
                    onChooseShape={this.chooseShape}
                    onClose={this.closeDialog}
                />

                {creationState === LinkedDataCreator.CREATION_STATE_CREATE_ENTITY && (
                    <NewLinkedDataEntityDialog
                        shape={shape}
                        onClose={this.closeDialog}
                        onCreate={onCreate}
                        requireIdentifier={requireIdentifier}
                    />
                )}

                {children}

                <LoadingOverlay loading={creatingMetadataEntity} />
            </>
        );
    }
}

LinkedDataCreator.propTypes = {
    shapes: PropTypes.array,
    requireIdentifier: PropTypes.bool,
    onCreate: PropTypes.func
};

LinkedDataCreator.defaultProps = {
    requireIdentifier: true,
    onCreate: () => {}
};

export default LinkedDataCreator;
