import React from "react";
import {Group} from '@material-ui/icons';
import {BreadcrumbsContext} from "../common";
import {workspacePrefix} from "../workspaces/workspaces";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Users',
            icon: <Group />,
            href: `${workspacePrefix()}/users`
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
