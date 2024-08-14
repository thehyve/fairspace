const styles = theme => ({
    historyContainer: {
        height: '100%'
    },
    historyContentContainer: {
        height: '100%'
    },
    historyListContainer: {
        borderTop: '1.5px solid ' + theme.palette.primary.light
        // backgroundColor: theme.palette.mellow.light
    },
    historyList: {
        display: 'block',
        position: 'relative',
        overflow: 'auto'
    },
    historyListItem: {
        borderStyle: 'solid',
        borderWidth: 1,
        marginBottom: 6,
        paddingBottom: 6,
        marginRight: 8
    },
    deleteHistoryButton: {
        position: 'absolute',
        marginLeft: '75%'
    },
    noChatHistoryMessage: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120
    }
});

export default styles;
