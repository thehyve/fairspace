const styles = (theme) => ({
    modalDialog: {
        background: theme.palette.grey['200'],
        position: 'relative',
        top: 0,
        width: 800,
        bgcolor: 'background.paper',
        border: '0px solid #000',
        boxShadow: 0,
        outline: "none",
        p: 4,
    },
    modalContent: {
        position: 'relative',
        top: '10%',
        left: '50%',
        transform: 'translate(-50%, 0px)',
        maxHeight: '80%',
        padding: 2,
        backgroundColor: theme.palette.primary.main,
        width: 800,
        overflowY: 'auto',
    },
    closeButton: {
        float: 'right',
        marginTop: 8,
        marginRight: 8

    },
    clickableDiv: {
        'cursor': 'pointer',
        '&:hover': {
            textDecoration: 'underline'
        }
    }
});

export default styles;
