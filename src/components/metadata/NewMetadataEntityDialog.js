import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Icon from "@material-ui/core/Icon/Icon";
import {genUuid, getLabel} from "../../utils/metadatautils";
import Paper from "@material-ui/core/Paper/Paper";
import {compareBy} from "../../utils/comparators";
import TextField from "@material-ui/core/TextField/TextField";
import MetadataAPI from "../../services/MetadataAPI/MetadataAPI";


class NewMetadataEntityDialog extends React.Component{
    constructor(props) {
        super(props);
        const {
            onCreate,
            ...componentProps
        } = props;

        this.onCreate = onCreate;
        this.componentProps = componentProps;

        this.state = {
            creating: false,
            types: []
        };

        MetadataAPI.getVocabulary()
            .then(vocabulary => this.setState({types: vocabulary.getFairspaceClasses()}))
    }

    componentWillReceiveProps(props) {
        if(props.onCreate)
            this.onCreate = props.onCreate;

        this.setState({
            creating: false
        });
    }

    openDialog(e) {
        e.stopPropagation();
        this.setState({creating: true, id: genUuid(), type: undefined});
    }

    closeDialog(e) {
        if(e) e.stopPropagation();
        this.setState({creating: false});
    }

    createEntity(e) {
        e.stopPropagation();
        this.setState({creating: false});
        this.onCreate(this.state.type, this.state.id);
    }

    handleInputChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return (
            <div style={{display: 'inline'}}>
                <Button variant="fab" mini color="secondary" aria-label="Add"
                        onClick={this.openDialog.bind(this)}>
                    <Icon>add</Icon>
                </Button>

                <Dialog
                    open={this.state.creating}
                    onClick={e => e.stopPropagation()}
                    onClose={this.closeDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Create new metadata entity</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            id='name'
                            label='Id'
                            value={this.state.id}
                            name='id'
                            onChange={this.handleInputChange.bind(this)}
                            fullWidth
                            required={true}
                            style={{width: 400}}
                        />
                        <Paper style={{maxHeight: 400, overflow: 'auto', width: 400}}>

                        <List>
                            {
                                this.state.types.sort(compareBy(getLabel)).map(t => (
                                    <ListItem
                                        button
                                        selected={this.state.type === t}
                                        onClick={() => this.setState({type: t})}
                                    >
                                        <ListItemText primary={getLabel(t)}/>
                                    </ListItem>
                                ))
                            }
                        </List>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDialog.bind(this)} color="secondary">
                            Close
                        </Button>
                        <Button onClick={this.createEntity.bind(this)} color="primary" disabled={!(this.state.type && this.state.id)}>
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default NewMetadataEntityDialog;
