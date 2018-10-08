import React from 'react';
import CollectionItem from "./CollectionItem";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Icon from "@material-ui/core/Icon";
import ClickHandler from "../../generic/ClickHandler/ClickHandler"
import ButtonWithVerification from "../buttons/ButtonWithVerification/ButtonWithVerification";
import PermissionChecker from "../../permissions/PermissionChecker";
import './CollectionList.css';

function CollectionList({collections, selectedCollectionId, onCollectionClick, onCollectionDoubleClick, onCollectionDelete}) {
    if(!collections || collections.length === 0) {
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
                    {collections.map(collection => {
                        return (
                            <ClickHandler
                                    component={TableRow}
                                    key={collection.id}
                                    selected={selectedCollectionId && (collection.id === selectedCollectionId)}
                                    onSingleClick={() => onCollectionClick(collection)}
                                    onDoubleClick={() => onCollectionDoubleClick(collection)}>
                                <TableCell>
                                    <Icon>{collection.type === 'S3_BUCKET' ? 'cloud_open' : 'folder_open'}</Icon>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <CollectionItem collection={collection}/>
                                </TableCell>
                                <TableCell numeric>
                                    {onCollectionDelete ?
                                    <ButtonWithVerification
                                        aria-label={"Delete " + collection.name}
                                        onClick={() => onCollectionDelete(collection)}
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
