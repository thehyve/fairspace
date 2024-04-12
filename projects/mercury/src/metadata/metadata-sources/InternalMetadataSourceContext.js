import React, {useContext} from 'react';
import MetadataSourceContext from './MetadataSourceContext';
import {DEFAULT_METADATA_VIEW_MENU_LABEL} from '../../constants';
import {MetadataSource} from '../external-views/externalMetadataSourceUtils';

const InternalMetadataSourceContext = React.createContext({});

export const InternalMetadataSourceProvider = ({children}) => {
    const {metadataSources = [], error, loading, refresh} = useContext(MetadataSourceContext);

    const internalMetadataSource: MetadataSource = metadataSources.find(source => source.path === null);
    const internalMetadataLabel: string =
        internalMetadataSource && internalMetadataSource.label
            ? internalMetadataSource.label
            : DEFAULT_METADATA_VIEW_MENU_LABEL;
    const internalMetadataIcon: string | null =
        internalMetadataSource && internalMetadataSource.icon ? internalMetadataSource.icon : null;

    return (
        <InternalMetadataSourceContext.Provider
            value={{
                internalMetadataSource,
                internalMetadataLabel,
                internalMetadataIcon,
                error,
                loading,
                refresh
            }}
        >
            {children}
        </InternalMetadataSourceContext.Provider>
    );
};

export default InternalMetadataSourceContext;
