import React from 'react';
import List from '@material-ui/core/List';

import MetadataProperty from "./MetadataProperty";

const metaEntity = ({properties, subject, editable}) => (
    <List dense>
        {
            properties.map((p) => (
                <MetadataProperty
                    editable={editable && p.editable}
                    subject={subject}
                    key={p.key}
                    property={p}
                />
            ))
        }
    </List>
);

export default metaEntity;
