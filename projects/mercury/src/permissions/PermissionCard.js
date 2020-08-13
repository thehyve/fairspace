import React, {useState} from 'react';
import PropTypes from "prop-types";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {Avatar, Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";

import LockOpen from "@material-ui/icons/LockOpen";
import PermissionViewer from "./PermissionViewer";
import {getPrincipalsWithCollectionAccess} from "./permissionUtils";

const styles = theme => ({
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
    permissionsCard: {
        marginTop: 10
    },
    avatar: {
        width: 20,
        height: 20,
        display: 'inline-block',
        verticalAlign: 'middle',
        margin: '0 4px'
    },
    additionalCollaborators: {
        display: 'inline-block',
        lineHeight: '20px',
        verticalAlign: 'middle',
        margin: '0 4px'
    }
});

export const PermissionCard = ({classes, collection, users, workspaceUsers, workspaces, maxCollaboratorIcons = 5}) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const collaboratingUsers = getPrincipalsWithCollectionAccess(users, collection.userPermissions, 'User');
    const collaboratingWorkspaces = getPrincipalsWithCollectionAccess(workspaces, collection.workspacePermissions, 'Workspace');
    const allCollaborators = [...collaboratingWorkspaces, ...collaboratingUsers];

    const permissionIcons = allCollaborators
        .slice(0, maxCollaboratorIcons)
        .map(({iri, name}) => (
            <Avatar
                key={iri}
                title={name}
                src="/public/images/avatar.png"
                className={classes.avatar}
            />
        ));

    const cardHeaderAction = (
        <>
            {permissionIcons}
            {allCollaborators.length > maxCollaboratorIcons ? (
                <div className={classes.additionalCollaborators}>
                    + {allCollaborators.length - maxCollaboratorIcons}
                </div>
            ) : ''}
            <IconButton
                className={classnames(classes.expand, {
                    [classes.expandOpen]: expanded,
                })}
                onClick={toggleExpand}
                aria-expanded={expanded}
                aria-label="Show more"
                title="Access"
            >
                <ExpandMore />
            </IconButton>
        </>
    );

    return (
        <Card classes={{root: classes.permissionsCard}}>
            <CardHeader
                action={cardHeaderAction}
                titleTypographyProps={{variant: 'h6'}}
                title="Access"
                avatar={(
                    <LockOpen />
                )}
                subheader="Share the collection with users and workspaces."
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>
                    <PermissionViewer
                        collection={collection}
                        users={users}
                        collaborators={allCollaborators}
                        workspaces={workspaces}
                        workspaceUsers={workspaceUsers}
                    />
                </CardContent>
            </Collapse>
        </Card>
    );
};

PermissionCard.propTypes = {
    classes: PropTypes.object,
    collection: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    workspaceUsers: PropTypes.array.isRequired,
    maxCollaboratorIcons: PropTypes.number
};

export default withStyles(styles)(PermissionCard);
