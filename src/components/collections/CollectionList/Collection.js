import React from 'react';
import Typography from "@material-ui/core/Typography";

function Collection(props) {
    const {collection} = props;

    return (
        <div>
            <Typography variant="subheading">{collection.metadata.name}</Typography>
            {collection.metadata.description}
        </div>
    );
}

export default Collection;




