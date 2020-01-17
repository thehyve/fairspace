import React from "react";
import PropTypes from "prop-types";
import {projectPrefix} from "../../projects/projects";

const BreadcrumbsContext = React.createContext({
    segments: [{
        label: 'Project overview',
        href: projectPrefix(),
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
