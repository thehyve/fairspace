// @flow
import React, {useState} from 'react';
import {List} from '@material-ui/core';
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import ErrorDialog from "../common/components/ErrorDialog";


export const CollectionShareDialog = ({collection, alterPermission, entitiesName, shareCandidates = [],
    setBusy = () => {}, showDialog, setShowDialog = () => {}}) => {
    const [selectedEntities, setSelectedEntities] = useState([]);

    const toggleSelectedEntities = (entities) => {
        const results = [...selectedEntities];
        const idx = results.indexOf(entities);
        if (idx < 0) {
            results.push(entities);
        } else {
            results.splice(idx, 1);
        }
        setSelectedEntities(results);
    };

    return (
        <Dialog open={showDialog}>
            <DialogTitle>Share collection {collection.name} with other {entitiesName}</DialogTitle>
            <DialogContent>
                {
                    shareCandidates.length
                        ? (
                            <List>
                                {
                                    shareCandidates.map(ws => (
                                        <ListItem key={ws.iri} onClick={() => toggleSelectedEntities(ws.iri)}>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedEntities.includes(ws.iri)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={ws.name}
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            />
                                        </ListItem>
                                    ))
                                }
                            </List>
                        )
                        : `This collection has been already shared with all ${entitiesName}.`
                }
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={
                        () => {
                            setBusy(true);
                            setShowDialog(false);

                            Promise.all(shareCandidates.map(entity => alterPermission(entity, collection.iri, 'Read')))
                                .catch(e => ErrorDialog.showError(e, 'Error sharing the collection'))
                                .finally(() => setBusy(false));
                        }
                    }
                    color="default"
                >
                    Ok
                </Button>
                <Button
                    onClick={() => setShowDialog(false)}
                    color="default"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CollectionShareDialog;
