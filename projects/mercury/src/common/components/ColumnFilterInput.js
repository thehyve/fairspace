import {TextField} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {alpha} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const useStyles = makeStyles(theme => ({
    search: {
        position: 'relative',
        flex: 0.8,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25)
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 'auto'
        }
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
        fontSize: '0.9rem',
        minWidth: 180,
        maxWidth: 350
    },
    inputInput: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        transition: theme.transitions.create('width'),
        width: '100%'
    },
    adornedEnd: {
        paddingRight: theme.spacing(1)
    },
    adornedEndNoPadding: {
        paddingRight: 0
    },
    adornedEndIcon: {
        padding: 0
    }
}));

const ColumnFilterInput = ({setFilterValue, filterValue = '', placeholder, useApplyButton = false}) => {
    const classes = useStyles();
    const [value, setValue] = useState(filterValue);

    const handleChange = () => {
        setFilterValue(value.trim());
    };

    const handleKeyDown = e => {
        if (e.keyCode === 13) {
            if (useApplyButton) {
                handleChange(e.target.value);
            }
        }
    };

    useEffect(() => {
        if (!useApplyButton) {
            handleChange(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        setValue(filterValue);
    }, [filterValue]);

    return (
        <div className={classes.search}>
            <TextField
                id="filter"
                placeholder={placeholder}
                classes={{
                    root: classes.inputRoot
                }}
                value={value}
                onChange={event => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                variant="outlined"
                type="search"
                InputProps={{
                    classes: {
                        input: classes.inputInput,
                        adornedEnd: useApplyButton ? classes.adornedEnd : classes.adornedEndNoPadding
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            {useApplyButton && (
                                <IconButton
                                    onClick={handleChange}
                                    className={classes.adornedEndIcon}
                                    title="Apply filter"
                                    color="primary"
                                    size="medium"
                                >
                                    <SearchIcon size="small" />
                                </IconButton>
                            )}
                        </InputAdornment>
                    )
                }}
            />
        </div>
    );
};

export default ColumnFilterInput;
