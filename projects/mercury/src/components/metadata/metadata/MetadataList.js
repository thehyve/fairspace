import React from "react";
import {
    Paper, Table, TableBody, TableCell,
    TableHead, TableRow, withStyles
} from "@material-ui/core";

import LinkedDataLink from "../common/LinkedDataLink";
import styles from '../common/LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";
import {METADATA_PATH, VOCABULARY_PATH} from "../../../constants";
import {getLabel} from "../../../utils/linkeddata/metadataUtils";

const MetadataList = ({items = [], hasHighlights, classes}) => (
    <Paper className={classes.root}>
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>URI</TableCell>
                    {hasHighlights && <TableCell>Match</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    items.map(({id, label, shape, highlights}) => (
                        <TableRow key={id}>
                            <TableCell className={classes.cell}>
                                {label}
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <LinkedDataLink editorPath={VOCABULARY_PATH} uri={shape['@id']}>
                                    {getLabel(shape, true)}
                                </LinkedDataLink>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <LinkedDataLink editorPath={METADATA_PATH} uri={id}>
                                    {label}
                                </LinkedDataLink>
                            </TableCell>
                            {hasHighlights && (
                                <TableCell>
                                    <SearchResultHighlights highlights={highlights} />
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    </Paper>
);

export default withStyles(styles)(MetadataList);
