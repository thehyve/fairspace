import React from "react";
import {
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    withStyles,
} from "@material-ui/core";

import styles from './LinkedDataList.styles';
import {TOOLTIP_ENTER_DELAY} from "../../constants";
import IriTooltip from "../../common/components/IriTooltip";
import Iri from "../../common/components/Iri";
import SearchResultHighlights from "../../search/SearchResultHighlights";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";

const ROWS_PER_PAGE = [5, 10, 25];

const LinkedDataList = ({
    entities = [],
    total = 0,
    page = 0, setPage,
    size = 0, setSize,
    hasHighlights,
    onOpen,
    classes,

    error,
    pending,
    isSearching
}) => {
    if (pending) {
        return <LoadingInlay />;
    }

    if (error) {
        return <MessageDisplay message="An error occurred while loading data" />;
    }

    if (total === 0) {
        return <MessageDisplay message={isSearching ? 'No results found' : 'The metadata is empty'} isError={false} />;
    }

    const renderRow = (entry) => {
        const {id, typeLabel, primaryText, secondaryText, highlights, shape} = entry;

        return (
            <IriTooltip
                key={id}
                enterDelay={TOOLTIP_ENTER_DELAY}
                title={<Iri iri={id} />}
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
                        {typeLabel}
                    </TableCell>
                    {hasHighlights && (
                        <TableCell style={{minWidth: 200}}>
                            <SearchResultHighlights highlights={highlights} typeShape={shape} />
                        </TableCell>
                    )}
                </TableRow>
            </IriTooltip>
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
                    {entities.map(renderRow)}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={ROWS_PER_PAGE}
                            rowsPerPage={ROWS_PER_PAGE.includes(size) ? size : ROWS_PER_PAGE[0]}
                            colSpan={hasHighlights ? 4 : 3}
                            count={total}
                            page={page}
                            onChangePage={(_, p) => setPage(p)}
                            onChangeRowsPerPage={(e) => setSize(e.target.value)}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(LinkedDataList);
