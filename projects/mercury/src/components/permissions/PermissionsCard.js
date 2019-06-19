import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import {ExpandMore, LockOpen} from "@material-ui/icons";
import {Avatar, Card, CardContent, CardHeader, Collapse, Grid, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";
import PermissionsContainer from "./PermissionsContainer";
import PermissionContext from "./PermissionContext";

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
        width: 30,
        height: 30,
        display: 'inline-block'
    }
});

export const PermissionsCard = ({classes, iri, canManage, maxCollaboratorIcons}) => {
    const {permissions} = useContext(PermissionContext);
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const permissionIcons = permissions
        .slice(0, maxCollaboratorIcons)
        .map(permission => (
            <Grid key={permission.user} item>
                <Avatar title={permission.userName} src="/images/avatar.png" className={classes.avatar} />
            </Grid>
        ));

    const cardHeaderAction = (
        <Grid container direction="row" alignItems="center" spacing={8}>
            {permissionIcons}
            {permissions.length > maxCollaboratorIcons ? <Grid item>and {permissions.length - maxCollaboratorIcons} more</Grid> : ''}
            <Grid item>
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
            </Grid>
        </Grid>
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
