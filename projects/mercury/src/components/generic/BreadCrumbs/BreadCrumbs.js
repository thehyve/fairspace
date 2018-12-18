import React from 'react';
import Button from '@material-ui/core/Button';
import Link from 'react-router-dom/Link';
import {withStyles} from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {flattenShallow, jsxJoin} from "../../../utils/arrayutils";
import menuitems from "../../../menuitems";

const menuEntries = flattenShallow(menuitems.map(sublist => sublist.items));
const defaultHomeEntry = menuEntries[0];

function getBreadCrumbLink(text, path, linkClass) {
    return (<Button component={Link} to={path} key={path} variant='text' className={linkClass}>{text}</Button>);
}

function stripTrailingSlash(path) {
    return path.replace(/\/$/, "");
}

function determineHomeEntry(homeUrl, classes) {
    // Now lookup the right entry. If none is found,
    // default to the first entry in the list.
    const entry = menuEntries.find(entry => entry.url === homeUrl) || defaultHomeEntry;

    // Return a breadcrumb link for the given entry
    return getBreadCrumbLink((
        <span><Icon className={classes.icon}>{entry.icon}</Icon> {entry.label}</span>), entry.url, classes.link)
}

/**
 * Renders a list of breadcrumbs
 *
 * @param segments  Segments of the breadcrumbs after the first 'home' entry
 * @param match     Match of the current route, provided by react-router
 * @param classes   Classes for styling. Provided by material-ui withStyles
 * @returns {Array}
 * @constructor
 */
function BreadCrumbs({homeUrl, segments, match, classes}) {
    // Ensure we only have the first part of the url
    let _homeUrl = match.path
    if (_homeUrl !== '/') {
        _homeUrl = '/' + _homeUrl.split('/')[1];
    }
    if (homeUrl) {
        _homeUrl = homeUrl;
    }

    // Add the first item to the list of breadcrumbs
    let breadcrumbs = [
        determineHomeEntry(_homeUrl, classes)
    ];

    if (segments) {
        let currentPath = stripTrailingSlash(_homeUrl);
        for (let segment of segments) {
            if (segment.segment && segment.label) {
                currentPath += stripTrailingSlash('/' + segment.segment);
                breadcrumbs.push(getBreadCrumbLink(segment.label, currentPath, classes.link))
            }
        }
    }

    return (
        <div className={classes.root}>
            {jsxJoin(breadcrumbs, ' > ')}
        </div>
    )
}

BreadCrumbs.propTypes = {
    homeUrl: PropTypes.string,
    segments: PropTypes.arrayOf(
        PropTypes.shape({
            segment: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        }))
}

const styles = theme => ({
    root: {marginBottom: theme.spacing.unit},
    link: {minWidth: 'auto'},
    icon: {verticalAlign: 'middle', marginRight: theme.spacing.unit}
});

export default withStyles(styles)(withRouter(BreadCrumbs));
