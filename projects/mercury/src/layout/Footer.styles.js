const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(1),
        width: '100%',
        textAlign: 'center',
        position: 'fixed',
        left: 0,
        bottom: 0,
        zIndex: theme.zIndex.drawer + 1
    },
    text: {
        color: theme.palette.common.white
    }
});

export default styles;
