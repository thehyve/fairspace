import React from 'react';
import Button from '@material-ui/core/Button';
import Link from 'react-router-dom/Link';
import {withStyles} from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {flattenShallow} from "../../utils/arrayUtils";
import menuitems from "../../menuitems";

const menuEntries = flattenShallow(menuitems.map(sublist => sublist.items));
const defaultHomeEntry = menuEntries[0];

function getBreadCrumbLink(text, path, linkClass) {
    return (
        <Button
            component={Link}
            to={path}
            key={path}
            variant="text"
            className={linkClass}
            style={{'text-transform': 'none'}}
        >
            {text}
        </Button>
    );
}

function stripTrailingSlash(path) {
    return path.replace(/\/$/, "");
}

function determineHomeEntry(homeUrl, classes) {
    // Now lookup the right entry. If none is found,
    // default to the first entry in the list.
    const entry = menuEntries.find(e => e.url === homeUrl) || defaultHomeEntry;

    const children = (
        <>
            <Icon className={classes.icon}>
                {entry.icon}
            </Icon>
            {entry.label}
        </>
    );

    // Return a breadcrumb link for the given entry
    return getBreadCrumbLink(children, entry.url, classes.link);
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
const breadCrumbs = ({segments, match, classes, homeUrl}) => {
    // Ensure we only have the first part of the url
    let homePath = match.path;
    if (homePath !== '/') {
        // eslint-disable-next-line prefer-template
        homePath = '/' + homePath.split('/')[1];
    }
    if (homeUrl) {
        homePath = homeUrl;
    }

    // Add the first item to the list of breadcrumbs
    const breadcrumbs = [
        determineHomeEntry(homePath, classes)
    ];

    if (segments) {
        let currentPath = stripTrailingSlash(homePath);
        segments.forEach(segment => {
            if (segment.segment && segment.label) {
                // eslint-disable-next-line prefer-template
                currentPath += stripTrailingSlash('/' + segment.segment);
                breadcrumbs.push(getBreadCrumbLink(segment.label, currentPath, classes.link));
            }
        });
    }

    return (
        <div className={classes.root}>
            {breadcrumbs
                .map((e, index) => (
                    <span key={e.key}>
                        {e} {(index < Object.keys(breadcrumbs).length - 1) ? '>' : null}
                    </span>
                ))
            }
        </div>
    );
};

breadCrumbs.propTypes = {
    homeUrl: PropTypes.string,
    segments: PropTypes.arrayOf(
        PropTypes.shape({
            segment: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    )
};

breadCrumbs.defaultProps = {
    homeUrl: '',
    segments: null
};

const styles = theme => ({
    root: {marginBottom: theme.spacing.unit},
    link: {minWidth: 'auto'},
    icon: {verticalAlign: 'middle', marginRight: theme.spacing.unit}
});

export default withStyles(styles)(withRouter(breadCrumbs));
