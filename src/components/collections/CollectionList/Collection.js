import React from 'react';
import Typography from "@material-ui/core/Typography";

function Collection(props) {
    const {collection} = props;

    return (
        <div>
            <Typography variant="subheading">{collection.Name}</Typography>
            <Typography>Created on: {collection.CreationDate.toLocaleDateString()}</Typography>
        </div>
    );
}

export default Collection;




