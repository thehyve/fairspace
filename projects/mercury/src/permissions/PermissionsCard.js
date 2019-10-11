import React, {useState} from 'react';
import PropTypes from "prop-types";
import ExpandMore from "@material-ui/icons/ExpandMore";
import LockOpen from "@material-ui/icons/LockOpen";
import {Avatar, Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";

import PermissionsContainer from "./PermissionsContainer";

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

export const PermissionsCard = ({classes, permissions, iri, canManage = false, maxCollaboratorIcons = 5}) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const permissionIcons = permissions
        .slice(0, maxCollaboratorIcons)
        .map(({user, userName}) => (
            <Avatar
                key={user}
                title={userName}
                src="/public/images/avatar.png"
                className={classes.avatar}
            />
        ));

    const cardHeaderAction = (
        <>
            {permissionIcons}
            {permissions.length > maxCollaboratorIcons ? <div className={classes.additionalCollaborators}>+ {permissions.length - maxCollaboratorIcons}</div> : ''}
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
                    <LockOpen />
                )}
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <PermissionsContainer
                        iri={iri}
                        canManage={canManage}
                    />
                </CardContent>
            </Collapse>
        </Card>
    );
};

PermissionsCard.propTypes = {
    classes: PropTypes.object,
    iri: PropTypes.string.isRequired,
    canManage: PropTypes.bool,
    maxCollaboratorIcons: PropTypes.number
};

export default withStyles(styles)(PermissionsCard);
