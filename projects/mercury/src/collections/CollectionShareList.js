// @flow
import React from 'react';
import {IconButton, List} from '@material-ui/core';
import {HighlightOffSharp} from '@material-ui/icons';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import {sortPermissions} from "../permissions/permissionUtils";
import ErrorDialog from "../common/components/ErrorDialog";
import ConfirmationButton from "../common/components/ConfirmationButton";


export const CollectionShareList = ({title, shares, collection, alterPermission, setBusy = () => {}}) => {
    const handleRemoveShare = (entity) => {
        setBusy(true);
        alterPermission(entity, collection.iri, 'None')
            .catch(e => ErrorDialog.showError(e, 'Error unsharing the collection'))
            .finally(() => setBusy(false));
    };

    return (
        <div style={{paddingLeft: 16}}>
            <Typography variant="body2">
                {title}
            </Typography>
            <List dense disablePadding>
                {
                    sortPermissions(shares).map(p => (
                        <ListItem key={p.user}>
                            <ListItemText
                                primary={p.name}
                                secondary={p.access}
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            />
                            {collection.canManage && (
                                <ListItemSecondaryAction>
                                    <ConfirmationButton
                                        onClick={() => handleRemoveShare(p.user)}
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
        </div>
    );
};

export default CollectionShareList;
