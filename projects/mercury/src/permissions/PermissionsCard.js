import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import {ExpandMore, LockOpen} from "@material-ui/icons";
import {Avatar, Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";

import PermissionsContainer from "./PermissionsContainer";
import PermissionContext from "../common/contexts/PermissionContext";

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

export const PermissionsCard = ({classes, iri, canManage, maxCollaboratorIcons}) => {
    const {permissions} = useContext(PermissionContext);
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const permissionIcons = permissions
        .slice(0, maxCollaboratorIcons)
        .map(permission => (
            <Avatar key={permission.user} title={permission.userName} src="/images/avatar.png" className={classes.avatar} />
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

PermissionsCard.defaultProps = {
    maxCollaboratorIcons: 5,
    classes: {},
    canManage: false
};

export default withStyles(styles)(PermissionsCard);
