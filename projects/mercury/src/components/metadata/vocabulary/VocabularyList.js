import React from "react";
import {
    Paper, Table, TableBody, TableCell,
    TableHead, TableRow, withStyles, Typography,
    Tooltip, ListItemText
} from "@material-ui/core";

import styles from '../common/LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";

const VocabularyList = ({items = [], total, hasHighlights, onVocabularyOpen, classes, footerRender}) => {
    const renderRow = ({id, name, description, typeLabel, typeUrl, highlights}) => (
        <Tooltip
            key={id}
            enterDelay={350}
            title={(
                <Typography
                    variant="caption"
                    color="inherit"
                    style={{whiteSpace: 'pre-line'}}
                >
                    {id}
                </Typography>
            )}
        >
            <TableRow
                key={id}
                hover
                onDoubleClick={() => onVocabularyOpen(id)}
            >
                <TableCell style={{
                    width: hasHighlights ? '40%' : '65%',
                    paddingTop: 10,
                    paddingBottom: 10,
                }}
                >
                    <ListItemText primary={name} secondary={description} />
                </TableCell>
                <TableCell style={{minWidth: 140}}>
                    <a href={typeUrl}> {typeLabel} </a>
                </TableCell>
                {hasHighlights && (
                    <TableCell style={{minWidth: 200}}>
                        <SearchResultHighlights highlights={highlights} />
                    </TableCell>
                )}
            </TableRow>
        </Tooltip>
    );

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Entity</TableCell>
                        <TableCell>Type</TableCell>
                        {hasHighlights && <TableCell>Match</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map(renderRow)}
                </TableBody>
                {footerRender({count: total, colSpan: hasHighlights ? 4 : 3})}
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(VocabularyList);
