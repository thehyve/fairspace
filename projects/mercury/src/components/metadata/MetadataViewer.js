import React from 'react';
import List from '@material-ui/core/List';
import {withStyles} from '@material-ui/core/styles';
import MetadataProperty from "./MetadataProperty";
import {isDateTimeProperty, shouldPropertyBeHidden} from "../../utils/metadataUtils";

const styles = {
    root: {
        minWidth: 200,
        maxWidth: 500,
        marginBottom: 100
    }
};

const MetadataViewer = ({properties, editable, subject, classes}) => {
    if (!properties) {
        return null;
    }

    const domainProp = properties.find(property => property.key === '@type');
    const domain = domainProp && domainProp.values && domainProp.values[0] ? domainProp.values[0].id : undefined;

    return (
        <List dense classes={classes}>
            {
                properties
                    .map((p) => {
                        const property = {...p, domain};

                        return shouldPropertyBeHidden(property) ? null
                            : (
                                <MetadataProperty
                                    editable={editable && !isDateTimeProperty(property)}
                                    subject={subject}
                                    key={property.key}
                                    property={property}
                                />
                            );
                    })
            }
        </List>
    );
};

export default withStyles(styles)(MetadataViewer);
