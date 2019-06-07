import React from "react";
import {
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    withStyles
} from "@material-ui/core";
import styles from './LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";

const LinkedDataList = ({items = [], total, hasHighlights, onOpen, classes, typeRender, footerRender}) => {
    const renderRow = (entry) => {
        const {id, primaryText, secondaryText, highlights} = entry;

        return (
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
                    onDoubleClick={() => onOpen(id)}
                >
                    <TableCell style={{
                        width: hasHighlights ? '40%' : '65%',
                        paddingTop: 10,
                        paddingBottom: 10,
                    }}
                    >
                        <ListItemText primary={primaryText} secondary={secondaryText} />
                    </TableCell>
                    <TableCell style={{minWidth: 140}}>
                        {typeRender(entry)}
                    </TableCell>
                    {hasHighlights && (
                        <TableCell style={{minWidth: 200}}>
                            <SearchResultHighlights highlights={highlights} />
                        </TableCell>
                    )}
                </TableRow>
            </Tooltip>
        );
    };

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

export default withStyles(styles)(LinkedDataList);
