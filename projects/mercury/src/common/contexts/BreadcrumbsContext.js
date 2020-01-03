import React from "react";
import PropTypes from "prop-types";

const BreadcrumbsContext = React.createContext({
    segments: [{
        label: 'ProjectOverview',
        href: '/',
        icon: 'home'
    }]
});

BreadcrumbsContext.Provider.propTypes = {
    value: PropTypes.shape({
        segments: PropTypes.arrayOf(
            PropTypes.shape({
                icon: PropTypes.string,
                href: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            })
        )
    })
};

export default BreadcrumbsContext;
