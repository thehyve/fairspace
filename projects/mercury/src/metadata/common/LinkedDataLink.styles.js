const styles = (theme) => ({
    styleModalDialog: {
        background: theme.palette.grey['200'],
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        border: '0px solid #000',
        boxShadow: 0,
        p: 4,
    },
    styleCloseButton: {
        float: 'right',
        marginTop: 8,
        marginRight: 8

    }
});

export default styles;
