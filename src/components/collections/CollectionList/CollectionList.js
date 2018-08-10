import React from 'react';
import Collection from "./Collection";

function CollectionList(props) {
    if(!props.collections || props.collections.length === 0) {
        return "No collections";
    } else {
        return (
            <ul>
                {props.collections.map(function (collection) {
                    return (<li key={collection.id}
                                onClick={() => props.onCollectionClick(collection)}
                                onDoubleClick={() => props.onCollectionDoubleClick(collection)}
                    ><Collection collection={collection}/></li>)
                })}
            </ul>
        );
    }
}

export default CollectionList;
