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
import {getLabel} from "../../../utils/linkeddata/metadataUtils";
import {compareBy} from "../../../utils/genericUtils";
import LoadingInlay from '../../common/LoadingInlay';

const LinkedDataShapeChooserDialog = props => {
    const closeDialog = (e) => {
        if (e) e.stopPropagation();
        props.onClose();
    };

    return (
        <Dialog
            open={props.open}
            onClose={closeDialog}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">Type</DialogTitle>
            <DialogContent>
                <Paper style={{maxHeight: 400, overflow: 'auto', width: 400}}>
                    {
                        props.shapes && props.shapes.length
                            ? (
                                <List>
                                    {
                                        props.shapes.sort(compareBy(getLabel)).map(t => (
                                            <ListItem
                                                key={t['@id']}
                                                button
                                                onClick={() => props.onChooseShape(t)}
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
                    onClick={closeDialog}
                    color="secondary"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LinkedDataShapeChooserDialog.propTypes = {
    onChooseShape: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    shapes: PropTypes.array
};

export default LinkedDataShapeChooserDialog;
