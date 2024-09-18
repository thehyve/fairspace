const styles = theme => ({
    modalWrapper: {
        position: 'relative',
        '& .MuiBreadcrumbs-root .MuiTypography-root': {
            color: theme.palette.primary.contrastText
        },
        top: '10%',
        left: '50%',
        transform: 'translate(-50%, 0px)',
        outline: 'none',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        width: 800
    },
    modalContent: {
        background: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        bgcolor: 'background.paper',
        border: '0px solid #000',
        borderRadius: theme.shape.borderRadius,
        boxShadow: 0,
        outline: 'none',
        overflowY: 'auto',
        height: '100%',
        width: '100%'
    },
    closeButton: {
        float: 'right',
        marginTop: 8,
        marginRight: 8
    },
    clickableDiv: {
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline'
        }
    }
});

export default styles;
