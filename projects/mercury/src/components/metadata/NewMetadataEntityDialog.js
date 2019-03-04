import React from 'react';
import {connect} from "react-redux";
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Button, List, ListItem,
    ListItemText, Paper, TextField
} from "@material-ui/core";

import {generateUuid, getLabel} from "../../utils/metadataUtils";
import {compareBy} from "../../utils/comparisionUtils";
import LoadingInlay from '../common/LoadingInlay';
import {fetchMetadataVocabularyIfNeeded} from "../../actions/metadataActions";

class NewMetadataEntityDialog extends React.Component {
    state = {
        creating: false,
        type: null
    };

    componentDidMount() {
        this.props.fetchMetadataVocabularyIfNeeded();
    }

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({creating: true, id: generateUuid(), type: undefined});
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({creating: false});
    }

    createEntity = (e) => {
        e.stopPropagation();
        this.setState({creating: false});
        this.props.onCreate(this.state.type, this.state.id);
    }

    handleInputChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return (
            <>
                <Button
                    variant="contained"
                    color="primary"
                    aria-label="Add"
                    title="Create a new Metadata"
                    onClick={this.openDialog}
                    style={{margin: '10px 0'}}
                >
                    Create
                </Button>

                <Dialog
                    open={this.state.creating}
                    onClose={this.closeDialog}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Create new metadata entity</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            id="name"
                            label="Id"
                            value={this.state.id}
                            name="id"
                            onChange={this.handleInputChange}
                            fullWidth
                            required
                            error={!this.hasValidId()}
                            style={{width: 400}}
                        />
                        <Paper style={{maxHeight: 400, overflow: 'auto', width: 400}}>
                            {
                                this.props.types.length
                                    ? (
                                        <List>
                                            {
                                                this.props.types.sort(compareBy(getLabel)).map(t => (
                                                    <ListItem
                                                        key={t['@id']}
                                                        button
                                                        selected={this.state.type === t}
                                                        onClick={() => this.setState({type: t})}
                                                    >
                                                        <ListItemText
                                                            primary={getLabel(t)}
                                                        />
                                                    </ListItem>
                                                ))
                                            }
                                        </List>
                                    )
                                    : <LoadingInlay />
                            }
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.closeDialog}
                            color="secondary"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={this.createEntity}
                            color="primary"
                            disabled={!this.canCreate()}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    hasValidId() {
        return new URL(`http://example.com/${this.state.id}`).toString() === `http://example.com/${this.state.id}`;
    }

    canCreate() {
        return this.state.type && this.state.id && this.hasValidId();
    }
}

const mapStateToProps = state => ({
    loading: state.cache.vocabulary.pending,
    types: state.cache && state.cache.vocabulary && state.cache.vocabulary.data && state.cache.vocabulary.data.getFairspaceClasses()
});

const mapDispatchToProps = {
    fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMetadataEntityDialog);
