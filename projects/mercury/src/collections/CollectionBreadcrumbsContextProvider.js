import React from "react";
import {FolderOutlined} from "@material-ui/icons";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Collections',
            icon: <FolderOutlined />,
            href: '/collections'
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
