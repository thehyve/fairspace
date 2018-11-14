const styles = theme => ({
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.primary[50],
            cursor: 'pointer'
        }
    },
    tableRowSelected: {
        '&&': {
            backgroundColor: theme.palette.primary[100]
        }
    }
});

export default styles;
