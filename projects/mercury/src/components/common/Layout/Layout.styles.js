
const styles = theme => ({
    main: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: '84px 10px 0 80px',
        minWidth: 0, // So the Typography noWrap works
        overflowY: 'scroll',
        height: 'calc(100vh - 120px)'
    },
    toolbar: theme.mixins.toolbar,
});

export default styles;
