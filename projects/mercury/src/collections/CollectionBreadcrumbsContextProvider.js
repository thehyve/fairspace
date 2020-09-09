import React from "react";
import {Folder} from "@material-ui/icons";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Collections',
            icon: <Folder />,
            href: '/collections'
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
