
const styles = theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    flex: {
        flex: 1
    },
    main: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: '84px 10px 0 80px',
        minWidth: 0, // So the Typography noWrap works
        overflow: 'scroll',
        height: '100vh'
    },
    toolbar: theme.mixins.toolbar,
});

export default styles;
