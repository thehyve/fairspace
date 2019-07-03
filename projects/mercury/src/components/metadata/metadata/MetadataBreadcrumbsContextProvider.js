import React from "react";
import BreadcrumbsContext from "../../common/breadcrumbs/BreadcrumbsContext";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Metadata',
            href: '/metadata',
            icon: 'assignment'
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
