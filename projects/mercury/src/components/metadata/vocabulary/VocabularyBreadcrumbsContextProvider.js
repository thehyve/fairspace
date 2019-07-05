import React from "react";
import BreadcrumbsContext from "../../common/breadcrumbs/BreadcrumbsContext";

export default ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [
        {
            label: 'Vocabulary',
            href: '/vocabulary',
            icon: 'code'
        }
    ]}}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
