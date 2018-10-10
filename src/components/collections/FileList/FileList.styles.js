const styles = theme => ({
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.primary[100],
            cursor: 'pointer'
        }
    },
    tableRowSelected: {
        '&&': {
            backgroundColor: theme.palette.primary[300]
        }
    }
});

export default styles;