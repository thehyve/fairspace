import React from "react";
import {FolderOpen} from "@material-ui/icons";
import {BreadcrumbsContext} from "../common";
import {workspacePrefix} from "../workspaces/workspaces";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Collections',
            icon: <FolderOpen />,
            href: `${workspacePrefix()}/collections`
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
