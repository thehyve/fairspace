import React, {useState} from 'react';
import PropTypes from "prop-types";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {Avatar, Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";

import {Group} from "@material-ui/icons";
import {getUsersWithCollectionAccess} from "../users/userUtils";
import CollaboratorsViewer from "./CollaboratorsViewer";

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

export const CollaboratorsCard = ({classes, collection, workspaceUsers, workspaces, maxCollaboratorIcons = 5}) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const collaborators = getUsersWithCollectionAccess(workspaceUsers, collection.userPermissions);
    const ownerWorkspaceAccess = collection.workspacePermissions.find(p => p.iri === collection.ownerWorkspace) || {access: 'None'};
    const ownerWorkspace = {
        iri: collection.ownerWorkspace,
        name: workspaces.find(w => w.iri === collection.ownerWorkspace).name,
        access: ownerWorkspaceAccess.access
    };

    const permissionIcons = collaborators
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
            {collaborators.length > maxCollaboratorIcons ? (
                <div className={classes.additionalCollaborators}>
                    + {collaborators.length - maxCollaboratorIcons}
                </div>
            ) : ''}
            <IconButton
                className={classnames(classes.expand, {
                    [classes.expandOpen]: expanded,
                })}
                onClick={toggleExpand}
                aria-expanded={expanded}
                aria-label="Show more"
                title="Collaborators"
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
                title="Collaborators"
                avatar={(
                    <Group />
                )}
                subheader="Add access rights on the collection to owner workspace or individual members."
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>
                    <CollaboratorsViewer
                        collaboratorCandidates={workspaceUsers}
                        collection={collection}
                        collaborators={collaborators}
                        ownerWorkspace={ownerWorkspace}
                    />
                </CardContent>
            </Collapse>
        </Card>
    );
};

CollaboratorsCard.propTypes = {
    classes: PropTypes.object,
    collection: PropTypes.object.isRequired,
    workspaceUsers: PropTypes.array.isRequired,
    maxCollaboratorIcons: PropTypes.number
};

export default withStyles(styles)(CollaboratorsCard);
