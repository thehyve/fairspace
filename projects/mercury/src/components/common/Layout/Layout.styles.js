
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
        // padding: theme.spacing.unit * 3,
        padding: '84px 24px 0 24px',
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
});

export default styles;
