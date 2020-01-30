import React from "react";
import {Group} from '@material-ui/icons';
import {BreadcrumbsContext} from "../common";
import {projectPrefix} from "../projects/projects";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Users',
            icon: <Group />,
            href: `${projectPrefix()}/users`
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
