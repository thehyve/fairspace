const styles = theme => ({
    footer: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        position: 'fixed',
        left: 0,
        bottom: 0,
        padding: 5,
        width: '100%',
        textAlign: 'center',
        zIndex: theme.zIndex.drawer + 1
    }
});

export default styles;
