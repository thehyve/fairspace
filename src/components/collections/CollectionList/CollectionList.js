import React from 'react';
import Collection from "./Collection";

function CollectionList(props) {
    if(!props.collections || props.collections.length === 0) {
        return "No collections";
    } else {
        return (
            <ul>
                {props.collections.map(function (collection) {
                    return (<li key={collection.Name} onClick={() => props.onCollectionClick(collection)}><Collection collection={collection}/></li>)
                })}
            </ul>
        );
    }
}

export default CollectionList;
