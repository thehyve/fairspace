const styles = theme => ({
    paper: {
        width: '200px',
        height: '100px',
        borderStyle: 'solid',
        borderColor: theme.palette.primary.light,
        background: theme.palette.primary.dark,
        borderWidth: 2,
        textAlign: 'center'
    },
    outerMargin: {
        margin: 10
    },
    icon: {
        marginLeft: 10,
        marginTop: 10
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
        color: theme.palette.primary.contrastText
    },
    link: {
        textDecoration: 'none'
    }
});

export default styles;
