const styles = theme => ({
    main: {
        backgroundColor: theme.palette.background.default,
        paddingTop: 14,
        paddingBottom: 14,
        paddingRight: 8,
        minWidth: 0, // So the Typography noWrap works
        overflowY: 'scroll',
        overflowX: 'hidden',
        height: 'calc(100vh - 28px)'
    }
});

export default styles;
