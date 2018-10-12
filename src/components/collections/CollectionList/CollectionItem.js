import React from 'react';
import Typography from "@material-ui/core/Typography";

function Collection(props) {
    const {collection} = props;
    return (<Typography>{collection.name}</Typography>);
}

export default Collection;
