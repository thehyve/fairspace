import React, {useContext} from 'react';
import PropTypes from "prop-types";
import {Link as RouterLink} from 'react-router-dom';
import { Breadcrumbs, Link, SvgIcon, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import BreadcrumbsContext from "../contexts/BreadcrumbsContext";

/**
 * Renders a list of breadcrumbs
 *
 * @param segments  Segments of the breadcrumbs after the first 'home' entry
 * @param match     Match of the current route, provided by react-router
 * @param classes   Classes for styling. Provided by material-ui withStyles
 * @returns {Array}
 * @constructor
 */
const BreadCrumbs = ({classes, additionalSegments = []}) => {
    const {segments: contextSegments} = useContext(BreadcrumbsContext);
    const allSegments = [...contextSegments, ...additionalSegments];

    return (
        <Breadcrumbs aria-label="Breadcrumbs" className={classes.root}>
            {allSegments.map(({label, icon, href}, idx) => (
                <Typography
                    component="span"
                    key={href}
                    className={classes.link}
                    color={idx === allSegments.length - 1 ? 'textPrimary' : 'inherit'}
                >
                    { icon ? <div className={classes.icon}>{icon}</div> : undefined }
                    { idx === allSegments.length - 1
                        ? label
                        : (
                            <Link
                                component={RouterLink}
                                className={classes.link}
                                color="inherit"
                                to={href}
                            >
                                {label}
                            </Link>
                        ) }
                </Typography>
            ))}
        </Breadcrumbs>
    );
};

BreadCrumbs.propTypes = {
    additionalSegments: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.instanceOf(SvgIcon),
            href: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    )
};

const styles = theme => ({
    root: {
        padding: theme.spacing(1, 2),
        display: 'flex'
    },
    link: {
        display: 'flex',
    },
    icon: {
        marginRight: theme.spacing(1),
        width: 24,
        height: 24,
    }
});

export default withStyles(styles)(BreadCrumbs);
