const styles = theme => ({
    main: {
        backgroundColor: theme.palette.background.default,
        padding: '14px 0 14px 80px',
        minWidth: 0, // So the Typography noWrap works
        overflowY: 'scroll',
        overflowX: 'hidden',
        height: 'calc(100vh - 28px)'
    }
});

export default styles;
