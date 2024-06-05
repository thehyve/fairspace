const styles = theme => ({
    root: {
        width: 250,
        boxShadow:
            '0px 1px 1px -1px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.12)'
    },
    title: {
        padding: 8,
        fontWidth: 'bold',
        '& .MuiCardHeader-action': {
            alignSelf: 'auto',
            margin: 0
        },
        '& .MuiIconButton-root': {
            color: theme.palette.primary.contrastText
        }
    },
    content: {
        '&:last-child': {
            paddingTop: 0,
            paddingBottom: 8
        },
        padding: 8
    },
    input: {
        fontSize: 'small'
    },
    textContent: {
        width: '100%',
        maxHeight: 220,
        overflowY: 'auto'
    },
    numericalContent: {
        padding: 8
    },
    booleanContent: {
        textAlign: 'center'
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest
        })
    },
    expandOpen: {
        transform: 'rotate(180deg)'
    },
    headerIcon: {
        padding: 0
    },
    multiselectList: {
        '& .MuiFormControlLabel-root': {
            marginRight: 0,
            marginLeft: 0
        }
    },
    accessFilter: {
        alignContent: 'center',
        marginBottom: 10
    },
    checkbox: {
        padding: 5
    }
});

export default styles;
