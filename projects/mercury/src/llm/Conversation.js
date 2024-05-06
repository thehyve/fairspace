import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Fade,
    Grid,
    IconButton,
    List,
    ListItemButton,
    Modal,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import withStyles from '@mui/styles/withStyles';
import FulltextAPI from './FulltextAPI';
import styles from './Conversation.styles';
import {handleHttpError} from '../common/utils/httpUtils';
import LinkedDataEntityPage from '../metadata/common/LinkedDataEntityPage';
import {LocalSearchAPI} from '../search/SearchAPI';

const Conversation = props => {
    const {classes} = props;

    const [query, setQuery] = useState('');
    const [finalQuery, setFinalQuery] = useState('');

    const [messages, setMessages] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseArticles, setResponseArticles] = useState([]);

    const [conversationId, setConversationId] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [restoreChatStatus, setRestoreChatStatus] = useState(false);

    const [openModal, setOpenModal] = React.useState(false);

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const [articleIri, setArticleIri] = useState('');

    const [loading, setLoading] = useState(false);

    const processResponseArticles = data => {
        const articles = [];

        if (data.searchResults) {
            data.searchResults.forEach(result =>
                result.document.derivedStructData.extractive_answers.forEach(element => {
                    articles.push({title: result.document.derivedStructData.title, content: element.content});
                })
            );
        }

        setResponseArticles(articles);
    };

    const processResponseMessages = data => {
        const newMessages = data.conversation ? data.conversation.messages : data.messages;
        const id = data.conversation ? data.conversation.conversationId : data.conversationId;

        // todo: extract all study id's, and replace study id in text with link to study, in a new tab
        if (!newMessages || newMessages.length === 0) {
            setResponseMessage('No chat messages found.');
            setResponseArticles([]);
        } else if (
            data.reply &&
            data.reply.summary &&
            (data.reply.summary.summaryText.includes('not enough information') ||
                data.reply.summary.summaryText.includes("I don't know what you mean") ||
                data.reply.summary.summaryText.includes("not sure what you're asking about"))
        ) {
            setResponseMessage('');
            setConversationId(id);
            setMessages(newMessages);
        } else {
            setResponseMessage('');
            setConversationId(id);
            setMessages(newMessages);
            processResponseArticles(data);
        }
    };

    const processHistoryResponseMessages = data => {
        const id = data.conversation ? data.conversation.conversationId : data.conversationId;
        const oldMessages = data.conversation ? data.conversation.messages : data.messages;
        const oldResponseMessage = data.reply ? data.reply.summary.summaryText : '';

        setResponseMessage(oldResponseMessage);
        setConversationId(id);
        setMessages(oldMessages);
        new FulltextAPI().getConversation(id).then(conversation => processResponseArticles(conversation));
    };

    const restoreChat = id => {
        new FulltextAPI()
            .getHistory(id)
            .then(processHistoryResponseMessages)
            .then(() => setLoading(false))
            .catch(() => handleHttpError('Error retrieving chat history.'));
    };

    const prepareRestoreChat = id => {
        setLoading(true);
        setQuery('');
        setResponseArticles([]);
        setMessages([]);
        setConversationId(id);
        setRestoreChatStatus(true);
    };

    const processConversationHistory = data => {
        if (data && data.length > 0) {
            data.sort((a, b) => new Date(b.start) - new Date(a.start));

            if (JSON.stringify(data) !== JSON.stringify(conversationHistory)) {
                setConversationHistory(data);
            }
        }
    };

    const getAllConversationHistory = () => {
        new FulltextAPI()
            .getAllConversations()
            .then(processConversationHistory)
            .catch(() => {
                handleHttpError('Error retrieving chat history.');
                setLoading(false);
            });
    };

    const startNewConversation = () => {
        setResponseMessage('');
        setMessages([]);
        setResponseArticles([]);
        setConversationId('');
        getAllConversationHistory();
    };

    const processSearchQueryChange = newQuery => {
        if (newQuery !== query) {
            if (responseMessage !== '') {
                setResponseMessage('');
                setResponseArticles([]);
            }

            setQuery(newQuery);
        }
    };

    const handleSearchError = error => {
        setResponseMessage(error);
        setLoading(false);
    };

    const performSearch = () => {
        if (conversationId === '') {
            const searchResult = new FulltextAPI().search(query);
            return searchResult;
        }

        return new FulltextAPI().chat(query, conversationId);
    };

    const prepareFetchSearch = () => {
        setLoading(true);
        setFinalQuery(query);
    };

    const extractArticleIri = webResult => {
        if (webResult && webResult.length > 0) {
            setArticleIri(webResult[0].id);
        } else {
            setArticleIri('');
        }
    };

    const showArticle = articleId => {
        if (articleId !== null && articleId.length > 0) {
            LocalSearchAPI.lookupSearch(articleId, 'https://www.fns-cloud.eu/study').then(extractArticleIri);
        }
    };

    useEffect(() => {
        if (articleIri !== '') {
            handleOpenModal();
        } else {
            handleCloseModal();
        }
    }, [articleIri]);

    const renderModal = () => (
        <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className={classes.modalContent}>
                <Box className={classes.modalDialog}>
                    <Tooltip title="Close - click or press Esc">
                        <CloseIcon onClick={handleCloseModal} className={classes.closeButton} />
                    </Tooltip>
                    <LinkedDataEntityPage title="Metadata" subject={articleIri} />
                </Box>
            </div>
        </Modal>
    );

    const renderMessages = () => {
        return (
            <div>
                {messages &&
                    messages.map(message => {
                        if (message.userInput && message.userInput.input) {
                            return (
                                <div className={classes.chatInput}>
                                    <Typography variant="body3" color="primary.dark">
                                        {'> ' + message.userInput.input}
                                    </Typography>
                                </div>
                            );
                        }
                        if (message.reply && message.reply.summary && message.reply.summary.summaryText) {
                            return (
                                <div className={classes.chatReply}>
                                    <Typography variant="body1">{message.reply.summary.summaryText}</Typography>
                                </div>
                            );
                        }
                        return null;
                    })}
            </div>
        );
    };

    const renderArticleReferences = () => {
        return (
            <div>
                {responseArticles && responseArticles.length > 0 && (
                    <Typography variant="caption">Source studies:</Typography>
                )}
                <div className={classes.articleContainer}>
                    {responseArticles &&
                        responseArticles.map(
                            article =>
                                article &&
                                article.content &&
                                article.content.length > 0 && (
                                    <div>
                                        <div className={classes.chatArticle} onClick={() => showArticle(article.title)}>
                                            <Typography variant="button">Id: {article.title}</Typography>
                                            <Typography variant="body1">{article.content}</Typography>
                                        </div>
                                    </div>
                                )
                        )}
                </div>
            </div>
        );
    };

    const renderHistoryList = () => {
        return (
            <List
                sx={{
                    '& ul': {padding: 0}
                }}
                className={classes.historyList}
                subheader={<li />}
            >
                {conversationHistory && conversationHistory.length > 0
                    ? conversationHistory.map(item => (
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
                          </ListItemButton>
                      ))
                    : null}
            </List>
        );
    };

    useEffect(() => {
        setResponseMessage('');
        if (finalQuery === '') {
            return;
        }

        performSearch()
            .then(processResponseMessages)
            .then(() => setLoading(false))
            .catch(() => {
                handleHttpError('Connection error.');
                handleSearchError('Fairspace article search is not available at the moment');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finalQuery]);

    useEffect(() => {
        getAllConversationHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationHistory]);

    useEffect(() => {
        if (restoreChatStatus) {
            restoreChat(conversationId);
        }
        setRestoreChatStatus(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    return (
        <Paper className={classes.searchContainer}>
            <Grid container justifyContent="center" spacing="5">
                <Grid item md={12}>
                    <Grid container justifyContent="center" spacing="5">
                        <Grid item md={3} className={classes.newConversation}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={startNewConversation}
                                startIcon={<AddIcon />}
                            >
                                New Question
                            </Button>
                        </Grid>
                        <Grid item md={9}>
                            <Paper className={classes.searchSection} elevation={1}>
                                <TextField
                                    id="outlined-search"
                                    label="What do you want to know more about?"
                                    type="search"
                                    className={classes.searchInput}
                                    onChange={event => {
                                        processSearchQueryChange(event.target.value);
                                    }}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter') {
                                            processSearchQueryChange(event.target.value);
                                            prepareFetchSearch();
                                        }
                                    }}
                                    value={query}
                                />
                                <IconButton
                                    className={classes.searchIcon}
                                    color="primary"
                                    onClick={() => prepareFetchSearch()}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item md={3} className={classes.historyListContainer}>
                    {renderHistoryList()}
                </Grid>
                <Grid item md={9}>
                    <Fade in={loading}>
                        <CircularProgress />
                    </Fade>
                    <Grid item md={12} className={classes.responseMessage}>
                        <Typography variant="body1">{responseMessage}</Typography>
                    </Grid>
                    <Grid item md={12}>
                        {renderMessages()}
                    </Grid>
                    <Grid item md={12}>
                        {responseArticles && responseArticles.length > 0 && renderArticleReferences()}
                    </Grid>
                </Grid>
            </Grid>
            <div>{renderModal()}</div>
        </Paper>
    );
};

export default withStyles(styles)(Conversation);
