import React from 'react';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Icon from "@material-ui/core/Icon";
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography/Typography";
import {compose} from "redux";
import Paper from "@material-ui/core/Paper";
import ClickHandler from "../common/ClickHandler";
import withHovered from "../common/WithHovered";
import DateTime from "../common/DateTime";
import ButtonWithVerification from "../common/buttons/ButtonWithVerification";
import permissionUtils from '../../utils/permissionUtils';
import styles from './CollectionList.styles';
import getDisplayName from "../../utils/userUtils";

export const ICONS = {
    LOCAL_STORAGE: 'folder_open',
    AZURE_BLOB_STORAGE: 'cloud_open',
    S3_BUCKET: 'cloud_open',
    GOOGLE_CLOUD_BUCKET: 'cloud_open'
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

const collectionList = ({
    collections, selectedCollectionId,
    onCollectionClick, onCollectionDoubleClick, onCollectionDelete,
    classes, onItemMouseOver, onItemMouseOut, hovered
}) => {
    if (!collections || collections.length === 0) {
        return "No collections";
    }

    return (
        <Paper className={classes.collectionListContainer}>
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Name</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Creator</TableCell>
                        <TableCell>Access</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {collections.map((collection, idx) => {
                        const selected = selectedCollectionId && (collection.id === selectedCollectionId);
                        const iconName = collection.type && ICONS[collection.type] ? collection.type : DEFAULT_COLLECTION_TYPE;

                        return (
                            <ClickHandler
                                component={TableRow}
                                className={selected ? classes.tableRowSelected : classes.tableRow}
                                key={collection.id}
                                selected={selected}
                                onSingleClick={() => onCollectionClick(collection)}
                                onDoubleClick={() => onCollectionDoubleClick(collection)}
                                onMouseOver={e => onItemMouseOver(idx, e)}
                                onMouseOut={() => onItemMouseOut(idx)}
                            >
                                <TableCell padding="dense">
                                    <Icon>
                                        {ICONS[iconName]}
                                    </Icon>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle1">
                                        {collection.name}
                                    </Typography>
                                    {collection.description}
                                </TableCell>
                                <TableCell>
                                    <Typography noWrap>
                                        <DateTime value={collection.dateCreated} />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography noWrap>
                                        {getDisplayName(collection.creatorObj)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {collection.access}
                                </TableCell>
                                <TableCell>
                                    {onCollectionDelete
                                        ? (
                                            <ButtonWithVerification
                                                visibility={hovered !== idx ? 'hidden' : 'visible'}
                                                aria-label={`Delete ${collection.name}`}
                                                title={`Delete ${collection.name}`}
                                                onClick={() => onCollectionDelete(collection)}
                                                disabled={!permissionUtils.canManage(collection)}
                                            >
                                                <Icon>delete</Icon>
                                            </ButtonWithVerification>
                                        ) : null}
                                </TableCell>
                            </ClickHandler>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default compose(withStyles(styles), withHovered)(collectionList);
