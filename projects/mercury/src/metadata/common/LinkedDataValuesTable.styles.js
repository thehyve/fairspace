const styles = theme => ({
    values: {
        "cursor": 'default',
        "marginTop": 3,
        "fontSize": '0.875rem',
        "lineHeight": 1.43,
        "letterSpacing": '0.01071em',
        '& input': {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.01071em'
        },
        '& textarea': {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.01071em'
        }
    },
    addValue: {
        marginTop: 10,
        padding: 3,
        borderColor: theme.palette.grey['400'],
        borderStyle: 'solid',
        borderWidth: 1.5,
        borderRadius: 6,
        backgroundColor: theme.palette.grey['50'],
    },
    addValueInput: {
        backgroundColor: theme.palette.background.paper
    }
});

export default styles;
