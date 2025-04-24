import React, {useEffect, useState} from 'react';
import {Button, Card, Grid, IconButton, Modal, Paper, TextField, Tooltip} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import withStyles from '@mui/styles/withStyles';
import InputAdornment from '@mui/material/InputAdornment';
import styles from './AskAIChat.styles';
import LinkedDataEntityPage from '../metadata/common/LinkedDataEntityPage';
import LoadingOverlayWrapper from '../common/components/LoadingOverlayWrapper';

const AskAIChat = props => {
    const {query, loading, clearChat, setQuery, classes, inputQuery, setInputQuery, questionQueryAnswer} = props;
    const [documentIri, setDocumentIri] = useState('');
    const [openMetadataDialog, setOpenMetadataDialog] = useState(false);

    const handleOpenMetadataDialog = () => setOpenMetadataDialog(true);
    const handleCloseMetadataDialog = () => setOpenMetadataDialog(false);

    const onMetadataDialogClose = () => setDocumentIri('');

    useEffect(() => {
        if (documentIri !== '') {
            handleOpenMetadataDialog();
        } else {
            handleCloseMetadataDialog();
        }
    }, [documentIri]);

    useEffect(() => {
        if (query === '') {
            setInputQuery('');
        }
    }, [query, setInputQuery]);

    // TODO this requires further refactoring, since it is a duplication of LinkedDataLink.js
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
                <LoadingOverlayWrapper loading={loading}>
                    <Grid
                        item
                        container
                        className={classes.chatResponseSection}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="stretch"
                    >
                        {questionQueryAnswer[query]?.answer || ''}
                    </Grid>
                </LoadingOverlayWrapper>
                <Paper style={{margin: 20, padding: 10}}>
                    <h4>Query used:</h4>
                    {questionQueryAnswer[query]?.query || ''}
                </Paper>
            </Grid>
            <div>{renderMetadataDialog()}</div>
        </Paper>
    );
};

export default withStyles(styles)(AskAIChat);
