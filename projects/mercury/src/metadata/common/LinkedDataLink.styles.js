const styles = (theme) => ({
    modalDialog: {
        background: theme.palette.grey['200'],
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        border: '0px solid #000',
        boxShadow: 0,
        outline: "none",
        p: 4,
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
