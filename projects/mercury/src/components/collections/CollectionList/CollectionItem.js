import React from 'react';
import Typography from "@material-ui/core/Typography";

function Collection(props) {
    const {collection} = props;

    return (
        <>
            <Typography variant="subtitle1">
                {collection.name}
            </Typography>
            {collection.description}
        </>
    );
}

export default Collection;
