import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import PropTypes from 'prop-types';

// TODO: With material-ui 4 (VRE-839) we can use the Breadcrumbs component
//       from the material ui core to do the actual rendering
import Breadcrumbs from "@material-ui/lab/Breadcrumbs";

import Icon from '@material-ui/core/Icon';
import {withStyles} from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';


/**
 * Renders a list of breadcrumbs
 *
 * @param segments  Segments of the breadcrumbs after the first 'home' entry
 * @param match     Match of the current route, provided by react-router
 * @param classes   Classes for styling. Provided by material-ui withStyles
 * @returns {Array}
 * @constructor
 */
const breadCrumbs = ({segments, classes}) => (
    <Breadcrumbs aria-label="Breadcrumb" className={classes.root}>
        {segments.map(({label, icon, href}, idx) => (
            <Link
                component={RouterLink}
                className={classes.link}
                color={idx === segments.length - 1 ? 'textPrimary' : 'inherit'}
                key={href}
                to={href}
            >
                {icon ? <Icon className={classes.icon}>{icon}</Icon> : undefined}
                {label}
            </Link>
        ))}
    </Breadcrumbs>
);

breadCrumbs.propTypes = {
    segments: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.string,
            href: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    )
};

breadCrumbs.defaultProps = {
    segments: []
};

const styles = theme => ({
    root: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
        display: 'flex'
    },
    link: {
        display: 'flex',
    },
    icon: {
        marginRight: theme.spacing.unit,
        width: 24,
        height: 24,
    }
});

export default withStyles(styles)(breadCrumbs);
