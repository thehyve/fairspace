import React from 'react';
import {Link} from "react-router-dom";
import {Icon, List, ListItem, ListItemIcon, ListItemText, Typography, withStyles} from "@material-ui/core";
import {formatDateTime} from '../common';

const styles = theme => ({
    listItemIcon: {
        marginRight: 0
    },
    primaryAction: {
        color: theme.palette.primary.main
    },
    secondaryAction: {
        color: theme.palette.primary.light
    }
});

function RecentActivity({classes}) {
    const justnow = new Date(); justnow.setMinutes(justnow.getMinutes() - 8);
    const hourago = new Date(); hourago.setHours(hourago.getHours() - 1);
    const twohoursago = new Date(); twohoursago.setHours(twohoursago.getHours() - 2);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

    const activity = [
        {
            id: 1,
            message:
                <span>
                    <Link
                        to="/collections"
                        className={classes.primaryAction}
                    >
                        Ygritte&apos;s Private Collection
                    </Link>
                    &nbsp;has 4 new files.
                </span>,
            icon: 'folder_open',
            date: justnow
        },
        {
            id: 2,
            message:
                <span>
                    Ygritte has given you write access to
                    <Link
                        to="/collections"
                        className={classes.primaryAction}
                    >
                        Ygritte&apos;s Private Collection
                    </Link>
                    .
                </span>,
            icon: 'lock_open',
            date: hourago
        },
        {
            id: 3,
            message:
                <span>
                    You deleted a collection:
                    <Link
                        to="/collections"
                        className={classes.primaryAction}
                    >
                        Johns Collection
                    </Link>
                    . Click
                    <a
                        href="#restore"
                        className={classes.secondaryAction}
                    >
                        here
                    </a>
                    {' '}
                    to restore.
                </span>,
            icon: 'delete',
            date: twohoursago
        },
        {
            id: 4,
            message:
                <span>
                    Four people accessed files in your collection:
                    <Link
                        to="/collections"
                        className={classes.primaryAction}
                    >
                        Johns Collection
                    </Link>
                    . See detailed audit logs
                    <a
                        href="#auditlogs"
                        className={classes.secondaryAction}
                    >
                        here
                    </a>
                    .
                </span>,
            icon: 'info',
            date: yesterday
        }
    ];

    return (
        <div>
            <Typography variant="h5">Recent activity</Typography>
            <List dense>
                {activity.map(item => (
                    <ListItem key={item.id} disableGutters>
                        <ListItemIcon classes={{root: classes.listItemIcon}}>
                            <Icon>
                                {item.icon}
                            </Icon>
                        </ListItemIcon>
                        <ListItemText primary={item.message} secondary={formatDateTime(item.date)} />
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default withStyles(styles)(RecentActivity);
