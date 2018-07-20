import React from 'react';
import Typography from "@material-ui/core/Typography";

function Collection(props) {
    const {collection} = props;

    return (
        <div>
            <Typography variant="headline">{collection.name}</Typography>
            <Typography variant="subheading">{collection.description}</Typography>
        </div>
    );
}

export default Collection;




