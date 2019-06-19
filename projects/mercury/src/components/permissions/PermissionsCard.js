import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import {Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LockOpenIcon from '@material-ui/icons/LockOpen';
import Avatar from "@material-ui/core/Avatar";
import PermissionsContainer from "./PermissionsContainer";
import PermissionContext from "./PermissionContext";
import Grid from "@material-ui/core/Grid";

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

export const PermissionsCard = ({classes, iri, canManage}) => {
    const {permissions} = useContext(PermissionContext);
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const cardHeaderAction = (
        <Grid container direction="row" alignItems="center">
            {permissions.map(permission => (<Grid item><Avatar key={permission.user} title={permission.user} src="/images/avatar.png" className={classes.avatar} /></Grid>))}
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
                    <ExpandMoreIcon />
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
                    <LockOpenIcon />
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
    canManage: PropTypes.bool
};

PermissionsCard.defaultProps = {
    classes: {},
    canManage: false
};

export default withStyles(styles)(PermissionsCard);
