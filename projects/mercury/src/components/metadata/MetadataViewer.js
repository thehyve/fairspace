import React from 'react';
import List from '@material-ui/core/List';
import MetadataProperty from "./MetadataProperty";
import { withStyles } from '@material-ui/core/styles';
import { isDateTimeProperty } from "../../utils/metadatautils";

const styles = {
    root: {
        minWidth: 200,
        maxWidth: 500,
        marginBottom: 100
    }
}

const MetadataViewer = props => {

    const domainProp = props.properties && props.properties.find(p => p.key === '@type');
    const domain = domainProp && domainProp.values && domainProp.values[0] ?
        domainProp.values[0].id : undefined;

    const renderProperty = p =>
    (<MetadataProperty
        editable={props.editable && !isDateTimeProperty(p)}
        subject={props.subject} key={p.key} property={p} />);

    if (!props.properties) {
        return '';
    }

    return <List dense classes={props.classes}>
        { props.properties.map(p => {
                    p.domain = domain;
                    return renderProperty(p);
                })
        }
    </List>
}

export default withStyles(styles)(MetadataViewer)
