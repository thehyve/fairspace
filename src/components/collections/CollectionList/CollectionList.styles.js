const styles = theme => ({
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
            cursor: 'pointer'
        }
    },
    tableRowSelected: {
        '&&': {
            backgroundColor: theme.palette.primary.light
        }
    }

});

export default styles;
