import React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    withStyles
} from "@material-ui/core";

import LinkedDataLink from "../common/LinkedDataLink";
import styles from '../common/LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";
import {SHACL_TARGET_CLASS, VOCABULARY_EDITOR_PATH} from "../../../constants";
import {getLabel} from "../../../utils/linkeddata/metadataUtils";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";

const linkedDataList = ({items = [], hasHighlights, classes}) => (
    <Paper className={classes.root}>
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Shape type</TableCell>
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
                                <a href={getFirstPredicateId(shape, SHACL_TARGET_CLASS)}> {getLabel(shape, true)} </a>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <LinkedDataLink editorPath={VOCABULARY_EDITOR_PATH} uri={id}>
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

export default withStyles(styles)(linkedDataList);
