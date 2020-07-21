// @flow
import React, {useContext, useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton, Typography, withStyles} from '@material-ui/core';
import LockOpen from "@material-ui/icons/LockOpen";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import classnames from "classnames";
import ExpandMore from "@material-ui/icons/ExpandMore";
import CollectionShareDialog from "./CollectionShareDialog";
import CollectionShareList from "./CollectionShareList";
import CollectionsContext from "./CollectionsContext";
import {getUsersWithCollectionAccess} from "../users/userUtils";

const styles = theme => ({
    card: {
        marginTop: 10
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    noSharesMessage: {
        paddingLeft: 16,
        paddingTop: 16,
        color: "gray",
        fontStyle: "italic"
    }
});

export const CollectionShareCard = ({classes, collection, users, workspaces, workspaceUsers, setBusy = () => {}}) => {
    const {setPermission} = useContext(CollectionsContext);

    const nonWorkspaceUsers = users.filter(u => !workspaceUsers.some(wu => wu.iri === u.iri));
    const nonOwnerWorkspaces = workspaces.filter(w => w.iri !== collection.ownerWorkspace);
    const usersWithCollectionShare = getUsersWithCollectionAccess(nonWorkspaceUsers, collection.userPermissions);
    const workspacesWithCollectionShare = getUsersWithCollectionAccess(nonOwnerWorkspaces, collection.workspacePermissions);

    const workspaceShareCandidates = nonOwnerWorkspaces.filter(w => workspacesWithCollectionShare.every(ws => ws.iri !== w.iri));
    const userShareCandidates = nonWorkspaceUsers.filter(nwu => usersWithCollectionShare.every(s => s.iri !== nwu.iri));

    const [showAddWorkspaceShareDialog, setShowAddWorkspaceShareDialog] = useState(false);
    const [showAddUserShareDialog, setShowAddUserShareDialog] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const cardHeaderAction = (
        <IconButton
            className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
            })}
            onClick={toggleExpand}
            aria-expanded={expanded}
            aria-label="Show more"
            title="Share"
        >
            <ExpandMore />
        </IconButton>
    );

    const renderSharesList = (shares, title) => (
        <CollectionShareList
            shares={shares}
            title={title}
            collection={collection}
            setBusy={setBusy}
            setPermission={setPermission}
        />
    );

    const renderNoSharesMessage = () => (
        <Typography component="p" className={classes.noSharesMessage}>
            Collection has not been shared yet.
        </Typography>
    );

    const renderShares = () => {
        if (workspacesWithCollectionShare.length === 0 && usersWithCollectionShare.length === 0) {
            return renderNoSharesMessage();
        }
        return (
            <div>
                {workspacesWithCollectionShare.length > 0 && renderSharesList(workspacesWithCollectionShare, "Shared with workspaces: ")}
                {usersWithCollectionShare.length > 0 && renderSharesList(usersWithCollectionShare, "Shared with users: ")}
            </div>
        );
    };

    const renderShareWithUsersDialog = () => (
        <CollectionShareDialog
            collection={collection}
            setPermission={setPermission}
            principalType="users"
            shareCandidates={userShareCandidates}
            setBusy={setBusy}
            showDialog={showAddUserShareDialog}
            setShowDialog={setShowAddUserShareDialog}
        />
    );

    const renderShareWithWorkspacesDialog = () => (
        <CollectionShareDialog
            collection={collection}
            setPermission={setPermission}
            principalType="workspaces"
            shareCandidates={workspaceShareCandidates}
            setBusy={setBusy}
            showDialog={showAddWorkspaceShareDialog}
            setShowDialog={setShowAddWorkspaceShareDialog}
        />
    );

    return (
        <div>
            <Card classes={{root: classes.card}}>
                <CardHeader
                    action={cardHeaderAction}
                    titleTypographyProps={{variant: 'h6'}}
                    title="Share"
                    avatar={(
                        <LockOpen />
                    )}
                    subheader="Share collection outside the owner workspace."
                />
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent style={{paddingTop: 0}}>
                        {renderShares()}
                        {collection.canManage && !collection.dateDeleted && (
                            <div>
                                <Button
                                    style={{margin: 8}}
                                    color="primary"
                                    variant="text"
                                    aria-label="Add"
                                    title="Add a new workspace share"
                                    onClick={() => setShowAddWorkspaceShareDialog(true)}
                                >
                                    Share with workspaces
                                </Button>
                                <Button
                                    style={{margin: 8}}
                                    color="primary"
                                    variant="text"
                                    aria-label="Add"
                                    title="Add a new user share"
                                    onClick={() => setShowAddUserShareDialog(true)}
                                >
                                    Share with users
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Collapse>
            </Card>
            {showAddUserShareDialog && renderShareWithUsersDialog()}
            {showAddWorkspaceShareDialog && renderShareWithWorkspacesDialog()}
        </div>
    );
};

CollectionShareCard.propTypes = {
    classes: PropTypes.object,
    workspaceUsers: PropTypes.array,
    users: PropTypes.array,
    workspaces: PropTypes.array,
    collection: PropTypes.object,
    setBusy: PropTypes.func.isRequired
};

export default withStyles(styles)(CollectionShareCard);
