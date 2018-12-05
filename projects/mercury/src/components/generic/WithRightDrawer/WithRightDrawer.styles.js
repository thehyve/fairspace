const drawerWidth = 360
const styles = theme => ({
    drawerContents: {
        marginTop: 50
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        paddingRight: theme.spacing.unit * 3,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginRight: 0
    },

    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth + 3 * theme.spacing.unit
    },

    infoDrawerPaper: {
        width: drawerWidth,
        padding: theme.spacing.unit * 3
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing.unit,
        top: theme.mixins.toolbar.minHeight + 3 * theme.spacing.unit
    },
    toolbar: theme.mixins.toolbar
});

export default styles;
