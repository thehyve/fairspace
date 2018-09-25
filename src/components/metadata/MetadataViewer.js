import React from 'react';
import List from '@material-ui/core/List';
import MetadataProperty from "./MetadataProperty";

/**
 * This component will always display correct metadata. If any error occurs it is handled by Metadata
 */
const MetadataViewer = props => {
    const renderProperty =
            property => <MetadataProperty
                subject={props.subject}
                key={property.key}
                property={property} />

    const {properties, subject, ...otherProps} = props;

    return <List dense {...props}>
        {properties.map(renderProperty)}
        </List>
}

export default MetadataViewer
