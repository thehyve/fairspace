const styles = theme => ({
    main: {
        backgroundColor: theme.palette.background.default,
        padding: '14px 10px 0 80px',
        minWidth: 0, // So the Typography noWrap works
        overflowY: 'scroll',
        overflowX: 'hidden',
        height: '100vh'
    }
});

export default styles;
