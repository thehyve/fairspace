const styles = (theme) => ({
    paper: {
        width: '200px',
        height: '100px',
        borderStyle: 'solid',
        borderColor: theme.palette.primary.light,
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
    domainText: {
        color: theme.palette.grey[700],
    }
});

export default styles;
