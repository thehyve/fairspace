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

    const renderProperty =
            property => <MetadataProperty
                editable={props.editable && !isDateTimeProperty(property)}
                subject={props.subject}
                key={property.key}
                property={property} />

    return <List dense classes={props.classes}>
        {props.properties.map(renderProperty)}
        </List>
}

export default withStyles(styles)(MetadataViewer)
