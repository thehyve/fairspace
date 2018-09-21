const infoDrawerWidth = 360;

const styles = theme => ({
    root: {
        marginTop: 50
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
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
