import React from 'react';
import Collection from "./Collection";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";

function CollectionList(props) {
    if(!props.collections || props.collections.length === 0) {
        return "No collections";
    } else {
        return (
            <List>
                {props.collections.map(function (collection) {
                    return (<ListItem key={collection.name}
                                onClick={() => props.onCollectionClick(collection)}
                                onDoubleClick={() => props.onCollectionDoubleClick(collection)}
                    ><Collection collection={collection}/></ListItem>)
                })}
            </List>
        );
    }
}

export default CollectionList;
