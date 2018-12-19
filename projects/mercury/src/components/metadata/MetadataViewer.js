import React from 'react';
import List from '@material-ui/core/List';
import {withStyles} from '@material-ui/core/styles';
import MetadataProperty from "./MetadataProperty";
import {isDateTimeProperty} from "../../utils/metadatautils";

const styles = {
    root: {
        minWidth: 200,
        maxWidth: 500,
        marginBottom: 100
    }
};

/**
 * This component will always display correct metadata. If any error occurs it is handled by Metadata
 */
const MetadataViewer = (props) => {
    const domainProp = props.properties && props.properties.find(property => property.key === '@type');
    const domain = domainProp && domainProp.values && domainProp.values[0]
        ? domainProp.values[0].id : undefined;

    const renderProperty = property => (
        <MetadataProperty
            editable={props.editable && !isDateTimeProperty(property)}
            subject={props.subject}
            key={property.key}
            property={property}
        />
    );

    if (!props.properties) {
        return '';
    }

    return (
        <List dense classes={props.classes}>
            {
                props.properties
                    .map((p) => {
                        const property = p;
                        property.domain = domain;
                        return renderProperty(p);
                    })
            }
        </List>
    );
};

export default withStyles(styles)(MetadataViewer);
