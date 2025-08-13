const styles = theme => ({
    outerDiv: {
        padding: 10
    },
    paper: {
        marginRight: 1,
        height: 100,
        minWidth: 90,
        border: 'none',
        background: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.light
        },
        textAlign: 'center'
    },
    icon: {
        marginLeft: 10,
        marginTop: 10,
        color: theme.palette.primary.contrastText
    },
    imageIconRoot: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 'xx-large'
    },
    imageIcon: {
        display: 'flex',
        height: 'inherit',
        width: 'inherit'
    },
    domainText: {
        color: theme.palette.primary.contrastText,
        paddingTop: 10
    },
    link: {
        textDecoration: 'none',
        alignItems: 'center'
    }
});

export default styles;
