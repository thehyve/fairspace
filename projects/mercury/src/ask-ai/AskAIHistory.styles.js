const styles = theme => ({
    historyContainer: {
        height: '100%'
    },
    historyContentContainer: {
        height: '100%'
    },
    historyList: {
        display: 'block',
        position: 'relative',
        overflow: 'auto'
    },
    historyListItem: {
        border: '1.5px solid ' + theme.palette.primary.main,
        borderRadius: theme.shape.borderRadius,
        marginBottom: 6,
        paddingBottom: 6,
        marginRight: 8
    },
    historyDateAndButtonDiv: {
        width: '100%',
        display: 'inline'
    },
    blockDisplay: {
        display: 'block'
    },
    noChatHistoryMessage: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120
    }
});

export default styles;
