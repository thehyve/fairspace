import {OutlinedInput} from "@material-ui/core";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {fade} from "@material-ui/core/styles/colorManipulator";

const useStyles = makeStyles((theme) => ({
    search: {
        'position': 'relative',
        'flex': 0.8,
        'borderRadius': theme.shape.borderRadius,
        'backgroundColor': fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        'marginLeft': 0,
        'width': '100%',
        [theme.breakpoints.up('sm')]: {
            width: 'auto',
        },
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
    }
}));

const ColumnFilterInput = ({setFilterValue, filterValue, placeholder}) => {
    const classes = useStyles();

    const handleChange = (event) => {
        setFilterValue(event.target.value);
    };

    return (
        <div className={classes.search}>
            <OutlinedInput
                id="filter"
                placeholder={placeholder}
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                value={filterValue}
                onChange={handleChange}
                type="search"
            />
        </div>
    );
};

export default ColumnFilterInput;
