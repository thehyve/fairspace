// @flow
import React, {useContext} from 'react';
import {withRouter, useHistory} from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';
import type {Collection, CollectionProperties} from './CollectionAPI';
import CollectionsContext from './CollectionsContext';
import {getCollectionAbsolutePath, isCollectionPage} from './collectionUtils';
import type {Match, History} from '../types';
import ErrorDialog from '../common/components/ErrorDialog';
import {fileNameContainsInvalidCharacter, isUnsafeFileName, isValidFileName} from '../file/fileUtils';
import type {Workspace} from '../workspaces/WorkspacesAPI';

const fields = ['name', 'description', 'ownerWorkspace'];

const copyProperties = (properties: CollectionProperties): CollectionProperties =>
    ((fields.reduce((copy, field) => {
        copy[field] = properties ? properties[field] || '' : '';
        return copy;
    }, {}): any): CollectionProperties);

const havePropertiesChanged = (collection: CollectionProperties, properties: CollectionProperties) =>
    !collection || fields.some(field => collection[field] !== properties[field]);

const MAX_LOCATION_LENGTH = 127;

const isNameValid = (name: string) => !!name && isValidFileName(name) && name.trim().length <= MAX_LOCATION_LENGTH;

/**
 * Checks whether the input is valid. Check whether the name is not empty.
 *
 * Please note that the name may still be invalid, if another collection uses the same
 * name. This will be checked when actually submitting the form.
 * @returns {boolean}
 */
export const isInputValid = (properties: CollectionProperties) => isNameValid(properties.name);

export const formatPrefix = (prefix: string) => (prefix ? `[${prefix.replace(/[/\\]/g, '')}] ` : '');

const styles = theme => ({
    textHelperBasic: {
        color: theme.palette.mellow.main
    },
    textHelperWarning: {
        color: theme.palette.warning.dark
    }
});

type PathParam = {
    path: string
};

type CollectionEditorProps = {
    collection: Collection,
    updateExisting: boolean,
    addCollection: CollectionProperties => Promise<void>,
    updateCollection: Collection => Promise<void>,
    renameCollection: Collection => Promise<void>,
    onClose: () => void,
    setBusy: boolean => void,
    match: Match<PathParam>,
    history: History,
    workspace: Workspace,
    classes: any
};

type CollectionEditorState = {
    editing: boolean,
    saveInProgress: false,
    properties: CollectionProperties
};

export class CollectionEditor extends React.Component<CollectionEditorProps, CollectionEditorState> {
    static defaultProps = {
        setBusy: () => {},
        updateExisting: false,
        workspace: {}
    };

    state = {
        editing: true,
        saveInProgress: false,
        properties: this.props.collection
            ? copyProperties(this.props.collection)
            : {
                  name: formatPrefix(this.props.workspace.code),
                  description: '',
                  ownerWorkspace: this.props.workspace.iri
              }
    };

    unmounting = false;

    editNameEnabled =
        !this.props.collection ||
        (this.props.collection &&
            this.props.collection.canManage &&
            this.props.collection.accessMode !== 'DataPublished');

    componentWillUnmount() {
        this.unmounting = true;
    }

    onSaveStart = () => {
        const {setBusy} = this.props;
        this.setState({saveInProgress: true});
        setBusy(true);
    };

    onSaveComplete = () => {
        if (!this.unmounting) {
            this.setState({saveInProgress: false});
        }
        const {setBusy} = this.props;
        setBusy(false);
    };

    handleAddCollection = (properties: CollectionProperties) => {
        properties.name = properties.name.trim();
        const {addCollection} = this.props;
        this.onSaveStart();
        return addCollection(properties)
            .then(() => {
                this.onSaveComplete();
                this.close();
            })
            .catch((err: Error) => {
                this.onSaveComplete();
                if (err.message.includes('name already exists') || err.message.includes('status code 409')) {
                    ErrorDialog.showError(
                        'Collection name must be unique',
                        'Collection name is already in use. Please choose a unique name.'
                    );
                    return;
                }
                ErrorDialog.showError('Could not create collection', err.message);
            });
    };

