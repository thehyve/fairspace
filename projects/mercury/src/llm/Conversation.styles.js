import * as consts from '../constants';

const styles = theme => ({
    customFont: {
        fontFamily: 'sans-serif'
    },
    mainPage: {
        width: consts.MAIN_CONTENT_WIDTH,
        maxWidth: '700px',
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        padding: 20,
        marginTop: 20
    },
    header: {
        borderBottom: '2px solid ' + theme.palette.primary.main,
        marginBottom: 50
    },
    gridRow: {
        minHeight: '200px'
    },
    gridCell: {
        padding: 20,
        marginBottom: 20
    },
    historyList: {
        width: '100%',
        maxWidth: 360,
        maxHeight: '1200px',
        display: 'block',
        position: 'relative',
        overflow: 'scroll'
    },
    historyListItem: {
        backgroundColor: '#F1F1F1',
        marginBottom: 6,
        paddingBottom: 6
    },
    newConversation: {
        display: 'flex',
        alignItems: 'center'
    },
    searchContainer: {
        padding: 20,
        width: '100%'
    },
    searchSection: {
        padding: 10,
        marginBottom: 20,
        borderRadius: 15,
        maxWidth: 500
    },
    articleContainer: {
        overflow: 'auto'
    },
    chatArticle: {
        backgroundColor: '#F1F1F1',
        margin: 0,
        marginBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        // mouse pointer on hover click
        cursor: 'pointer'
    },
    chatResponse: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },
    chatInput: {
        backgroundColor: 'white',
        marginBottom: 10
    },
    chatReply: {
        marginLeft: 30,
        marginBottom: 10
    },
    searchIcon: {
        marginTop: 8,
        float: 'right'
    },
    searchInput: {
        width: 'calc(100% - 50px)'
    },
    responseMessage: {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalDialog: {
        background: theme.palette.grey['200'],
        position: 'relative',
        top: 0,
        width: 800,
        bgcolor: 'background.paper',
        border: '0px solid #000',
        boxShadow: 0,
        outline: 'none',
        p: 4
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
        overflowY: 'auto'
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
