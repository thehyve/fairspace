const styles = theme => ({
    footer: {
        backgroundColor: theme.palette.primary.main,
        position: 'fixed',
        left: 0,
        bottom: 0,
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
