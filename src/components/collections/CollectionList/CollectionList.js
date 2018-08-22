import React from 'react';
import Collection from "./Collection";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Icon from "@material-ui/core/Icon";
import ClickHandler from "../ClickHandler/ClickHandler"
import IconButton from "@material-ui/core/IconButton";

function CollectionList(props) {
    function onDelete(event, collection) {
        event.stopPropagation();

        if(props.onCollectionDelete) {
            props.onCollectionDelete(collection);
        }
    }

    if(!props.collections || props.collections.length === 0) {
        return "No collections";
    } else {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell numeric>Owner</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.collections.map(collection => {
                        return (
                            <ClickHandler
                                    component={TableRow}
                                    key={collection.id}
                                    selected={props.selectedCollection && collection.id === props.selectedCollection.id}
                                      onSingleClick={() => props.onCollectionClick(collection)}
                                      onDoubleClick={() => props.onCollectionDoubleClick(collection)}>
                                <TableCell>
                                    <Icon>folder_open</Icon>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <Collection collection={collection}/>
                                </TableCell>
                                <TableCell numeric>
                                    <IconButton onClick={(e) => onDelete(e, collection)}>
                                        <Icon>delete</Icon>
                                    </IconButton>
                                </TableCell>
                            </ClickHandler>
                        );
                    })}
                </TableBody>
            </Table>
        );
    }
}

export default CollectionList;
