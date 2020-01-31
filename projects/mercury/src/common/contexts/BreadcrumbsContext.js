import React from "react";
import PropTypes from "prop-types";
import {SvgIcon} from '@material-ui/core';
import {Home} from '@material-ui/icons';
import {workspacePrefix} from "../../workspaces/workspaces";

const BreadcrumbsContext = React.createContext({
    segments: [{
        label: 'Workspace overview',
        href: workspacePrefix(),
        icon: <Home />
    }]
});

BreadcrumbsContext.Provider.propTypes = {
    value: PropTypes.shape({
        segments: PropTypes.arrayOf(
            PropTypes.shape({
                icon: PropTypes.instanceOf(SvgIcon),
                href: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            })
        )
    })
};

export default BreadcrumbsContext;
