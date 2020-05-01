import React from "react";
import {FolderOpen} from "@material-ui/icons";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Collections',
            icon: <FolderOpen />,
            href: '/collections'
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
