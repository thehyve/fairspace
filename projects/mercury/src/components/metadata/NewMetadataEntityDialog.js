import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Icon from "@material-ui/core/Icon/Icon";
import Paper from "@material-ui/core/Paper/Paper";
import TextField from "@material-ui/core/TextField/TextField";
import {connect} from "react-redux";
import {generateUuid, getLabel} from "../../utils/metadataUtils";
import {compareBy} from "../../utils/comparisionUtils";
import LoadingInlay from '../common/LoadingInlay';
import {fetchMetadataVocabularyIfNeeded} from "../../actions/metadataActions";

class NewMetadataEntityDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            creating: false,
            type: null
        };

        // Retrieve the metadata vocabulary, if needed
        props.fetchMetadataVocabularyIfNeeded();
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
            <div style={{display: 'inline'}}>
                <Fab
                    mini="true"
                    color="secondary"
                    aria-label="Add"
                    title="Add"
                    onClick={this.openDialog}
                >
                    <Icon>add</Icon>
                </Fab>

                <Dialog
                    open={this.state.creating}
                    onClick={e => e.stopPropagation()}
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
            </div>
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
