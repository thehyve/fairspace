import React from 'react';
import List from '@material-ui/core/List';
import MetadataProperty from "./MetadataProperty";
import {withStyles} from '@material-ui/core/styles';
import {isDateTimeProperty} from "../../utils/metadatautils";

const styles = {
    root: {
        width: '100%'
    }
}

/**
 * This component will always display correct metadata. If any error occurs it is handled by Metadata
 */
const MetadataViewer = props => {

    let type = undefined;
    const typeProp = props.properties.find(property => {
        return property.key === '@type'
    });
    if(typeProp && typeProp.values) {
        type = typeProp.values[0].id;
    }

    const renderProperty =
        property => <MetadataProperty
            editable={props.editable && !isDateTimeProperty(property)}
            subject={props.subject}
            key={property.key}
            property={property}/>

    return <List dense classes={props.classes}>
        {
            props.properties
                .map(property => {
                    property.type = type;
                    return property;
                })
                .map(renderProperty)
        }
    </List>
}

export default withStyles(styles)(MetadataViewer)
