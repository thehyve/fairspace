import React from 'react';
import Collection from "./Collection";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Icon from "@material-ui/core/Icon";
import ClickHandler from "../ClickHandler/ClickHandler"
import ButtonWithVerification from "../buttons/ButtonWithVerification/ButtonWithVerification";
import PermissionChecker from "../../permissions/PermissionChecker";

function CollectionList(props) {
    if(!props.collections || props.collections.length === 0) {
        return "No collections";
    } else {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell/>
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
                                    {props.onCollectionDelete ?
                                    <ButtonWithVerification
                                        aria-label={"Delete " + collection.name}
                                        onClick={() => props.onCollectionDelete(collection)}
                                        disabled={!PermissionChecker.canManage(collection)}>
                                        <Icon>delete</Icon>
                                    </ButtonWithVerification> : null}
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
