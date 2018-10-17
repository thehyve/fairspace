const styles = theme => ({
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    flex: {
        flex: 1,
        display: 'flex'
    },
    toolbar: theme.mixins.toolbar,
});

export default styles;
