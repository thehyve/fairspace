/* eslint-disable */
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, Card, Grid, IconButton, Collapse, Modal, Paper, TextField, Tooltip, Divider} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import withStyles from '@mui/styles/withStyles';
import InputAdornment from '@mui/material/InputAdornment';
import styles from './AskAIChat.styles';
import LinkedDataEntityPage from '../metadata/common/LinkedDataEntityPage';
import LoadingOverlayWrapper from '../common/components/LoadingOverlayWrapper';
import {getMetadataViewsPath} from '../metadata/views/metadataViewUtils';

const AskAIChat = props => {
    const {query, loading, clearChat, setQuery, classes, inputQuery, setInputQuery, questionQueryAnswer} = props;
    const [documentIri, setDocumentIri] = useState('');
    const [openMetadataDialog, setOpenMetadataDialog] = useState(false);
    const [sparqlLoading, setSparqlLoading] = useState(false);
    const [sparqlResult, setSparqlResult] = useState(null);
    const [unsupportedQuery, setUnsupportedQuery] = useState(false);
    const [showSparqlQuery, setShowSparqlQuery] = useState(false);
    const [showMetadataQuery, setShowMetadataQuery] = useState(false);
    const [showCTQuery, setShowCTQuery] = useState(false);

    const handleOpenMetadataDialog = () => setOpenMetadataDialog(true);
    const handleCloseMetadataDialog = () => setOpenMetadataDialog(false);
    const toggleSparqlQuery = () => setShowSparqlQuery(!showSparqlQuery);
    const toggleMetadataQuery = () => setShowMetadataQuery(!showMetadataQuery);
    const toggleCTQuery = () => setShowCTQuery(!showCTQuery);

    const onMetadataDialogClose = () => setDocumentIri('');

    useEffect(() => {
        if (documentIri !== '') {
            handleOpenMetadataDialog();
        } else {
            handleCloseMetadataDialog();
        }
    }, [documentIri]);

    useEffect(() => {
        setShowSparqlQuery(false);
        setShowMetadataQuery(false);
        if (query === '') {
            setInputQuery('');
            setUnsupportedQuery(false);
        } else if (!questionQueryAnswer[query]) {
            setUnsupportedQuery(true);
        } else {
            setUnsupportedQuery(false);
        }
    }, [query, setInputQuery, questionQueryAnswer]);

    const executeSparqlQuery = sparqlQuery => {
        setSparqlLoading(true);
        setSparqlResult(null);

        axios
            .post('/api/rdf/query', sparqlQuery, {
                headers: {
                    'Content-Type': 'application/sparql-query',
                    Accept: 'application/json'
                }
            })
            .then(response => {
                setSparqlResult(response.data);
            })
            .catch(() => {
                setSparqlResult({error: 'Error executing SPARQL query'});
            })
            .finally(() => {
                setSparqlLoading(false);
            });
    };

    const handleClickOnChatAnswer = () => {
        if (
            questionQueryAnswer[query]?.answer &&
            questionQueryAnswer[query]?.answer.includes('84f8d787-3974-418c-b12a-55c6367c1e34')
        ) {
            setDocumentIri('https://fairspace.example/study/a4ab140d-4e0e-4fd5-bc4f-4355aa4ee701');
        }
    };

    const redirectToMetadataViews = jsonQuery => {
        try {
            const queryObj = JSON.parse(jsonQuery);
            let path = getMetadataViewsPath(queryObj.view);

            // Add filters as query parameters
            if (queryObj.filters && queryObj.filters.length > 0) {
                queryObj.filters.forEach((filter, index) => {
                    const filterKey = filter['field'];
                    let filterValue = '';
                    if (filter['values']) {
                        filterValue = encodeURIComponent(JSON.stringify(filter['values'][0]));
                    } else {
                        filterValue = encodeURIComponent(filter['min']);
                    }
                    path += `&${filterKey}=${filterValue}`;
                });
            }
            window.open(path, '_blank');
        } catch (error) {
            console.error('Error parsing JSON query:', error);
        }
    };

    const renderMetadataDialog = () => (
        <Modal
            open={openMetadataDialog}
            onClose={onMetadataDialogClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className={classes.modalWrapper}>
                <Card className={classes.modalContent}>
                    <Tooltip title="Close - click or press Esc">
                        <CloseIcon onClick={onMetadataDialogClose} className={classes.closeButton} />
                    </Tooltip>
                    <LinkedDataEntityPage title="Metadata" subject={documentIri} />
                </Card>
            </div>
        </Modal>
    );

    const renderSearchBar = () => {
        return (
            <TextField
                id="outlined-search"
                label="Type your question here"
                type="search"
                variant="outlined"
                className={classes.searchInput}
                onChange={event => {
                    setInputQuery(event.target.value);
                }}
                onKeyDown={event => {
                    if (event.key === 'Enter') {
                        setQuery(inputQuery);
                    }
                }}
                value={inputQuery}
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
                                onClick={() => setQuery(inputQuery)}
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
        );
    };

    const renderChatContent = () => {
        if (query === '') {
            return (
                <div className={classes.welcomeMessage}>
                    Welcome to the AI chat functionality that helps you search for data. You can type your own query or
                    select one of the example queries from the right panel.
                </div>
            );
        }

        if (unsupportedQuery) {
            return (
                <div className={classes.unsupportedQueryMessage}>
                    This functionality is not supported yet. Please select one of the example queries from the right
                    panel.
                </div>
            );
        }

        return (
            <div style={{whiteSpace: 'pre', width: 400}} onClick={() => handleClickOnChatAnswer()}>
                {questionQueryAnswer[query]?.answer || ''}
            </div>
        );
    };

    return (
        <Paper>
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
                <Divider />
                <LoadingOverlayWrapper loading={loading}>
                    <Grid
                        item
                        container
                        className={classes.chatResponseSection}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="stretch"
                    >
                        {renderChatContent()}
                    </Grid>
                </LoadingOverlayWrapper>
                {questionQueryAnswer[query]?.sparqlQuery && (
                    <Paper className={classes.queryBox}>
                        <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            className={classes.queryBoxHeader}
                            onClick={toggleSparqlQuery}
                            style={{cursor: 'pointer'}}
                        >
                            <Grid item>
                                <h5 className={classes.queryBoxTitle}>See executed SPARQL query</h5>
                            </Grid>
                            <Grid item>
                                <IconButton onClick={toggleSparqlQuery} size="small">
                                    {showSparqlQuery ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Collapse in={showSparqlQuery} timeout="auto" unmountOnExit>
                            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '16px'}}>
                                {questionQueryAnswer[query]?.sparqlQuery || ''}
                            </pre>
                            <Grid item container justifyContent="flex-end" spacing={1}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<EditIcon />}
                                        disabled={sparqlLoading}
                                    >
                                        Edit
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => executeSparqlQuery(questionQueryAnswer[query].sparqlQuery)}
                                        disabled={sparqlLoading}
                                    >
                                        Re-execute Fairspace query
                                    </Button>
                                </Grid>
                            </Grid>
                            {sparqlLoading && <div className={classes.queryBoxLoading}>Loading...</div>}
                            {sparqlResult && (
                                <div className={classes.queryBoxResults}>
                                    <h4 className={classes.queryBoxTitle}>Results:</h4>
                                    <pre className={classes.queryBoxResultsContent}>
                                        {JSON.stringify(sparqlResult, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </Collapse>
                    </Paper>
                )}
                {questionQueryAnswer[query]?.ctQuery && (
                    <Paper className={classes.queryBox}>
                        <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            className={classes.queryBoxHeader}
                            onClick={toggleCTQuery}
                            style={{cursor: 'pointer'}}
                        >
                            <Grid item>
                                <h5 className={classes.queryBoxTitle}>ClinicalTrials.gov API Query</h5>
                            </Grid>
                            <Grid item>
                                <IconButton onClick={toggleCTQuery} size="small">
                                    {showCTQuery ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Collapse in={showCTQuery} timeout="auto" unmountOnExit>
                            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '16px'}}>
                                {questionQueryAnswer[query]?.ctQuery || ''}
                            </pre>
                            <h4 className={classes.queryBoxTitle}>Results:</h4>
                            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '16px'}}>
                                {questionQueryAnswer[query]?.ctAnswer || ''}
                            </pre>
                        </Collapse>
                    </Paper>
                )}
                {questionQueryAnswer[query]?.query && (
                    <Paper className={classes.queryBox}>
                        <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            className={classes.queryBoxHeader}
                            onClick={toggleMetadataQuery}
                            style={{cursor: 'pointer'}}
                        >
                            <Grid item>
                                <h5 className={classes.queryBoxTitle}>
                                    Would you like to see the results on metadata page?
                                </h5>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<OpenInNewIcon />}
                                    onClick={() => redirectToMetadataViews(questionQueryAnswer[query]?.query)}
                                    className={classes.headerButton}
                                >
                                    Show results
                                </Button>
                                <IconButton onClick={toggleMetadataQuery} size="small">
                                    {showMetadataQuery ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Collapse in={showMetadataQuery} timeout="auto" unmountOnExit>
                            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '16px'}}>
                                {questionQueryAnswer[query]?.query}
                            </pre>
                        </Collapse>
                    </Paper>
                )}
            </Grid>
            <div>{renderMetadataDialog()}</div>
        </Paper>
    );
};

export default withStyles(styles)(AskAIChat);
