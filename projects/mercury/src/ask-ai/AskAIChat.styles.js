import {alpha} from '@mui/material/styles';

const styles = theme => ({
    searchGrid: {
        height: '100%',
        width: '100%'
    },
    searchInputGrid: {
        height: 100
    },
    clearChatButtonSection: {
        display: 'flex',
        alignItems: 'center'
    },
    clearChatButton: {
        margin: '20px 0 20px 20px'
    },
    searchSection: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: 20
    },
    searchIcon: {
        padding: 0
    },
    searchInput: {
        borderRadius: theme.shape.borderRadius,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
        color: theme.palette.primary.contrastText,
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.25),
            borderColor: theme.palette.primary.main
        },
        width: '100%',
        marginTop: 20,
        marginRight: 10
    },
    chatResponseSection: {
        padding: '20px 60px 20px 60px',
        width: '100%'
    },
    chatSectionBeforeResponse: {
        paddingTop: 30,
        paddingBottom: 40
    },
    documentContainer: {
        overflow: 'auto'
    },
    chatDocument: {
        // backgroundColor: theme.palette.mellow.light,
        border: '1px solid ' + theme.palette.primary.light,
        borderRadius: theme.shape.borderRadius,
        margin: 0,
        marginBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        cursor: 'pointer'
    },
    chatResponse: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },
    chatInput: {
        borderBottom: '2px solid ' + theme.palette.primary.main,
        marginBottom: 10
    },
    chatReply: {
        marginLeft: 30,
        marginBottom: 10
    },
    responseMessage: {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        marginBottom: 10
    },
    responseDocumentsContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
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
    adornedEnd: {
        paddingRight: theme.spacing(1)
    }
    // clickableDiv: {
    //     cursor: 'pointer',
    //     '&:hover': {
    //         textDecoration: 'underline'
    //     }
    // }
});

export default styles;
