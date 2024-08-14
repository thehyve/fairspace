import React, {useEffect} from 'react';
import {Card, CardContent, CardHeader, Grid, IconButton, List, ListItemButton, Typography} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import withStyles from '@mui/styles/withStyles';
import styles from './AskAIHistory.styles';
import {useAskAIData} from './UseAskAIData';

const AskAIHistory = props => {
    const {classes} = props;
    const {conversationHistory, conversationId, prepareRestoreChat, deleteChat, getAllConversationHistory} =
        useAskAIData();

    useEffect(() => {
        getAllConversationHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationHistory]);

    return (
        <Card className={classes.historyContainer}>
            <CardHeader titleTypographyProps={{variant: 'h6'}} title="Chat history" avatar={<HistoryIcon />} />
            <CardContent className={classes.historyContentContainer}>
                <List
                    sx={{
                        '& ul': {padding: 0}
                    }}
                    className={classes.historyList}
                    subheader={<li />}
                >
                    {conversationHistory && conversationHistory.length > 0 ? (
                        conversationHistory.map(item => (
                            <ListItemButton
                                className={classes.historyListItem}
                                selected={item.id === conversationId}
                                onClick={() => prepareRestoreChat(item.id)}
                            >
                                <Grid container alignItems="stretch">
                                    <Grid item xs={10}>
                                        <Typography variant="overline">{item.start}</Typography>
                                    </Grid>
                                    <Grid item xs={2} align="right">
                                        <IconButton
                                            className={classes.deleteHistoryButton}
                                            color="primary"
                                            onClick={() => deleteChat(item.id)}
                                            size="small"
                                        >
                                            <DeleteForeverIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>{item.topic}</Typography>
                                    </Grid>
                                </Grid>
                            </ListItemButton>
                        ))
                    ) : (
                        <Typography variant="body1" align="center" className={classes.noChatHistoryMessage}>
                            No chat history available
                        </Typography>
                    )}
                </List>
            </CardContent>
        </Card>
    );
};

export default withStyles(styles)(AskAIHistory);
