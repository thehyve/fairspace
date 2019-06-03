import React from "react";
import {
    Paper, Table, TableBody, TableCell,
    TableHead, TableRow, withStyles, Typography,
    Tooltip
} from "@material-ui/core";

import styles from '../common/LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";

const VocabularyList = ({items = [], hasHighlights, onVocabularyOpen, classes}) => {
    const renderRow = ({id, name, description, typeLabel, typeUrl, highlights}) => (
        <TableRow
            key={id}
            hover
            onDoubleClick={() => onVocabularyOpen(id)}
        >
            <TableCell style={{
                width: hasHighlights ? '40%' : '65%',
                paddingTop: hasHighlights ? 'inherit' : 10,
                paddingBottom: hasHighlights ? 'inherit' : 10,
            }}
            >
                <Typography variant="body1">
                    {name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {description}
                </Typography>
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
                    {
                        items.map((item) => (
                            <Tooltip
                                key={item.id}
                                enterDelay={350}
                                title={(
                                    <Typography
                                        variant="caption"
                                        color="inherit"
                                        style={{whiteSpace: 'pre-line'}}
                                    >
                                        {item.id}
                                    </Typography>
                                )}
                            >
                                {renderRow(item)}
                            </Tooltip>
                        ))
                    }
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(VocabularyList);
