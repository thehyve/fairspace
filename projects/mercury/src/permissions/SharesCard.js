// @flow
import React, {useContext, useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton, Typography, withStyles} from '@material-ui/core';
import LockOpen from "@material-ui/icons/LockOpen";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import classnames from "classnames";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {Person, Widgets} from "@material-ui/icons";
import SharesDialog from "./SharesDialog";
import CollectionsContext from "../collections/CollectionsContext";
import {getUsersWithCollectionAccess} from "../users/userUtils";
import PermissionsList from "./PermissionsList";
import {sortPermissions} from "./permissionUtils";
import AlterPermissionContainer from "./AlterPermissionContainer";

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

export const SharesCard = ({classes, collection, users, workspaces, workspaceUsers, setBusy = () => {}}) => {
    const {setPermission} = useContext(CollectionsContext);

    const nonWorkspaceUsers = users.filter(u => !workspaceUsers.some(wu => wu.iri === u.iri));
    const nonOwnerWorkspaces = workspaces.filter(w => w.iri !== collection.ownerWorkspace);
    const usersWithCollectionShare = getUsersWithCollectionAccess(nonWorkspaceUsers, collection.userPermissions);
    const workspacesWithCollectionShare = getUsersWithCollectionAccess(nonOwnerWorkspaces, collection.workspacePermissions);

    const workspaceShareCandidates = nonOwnerWorkspaces.filter(w => workspacesWithCollectionShare.every(ws => ws.iri !== w.iri));
    const userShareCandidates = nonWorkspaceUsers.filter(nwu => usersWithCollectionShare.every(s => s.iri !== nwu.iri));

    const [showAddWorkspaceShareDialog, setShowAddWorkspaceShareDialog] = useState(false);
    const [showAddUserShareDialog, setShowAddUserShareDialog] = useState(false);
    const [showAlterPermissionDialog, setShowAlterPermissionDialog] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedPrincipal, setSelectedPrincipal] = useState(null);

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

    const getItemIcon = (principal) => (workspaces.some(w => w.iri === principal.iri) ? (
        <Widgets />
    ) : (
        <Person />
    ));

    const renderSharesList = (shares) => (
        <PermissionsList
            permissions={shares}
            collection={collection}
            setPermission={setPermission}
            selectedPrincipal={selectedPrincipal}
            setSelectedPrincipal={setSelectedPrincipal}
            setShowPermissionDialog={setShowAlterPermissionDialog}
            getItemIcon={getItemIcon}
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
        return renderSharesList([
            ...sortPermissions(workspacesWithCollectionShare),
            ...sortPermissions(usersWithCollectionShare)
        ]);
    };

    const renderShareWithUsersDialog = () => (
        <SharesDialog
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
        <SharesDialog
            collection={collection}
            setPermission={setPermission}
            principalType="workspaces"
            shareCandidates={workspaceShareCandidates}
            setBusy={setBusy}
            showDialog={showAddWorkspaceShareDialog}
            setShowDialog={setShowAddWorkspaceShareDialog}
        />
    );

    const renderAlterPermissionDialog = () => (
        <AlterPermissionContainer
            open={showAlterPermissionDialog}
            onClose={() => setShowAlterPermissionDialog(false)}
            title="Edit share access right"
            user={selectedPrincipal}
            access={selectedPrincipal && selectedPrincipal.access}
            collection={collection}
            accessRights={['List', 'Read']}
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
            {showAlterPermissionDialog && renderAlterPermissionDialog()}
        </div>
    );
};

SharesCard.propTypes = {
    classes: PropTypes.object,
    workspaceUsers: PropTypes.array,
    users: PropTypes.array,
    workspaces: PropTypes.array,
    collection: PropTypes.object,
    setBusy: PropTypes.func.isRequired
};

export default withStyles(styles)(SharesCard);
