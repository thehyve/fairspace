const styles = theme => ({
    paper: {
        width: '180px',
        height: '100px',
        border: 'none',
        background: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.light
        },
        textAlign: 'center'
    },
    outerMargin: {
        margin: 10
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
