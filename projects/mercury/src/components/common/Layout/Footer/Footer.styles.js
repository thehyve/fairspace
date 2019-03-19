const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing.unit,
        width: '100%',
        textAlign: 'center',
        zIndex: theme.zIndex.drawer + 1
    },
    text: {
        color: theme.palette.common.white,
    }

});

export default styles;
