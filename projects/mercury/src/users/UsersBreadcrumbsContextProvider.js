import React from "react";
import {BreadcrumbsContext} from "../common";
import {projectPrefix} from "../projects/projects";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Users',
            icon: 'group',
            href: `${projectPrefix()}/users`
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
