import React, {useState} from "react";
import {
    Paper, Table, TableBody, TableCell,
    TableHead, TableRow, withStyles, Typography,
    Tooltip, Grid,
} from "@material-ui/core";

import styles from '../common/LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";

const LinkedDataList = ({items = [], hasHighlights, onVocabularyOpen, classes}) => {
    const [hoveredItem, setHoveredItem] = useState(null);

    const renderItem = ({id, name, description, typeLabel, typeUrl, highlights}) => (
        <TableRow
            key={id}
            hover
            onMouseEnter={() => setHoveredItem(id)}
            onMouseLeave={() => setHoveredItem(null)}
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
                    {/* <Grid container alignItems="center" spacing={8}>
                                        <Grid item>
                                            {name}
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title={id}>
                                                <Info color="disabled" fontSize="small" />
                                            </Tooltip>
                                        </Grid>
                                    </Grid> */}
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
                            hoveredItem === item.id
                                ? (
                                    <Tooltip key={item.id} title={item.id}>
                                        {renderItem(item)}
                                    </Tooltip>
                                )
                                : renderItem(item)
                        ))
                    }
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(LinkedDataList);
