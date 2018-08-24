const infoDrawerWidth = 480;

const styles = theme => ({
    infoDrawerPaper: {
        width: infoDrawerWidth,
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
