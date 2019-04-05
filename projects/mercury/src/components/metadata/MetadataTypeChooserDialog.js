import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Paper
} from "@material-ui/core";

import * as PropTypes from "prop-types";
import {getLabel} from "../../utils/metadataUtils";
import {compareBy} from "../../utils/comparisionUtils";
import LoadingInlay from '../common/LoadingInlay';

class MetadataTypeChooserDialog extends React.Component {
    state = {
        shape: null
    };

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.props.onClose();
    };

    chooseShape = (shape) => {
        this.props.onChooseShape(shape);
    };

    handleInputChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.closeDialog}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Choose metadata type</DialogTitle>
                <DialogContent>
                    <Paper style={{maxHeight: 400, overflow: 'auto', width: 400}}>
                        {
                            this.props.shapes.length
                                ? (
                                    <List>
                                        {
                                            this.props.shapes.sort(compareBy(getLabel)).map(t => (
                                                <ListItem
                                                    key={t['@id']}
                                                    button
                                                    selected={this.state.shape === t}
                                                    onClick={() => this.chooseShape(t)}
                                                >
                                                    <ListItemText
                                                        primary={getLabel(t)}
                                                    />
                                                </ListItem>
                                            ))
                                        }
                                    </List>
                                )
                                : <LoadingInlay />
                        }
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.closeDialog}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

MetadataTypeChooserDialog.propTypes = {
    onChooseShape: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    shapes: PropTypes.array
};

export default MetadataTypeChooserDialog;