    handleCollectionRename = (target: string) => {
        const {collection, renameCollection} = this.props;
        return renameCollection(collection.name, target)
            .then(() => {
                this.onSaveComplete();
                if (isCollectionPage()) {
                    // If the collection location changes, the URI for the current page should change as well
                    const {
                        history,
                        match: {
                            params: {path}
                        }
                    } = this.props;
                    history.push(`${getCollectionAbsolutePath(target)}/${path || ''}`);
                } else {
                    this.close();
                }
            })
            .catch((err: Error) => {
                this.onSaveComplete();
                if (err.message.includes('destination file already exists')) {
                    ErrorDialog.showError(
                        'Collection name must be unique',
                        'Collection name is already in use. Please choose a unique name.'
                    );
                    return;
                }
                ErrorDialog.showError('Could not rename collection', err.message);
            });
    };

    handleUpdateCollection = (properties: CollectionProperties) => {
        const {collection, updateCollection} = this.props;
        this.onSaveStart();

        return updateCollection((({iri: collection.iri, ...properties}: any): Collection))
            .then(() => {
                if (collection.name.trim() !== properties.name.trim()) {
                    this.handleCollectionRename(properties.name.trim());
                } else {
                    this.onSaveComplete();
                    this.close();
                }
            })
            .catch(() => {});
    };

    handleSave = () => {
        if (this.props.updateExisting) {
            this.handleUpdateCollection(this.state.properties);
        } else {
            this.handleAddCollection(this.state.properties);
        }
    };

    close = () => {
        if (!this.unmounting) {
            this.setState({editing: false});
        }
        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    handleInputChange = (name: string, value: any) => {
        const {properties} = this.state;
        properties[name] = value;
        const state = {properties};
        this.setState(state);
    };

    isSaveEnabled = () =>
        !this.state.saveInProgress &&
        isInputValid(this.state.properties) &&
        havePropertiesChanged(this.props.collection, this.state.properties);

    validateNameStartsWithWorkspaceCode() {
        return this.state.properties.name.startsWith(`[${this.props.workspace.code}]`);
    }

    renderCollectionNameHelperText() {
        return (
            <span>
                <span className={this.props.classes.textHelperBasic}>Unique collection name.</span>
                <span
                    className={
                        this.validateNameStartsWithWorkspaceCode()
                            ? this.props.classes.textHelperBasic
                            : this.props.classes.textHelperWarning
                    }
                >
                    <br />
                    {!this.validateNameStartsWithWorkspaceCode() && (
                        <span>
                            <b>Warning!</b> Name does not start with the suggested form of a workspace code:
                            <i> {formatPrefix(this.props.workspace.code)}</i>
                            <br />
                        </span>
                    )}
                    Keep the workspace code prefix. It ensures collection uniqueness between workspaces.
                    <br />
                </span>
                {isUnsafeFileName(this.state.properties.name.trim()) ? "Name cannot equal '.' or '..'" : ''}
                {fileNameContainsInvalidCharacter(this.state.properties.name) ? "Name cannot contain '/' or '\\'." : ''}
                {this.state.properties.name.trim().length > MAX_LOCATION_LENGTH
                    ? `Maximum length: ${MAX_LOCATION_LENGTH}.`
                    : ''}
            </span>
        );
    }

    render() {
        return (
            <Dialog open={this.state.editing} onClose={this.props.onClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    {this.props.collection ? 'Edit collection' : 'Add collection'}
                </DialogTitle>
                <DialogContent>
                    {this.props.collection && (
                        <DialogContentText>
                            Be aware that renaming of a large collection can take more time.
                        </DialogContentText>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        helperText={this.renderCollectionNameHelperText()}
                        value={this.state.properties.name}
                        name="name"
                        onChange={event => this.handleInputChange('name', event.target.value)}
                        fullWidth
                        required
                        disabled={!this.editNameEnabled}
                        error={!isNameValid(this.state.properties.name)}
                    />
                    <TextField
                        margin="dense"
                        multiline
                        id="description"
                        label="Description"
                        name="description"
                        value={this.state.properties.description}
                        onChange={event => this.handleInputChange('description', event.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.handleSave}
                        disabled={!this.isSaveEnabled()}
                        aria-label="Save"
                        color="primary"
                    >
                        Save
                    </Button>
                    <Button onClick={this.close} aria-label="Cancel" color="inherit">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

const ContextualCollectionEditor = props => {
    const history = useHistory();
    const {addCollection, updateCollection, renameCollection} = useContext(CollectionsContext);

    return (
        <CollectionEditor
            {...props}
            history={history}
            addCollection={addCollection}
            updateCollection={updateCollection}
            renameCollection={renameCollection}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualCollectionEditor));
