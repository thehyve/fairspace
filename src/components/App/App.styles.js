const menuDrawerWidth = 240;


const styles = theme => ({
    root: {
        flexGrow: 1,
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    menuDrawerPaper: {
        position: 'relative',
        width: menuDrawerWidth,
        height: '100vh',
        zIndex: theme.zIndex.drawer
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    flex: {
        flex: 1
    },
    toolbar: theme.mixins.toolbar,
});

export default styles;