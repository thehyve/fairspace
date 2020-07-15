// @flow
import React, {useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton, Typography, withStyles} from '@material-ui/core';
import LockOpen from "@material-ui/icons/LockOpen";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import classnames from "classnames";
import ExpandMore from "@material-ui/icons/ExpandMore";
import CollectionShareDialog from "./CollectionShareDialog";
import CollectionShareList from "./CollectionShareList";


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

export const CollectionShareCard = ({classes,
    workspacesWithShare, usersWithShare,
    workspaces, collection, users, workspaceUsers,
    alterPermission, setBusy = () => {}}) => {
    const workspaceShares = workspacesWithShare.filter(p => p.access === 'Read' || p.access === 'List');
    const userShares = usersWithShare.filter(p => (
        (p.access === 'Read' || p.access === 'List') && workspaceUsers.every(u => u.iri !== p.user)
    ));

    const [showAddWorkspaceShareDialog, setShowAddWorkspaceShareDialog] = useState(false);
    const [showAddUserShareDialog, setShowAddUserShareDialog] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const workspacesToShareWith = workspaces.filter(ws => workspacesWithShare.every(p => p.user !== ws.iri));
    const usersToShareWith = users.filter(
        u => workspaceUsers
            && workspaceUsers.every(m => m.iri !== u.iri)
            && usersWithShare.every(us => us.user !== u.iri)
    );

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
            alterPermission={alterPermission}
            setBusy={setBusy}
        />
    );

    const renderNoSharesMessage = () => (
        <Typography component="p" className={classes.noSharesMessage}>
            Collection has not been shared yet.
        </Typography>
    );

    const renderShares = () => {
        if (workspaceShares.length === 0 && userShares.length === 0) {
            return renderNoSharesMessage();
        }
        return (
            <div>
                {workspaceShares.length > 0 && renderSharesList(workspaceShares, "Shared with workspaces: ")}
                {userShares.length > 0 && renderSharesList(userShares, "Shared with users: ")}
            </div>
        );
    };

    const renderShareWithUsersDialog = () => (
        <CollectionShareDialog
            collection={collection}
            alterPermission={alterPermission}
            entitiesName="users"
            shareCandidates={usersToShareWith}
            setBusy={setBusy}
            showDialog={showAddUserShareDialog}
            setShowDialog={setShowAddUserShareDialog}
        />
    );

    const renderShareWithWorkspacesDialog = () => (
        <CollectionShareDialog
            collection={collection}
            alterPermission={alterPermission}
            entitiesName="workspaces"
            shareCandidates={workspacesToShareWith}
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
    workspaces: PropTypes.array,
    workspaceUsers: PropTypes.array,
    users: PropTypes.array,
    collection: PropTypes.object,
    alterPermission: PropTypes.func.isRequired,
    setBusy: PropTypes.func.isRequired,
    workspacesWithShare: PropTypes.array,
    usersWithShare: PropTypes.array,
};
export default withStyles(styles)(CollectionShareCard);
