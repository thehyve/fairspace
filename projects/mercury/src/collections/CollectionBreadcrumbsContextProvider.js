import React from 'react';
import {Folder} from '@mui/icons-material';
import BreadcrumbsContext from '../common/contexts/BreadcrumbsContext';

export default ({children}) => (
    <BreadcrumbsContext.Provider
        value={{
            segments: [
                {
                    label: 'Collections',
                    icon: <Folder />,
                    href: '/collections'
                }
            ]
        }}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
