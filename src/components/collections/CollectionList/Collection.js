import React from 'react';
import Typography from "@material-ui/core/Typography";

function Collection(props) {
    const {collection} = props;

    return (
        <div>
            <Typography variant="headline">{collection.metadata.name}</Typography>
            <Typography variant="subheading">{collection.metadata.description}</Typography>
        </div>
    );
}

export default Collection;




