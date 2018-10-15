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
import styles from './CollectionList.styles';
import {withStyles} from '@material-ui/core/styles';
import DateTime from "../../generic/DateTime/DateTime";
import Typography from "@material-ui/core/Typography/Typography";
import withHovered from "../../generic/WithHovered/WithHovered";
import {compose} from "redux";
import {createShallow} from '@material-ui/core/test-utils';

export const COLLECTION_ICONS = {
    'LOCAL_STORAGE': 'folder_open',
    'S3_BUCKET': 'cloud_open'
};

export const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';


export class CollectionList extends React.Component {

    static getCollectionIcon(collection) {
        if (collection.type && COLLECTION_ICONS.hasOwnProperty(collection.type)) {
            return COLLECTION_ICONS[collection.type];
        } else {
            return COLLECTION_ICONS[DEFAULT_COLLECTION_TYPE];
        }
    }

    render() {
        const {
            collections, selectedCollectionId,
            onCollectionClick, onCollectionDoubleClick, onCollectionDelete
        } = this.props;

        if (!collections || collections.length === 0) {
            return "No collections";
        } else {
            return (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding={'dense'}/>
                            <TableCell>Name</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Access</TableCell>
                            <TableCell/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {collections.map((collection, idx) => {
                            const selected = selectedCollectionId && (collection.id === selectedCollectionId);
                            const classes = this.props.classes;
                            return (
                                    <ClickHandler
                                        component={TableRow}
                                        className={selected ? classes.tableRowSelected : classes.tableRow}
                                        key={collection.id}
                                        selected={selected}
                                        onSingleClick={() => onCollectionClick(collection)}
                                        onDoubleClick={() => onCollectionDoubleClick(collection)}
                                        onMouseOver={(e) => this.props.onItemMouseOver(idx, e)}
                                        onMouseOut={() => this.props.onItemMouseOut(idx)}
                                    >
                                        <TableCell padding={'dense'}>
                                            <Icon>{CollectionList.getCollectionIcon(collection)}</Icon>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <CollectionItem collection={collection}/>
                                        </TableCell>
                                        <TableCell>
                                            <Typography noWrap={true} variant="subtitle2">
                                                <DateTime value={collection.dateCreated}/>
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{collection.access}</TableCell>
                                        <TableCell numeric>
                                            {onCollectionDelete ?
                                                <ButtonWithVerification
                                                    visibility={this.props.hovered !== idx ? 'hidden' : 'visible'}
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
}

export default compose(
    withStyles(styles),
    withHovered
)(CollectionList);
