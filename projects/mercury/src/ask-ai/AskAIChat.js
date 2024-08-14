import React, {useEffect, useState} from 'react';
import {Box, Button, Grid, IconButton, Modal, Paper, TextField, Tooltip, Typography} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import withStyles from '@mui/styles/withStyles';
import InputAdornment from '@mui/material/InputAdornment';
import styles from './AskAIChat.styles';
import LinkedDataEntityPage from '../metadata/common/LinkedDataEntityPage';
import {LocalSearchAPI} from '../search/SearchAPI';
import {useAskAIData} from './UseAskAIData';
import LoadingOverlayWrapper from '../common/components/LoadingOverlayWrapper';

const AskAIChat = props => {
    const {initialQuery = '', classes} = props;
    const [documentIri, setDocumentIri] = useState('');
    const [openMetadataDialog, setOpenMetadataDialog] = useState(false);

    const {
        query,
        responseDocuments,
        messages,
        loading,
        responseInfo,
        clearChat,
        processSearchQueryChange,
        prepareFetchSearch
    } = useAskAIData(initialQuery);

    const handleOpenMetadataDialog = () => setOpenMetadataDialog(true);
    const handleCloseMetadataDialog = () => setOpenMetadataDialog(false);

    const extractDocumentIri = webResult => {
        if (webResult && webResult.length > 0) {
            setDocumentIri(webResult[0].id);
        } else {
            setDocumentIri('');
        }
    };

    const showDocument = documentId => {
        if (documentId !== null && documentId.length > 0) {
            LocalSearchAPI.lookupSearch(documentId, 'https://www.fns-cloud.eu/study').then(extractDocumentIri);
        }
    };

    useEffect(() => {
        if (documentIri !== '') {
            handleOpenMetadataDialog();
        } else {
            handleCloseMetadataDialog();
        }
    }, [documentIri]);

    const renderMetadataDialog = () => (
        <Modal
            open={openMetadataDialog}
            onClose={handleCloseMetadataDialog}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className={classes.modalContent}>
                <Box className={classes.modalDialog}>
                    <Tooltip title="Close - click or press Esc">
                        <CloseIcon onClick={handleCloseMetadataDialog} className={classes.closeButton} />
                    </Tooltip>
                    <LinkedDataEntityPage title="Metadata" subject={documentIri} />
                </Box>
            </div>
        </Modal>
    );

    const renderMessages = () => {
        return (
            <div>
                {messages &&
                    messages.map(message => {
                        if (message.userInput?.input) {
                            return (
                                <div className={classes.chatInput}>
                                    <Typography variant="body3" color="primary.dark">
                                        {'> ' + message.userInput.input}
                                    </Typography>
                                </div>
                            );
                        }
                        if (message.reply?.summary?.summaryText) {
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

    const renderDocumentReferences = () => {
        return (
            <div>
                {responseDocuments && responseDocuments.length > 0 && (
                    <Typography variant="h6" color="primary">
                        Source metadata:
                    </Typography>
                )}
                <div className={classes.documentContainer}>
                    {responseDocuments &&
                        responseDocuments.map(
                            document =>
                                document?.content &&
                                document.content.length > 0 && (
                                    <div className={classes.chatDocument} onClick={() => showDocument(document.title)}>
                                        <Typography variant="button">Id: {document.title}</Typography>
                                        <Typography variant="body1">{document.content}</Typography>
                                    </div>
                                )
                        )}
                </div>
            </div>
        );
    };

    const renderSearchBar = () => {
        return (
            <TextField
                id="outlined-search"
                label="Type your question here"
                type="search"
                variant="outlined"
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
                InputProps={{
                    classes: {
                        input: classes.inputInput,
                        adornedEnd: classes.adornedEnd
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                className={classes.searchIcon}
                                color="primary"
                                onClick={() => prepareFetchSearch()}
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
        );
    };

    return (
        <Paper className={classes.searchContainer}>
            <Grid
                container
                className={classes.searchGrid}
                direction="column"
                justifyContent="flex-start"
                alignItems="stretch"
            >
                <Grid item container spacing="10" className={classes.searchInputGrid}>
                    <Grid item xs={2} className={classes.clearChatButtonSection}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={clearChat}
                            startIcon={<ClearIcon />}
                            className={classes.clearChatButton}
                        >
                            Clear chat
                        </Button>
                    </Grid>
                    <Grid item xs={10} className={classes.searchSection}>
                        {renderSearchBar()}
                    </Grid>
                </Grid>
                <LoadingOverlayWrapper loading={loading}>
                    <Grid
                        item
                        container
                        className={classes.chatResponseSection}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="stretch"
                    >
                        {!responseInfo && !(messages && messages.length > 0) ? (
                            <Grid item container alignItems="stretch" justifyContent="center" direction="column">
                                <Grid item>
                                    <Typography variant="h3" align="center">
                                        Ask AI
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="subtitle1" align="center">
                                        What would you like to know more about?
                                    </Typography>
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid item container alignItems="stretch" justifyContent="center" direction="column">
                                <Grid item className={classes.responseMessage}>
                                    <Typography variant="body1">{responseInfo}</Typography>
                                </Grid>
                                <Grid item>{renderMessages()}</Grid>
                                <Grid item>
                                    {responseDocuments && responseDocuments.length > 0 && renderDocumentReferences()}
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </LoadingOverlayWrapper>
            </Grid>
            <div>{renderMetadataDialog()}</div>
        </Paper>
    );
};

export default withStyles(styles)(AskAIChat);
