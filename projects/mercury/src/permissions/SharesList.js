// @flow
import React from 'react';
import {IconButton, List} from '@material-ui/core';
import {HighlightOffSharp} from '@material-ui/icons';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import {sortPermissions} from "./permissionUtils";
import ErrorDialog from "../common/components/ErrorDialog";
import ConfirmationButton from "../common/components/ConfirmationButton";


export const SharesList = ({title, shares, collection, setPermission, setBusy = () => {}}) => {
    const handleRemoveShare = (principal) => {
        setBusy(true);
        setPermission(collection.location, principal, 'None')
            .catch(e => ErrorDialog.showError(e, 'Error unsharing the collection'))
            .finally(() => setBusy(false));
    };

    return (
        <div style={{paddingLeft: 16}}>
            <Typography variant="body1">
                {title}
            </Typography>
            <List dense disablePadding>
                {
                    sortPermissions(shares).map(s => (
                        <ListItem key={s.iri}>
                            <ListItemText
                                primary={s.name}
                                secondary={s.access}
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            />
                            {collection.canManage && (
                                <ListItemSecondaryAction>
                                    <ConfirmationButton
                                        onClick={() => handleRemoveShare(s.iri)}
                                        disabled={s.access === 'Manage'}
                                        message="Are you sure you want to remove this share?"
                                        agreeButtonText="Ok"
                                        dangerous
                                    >
                                        <IconButton disabled={s.access === 'Manage' || !collection.canManage}>
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

export default SharesList;
