// @flow
import React, {useState} from 'react';
import {Card, CardContent, CardHeader, IconButton, List, withStyles} from '@material-ui/core';
import {HighlightOffSharp} from '@material-ui/icons';
import LockOpen from "@material-ui/icons/LockOpen";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import PropTypes from "prop-types";
import {sortPermissions} from "../permissions/permissionUtils";
import ErrorDialog from "../common/components/ErrorDialog";
import ConfirmationButton from "../common/components/ConfirmationButton";


const styles = () => ({
    card: {
        marginTop: 10
    }
});

export const CollectionShareCard = ({classes, permissions, workspaces, collection, alterPermission, setBusy = () => {}}) => {
    const workspacesToShareWith = workspaces.filter(ws => permissions.every(p => p.user !== ws.iri));

    const [showAddShareDialog, setShowAddShareDialog] = useState(false);
    const [workspacesToAdd, setWorkspacesToAdd] = useState([]);

    const toggleWorkspaceToAdd = (ws) => {
        // eslint-disable-next-line react/no-access-state-in-setstate
        const workspaceList = [...workspacesToAdd];
        const idx = workspaceList.indexOf(ws);
        if (idx < 0) {
            workspaceList.push(ws);
        } else {
            workspaceList.splice(idx, 1);
        }
        setWorkspacesToAdd(workspaceList);
    };

    const renderPermissionsList = () => (
        <List dense disablePadding>
            {
                sortPermissions(permissions.filter(p => p.access === 'Read')).map(p => (
                    <ListItem key={p.user}>
                        <ListItemText
                            primary={p.name}
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        />
                        {collection.canManage && (
                            <ListItemSecondaryAction>
                                <ConfirmationButton
                                    onClick={() => {
                                        setBusy(true);
                                        alterPermission(p.user, collection.iri, 'None')
                                            .catch(e => ErrorDialog.showError(e, 'Error unsharing the collection'))
                                            .finally(() => setBusy(false));
                                    }}
                                    disabled={p.access === 'Manage'}
                                    message="Are you sure you want to remove this share?"
                                    agreeButtonText="Ok"
                                    dangerous
                                >
                                    <IconButton disabled={p.access === 'Manage' || !collection.canManage}>
                                        <HighlightOffSharp />
                                    </IconButton>
                                </ConfirmationButton>
                            </ListItemSecondaryAction>
                        )}
                    </ListItem>
                ))
            }
        </List>
    );

    const renderShareCollectionDialog = () => (
        <Dialog open={showAddShareDialog}>
            <DialogTitle>Share collection {collection.name} with other workspaces</DialogTitle>
            <DialogContent>
                {
                    workspacesToShareWith.length
                        ? (
                            <List>
                                {
                                    workspacesToShareWith.map(ws => (
                                        <ListItem key={ws.iri} onClick={() => toggleWorkspaceToAdd(ws.iri)}>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={workspacesToAdd.includes(ws.iri)}
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
                        : 'This collection has been already shared with all workspaces'
                }

            </DialogContent>
            <DialogActions>
                <Button
                    onClick={
                        () => {
                            setBusy(true);
                            setShowAddShareDialog(false);

                            Promise.all(workspacesToAdd.map(ws => alterPermission(ws, collection.iri, 'Read')))
                                .catch(e => ErrorDialog.showError(e, 'Error sharing the collection'))
                                .finally(() => setBusy(false));
                        }
                    }
                    color="default"
                >
                    Ok
                </Button>
                <Button
                    onClick={() => setShowAddShareDialog(false)}
                    color="default"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <div>
            <Card classes={{root: classes.card}}>
                <CardHeader
                    titleTypographyProps={{variant: 'h6'}}
                    title="Share"
                    avatar={(
                        <LockOpen />
                    )}
                />
                <CardContent>
                    {renderPermissionsList()}
                    {collection.canManage && !collection.dateDeleted && (
                        <Button
                            style={{margin: 8}}
                            color="primary"
                            variant="text"
                            aria-label="Add"
                            title="Add a new share"
                            onClick={() => {
                                setShowAddShareDialog(true);
                                setWorkspacesToAdd([]);
                            }}
                        >
                            Share
                        </Button>
                    )}
                </CardContent>
            </Card>
            {renderShareCollectionDialog()}
        </div>
    );
};

CollectionShareCard.propTypes = {
    classes: PropTypes.object,
    permissions: PropTypes.array,
    workspaces: PropTypes.array,
    collection: PropTypes.object,
    alterPermission: PropTypes.func.isRequired,
    setBusy: PropTypes.func.isRequired,
};

export default withStyles(styles)(CollectionShareCard);
