import React from "react";
import {FolderOpen} from "@material-ui/icons";
import {BreadcrumbsContext} from "../common";
import {projectPrefix} from "../projects/projects";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Collections',
            icon: <FolderOpen />,
            href: `${projectPrefix()}/collections`
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
