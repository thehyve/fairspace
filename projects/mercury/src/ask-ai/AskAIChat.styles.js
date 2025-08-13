const styles = theme => ({
    searchGrid: {
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2]
    },
    searchInputGrid: {
        height: 80
    },
    clearChatButtonSection: {
        display: 'flex',
        alignItems: 'center'
    },
    clearChatButton: {
        margin: '20px 0 20px 10px',
        minWidth: 30,
        paddingLeft: 5
    },
    searchSection: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '10px 10px'
    },
    searchIcon: {
        padding: 0,
        color: theme.palette.primary.main
    },
    searchInput: {
        borderRadius: 20,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.primary.main
        },
        width: '100%',
        marginTop: 10,
        marginRight: 0,
        boxShadow: theme.shadows[1]
    },
    chatResponseSection: {
        padding: '30px 40px',
        width: '100%',
        fontSize: '16px',
        lineHeight: '1.5',
        color: theme.palette.text.primary
    },
    chatSectionBeforeResponse: {
        paddingTop: 30,
        paddingBottom: 40
    },
    documentContainer: {
        overflow: 'auto',
        maxHeight: '300px'
    },
    chatDocument: {
        backgroundColor: '#f5f8fa',
        border: '1px solid ' + theme.palette.primary.light,
        borderRadius: 12,
        margin: 0,
        marginBottom: 15,
        padding: '10px 15px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: '#e1e8ed',
            transform: 'translateY(-2px)'
        }
    },
    chatResponse: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        padding: '15px',
        borderRadius: 12,
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
    },
    chatInput: {
        borderBottom: '2px solid ' + theme.palette.primary.main,
        marginBottom: 15,
        padding: '10px 0'
    },
    chatReply: {
        marginLeft: 30,
        marginBottom: 15,
        backgroundColor: theme.palette.primary.light,
        padding: '15px',
        borderRadius: '12px 12px 12px 0',
        color: 'white'
    },
    responseMessage: {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        marginBottom: 15,
        fontSize: '18px'
    },
    responseDocumentsContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px 0'
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
    },
    queryBox: {
        margin: '15px 20px',
        padding: 5,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        backgroundColor: theme.palette.mellow.light
    },
    queryBoxHeader: {
        marginBottom: 0
    },
    queryBoxTitle: {
        margin: 0,
        color: '#14171a',
        fontStyle: 'italic'
    },
    queryBoxButton: {
        borderRadius: '20px',
        padding: '6px 16px'
    },
    queryBoxContent: {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e1e8ed',
        fontSize: '14px',
        lineHeight: '1.5'
    },
    queryBoxLoading: {
        padding: '10px',
        textAlign: 'center',
        color: '#657786'
    },
    queryBoxResults: {
        marginTop: '20px'
    },
    queryBoxResultsContent: {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        backgroundColor: theme.palette.background.paper,
        padding: '15px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
        fontSize: '14px',
        lineHeight: '1.5',
        maxHeight: '300px',
        overflow: 'auto'
    },
    welcomeMessage: {
        padding: '20px',
        textAlign: 'center',
        color: theme.palette.text.secondary,
        fontSize: '16px',
        lineHeight: '1.5'
    },
    unsupportedQueryMessage: {
        padding: '20px',
        textAlign: 'center',
        color: theme.palette.text.disabled,
        fontSize: '16px',
        lineHeight: '1.5'
    }
});

export default styles;
