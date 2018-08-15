import React from 'react';
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

function Metadata(props) {
    const {match: { params }} = props;

    return (
        <div>
            <Typography noWrap>{'Metadata'}</Typography>
            <List>
                <ListItem>Type: {params.type}</ListItem>
                <ListItem>Id: {params.id}</ListItem>
            </List>

            Insert metadata component here
        </div>
    );
}

export default (Metadata);



