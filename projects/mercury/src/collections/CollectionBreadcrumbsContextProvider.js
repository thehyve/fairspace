import React from "react";
import {BreadcrumbsContext} from "../common";
import {projectPrefix} from "../projects/projects";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Collections',
            icon: 'folder_open',
            href: `${projectPrefix()}/collections`
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
