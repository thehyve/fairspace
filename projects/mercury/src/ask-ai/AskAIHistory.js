import React from 'react';
import {Card, CardContent, CardHeader, IconButton, List, ListItemButton, Typography} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import withStyles from '@mui/styles/withStyles';
import styles from './AskAIHistory.styles';
import {useAskAIData} from './UseAskAIData';

const AskAIHistory = props => {
    const {classes} = props;
    const {conversationHistory, conversationId, prepareRestoreChat, deleteChat} = useAskAIData();

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
                                <div>
                                    <Typography className={classes.listDate} variant="overline">
                                        {item.start}
                                    </Typography>
                                    <div>{item.topic}</div>
                                </div>
                                <IconButton
                                    className={classes.deleteHistoryButton}
                                    color="primary"
                                    onClick={() => deleteChat(item.id)}
                                >
                                    <DeleteForeverIcon />
                                </IconButton>
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
