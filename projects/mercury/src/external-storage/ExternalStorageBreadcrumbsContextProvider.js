import React from "react";
import {FolderSpecial} from "@material-ui/icons";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";
import {getExternalStoragePathPrefix} from "./externalStorageUtils";

export default ({children, storage}) => (
    <BreadcrumbsContext.Provider value={{
        segments: [
            {
                label: storage.label,
                icon: <FolderSpecial />,
                href: getExternalStoragePathPrefix(storage.name)
            }
        ]
    }}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
