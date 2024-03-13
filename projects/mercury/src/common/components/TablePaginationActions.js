import React from 'react';
import IconButton from '@mui/material/IconButton';
import {KeyboardArrowLeft, KeyboardArrowRight, LastPage, FirstPage} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import {Typography} from '@mui/material';

const useStyles = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5),
    },
}));

export type TablePaginationActionsProperties = {
    count: number;
    onPageChange: () => {};
    page: number;
    rowsPerPage: number;
}

const TablePaginationActions = (props: TablePaginationActionsProperties) => {
    const classes = useStyles();
    const {count, page, rowsPerPage, onPageChange} = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <div className={classes.root}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
                size="medium"
            >
                <FirstPage />
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
                size="medium"
            >
                <KeyboardArrowLeft />
            </IconButton>
            <Typography variant="body2" component="span" display="inline">{page + 1}</Typography>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
                size="medium"
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
                size="medium"
            >
                <LastPage />
            </IconButton>
        </div>
    );
};

export default TablePaginationActions;
