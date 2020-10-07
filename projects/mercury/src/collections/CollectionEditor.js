// @flow
import React, {useContext} from 'react';
import {withRouter, useHistory} from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import type {Collection, CollectionProperties} from './CollectionAPI';
import CollectionsContext from './CollectionsContext';
import {getCollectionAbsolutePath, isCollectionPage} from './collectionUtils';
import type {Match, History} from '../types';
import ErrorDialog from "../common/components/ErrorDialog";

const fields = ['name', 'description', 'location', 'ownerWorkspace'];

const copyProperties = (properties: CollectionProperties): CollectionProperties => ((fields
    .reduce((copy, field) => { copy[field] = properties ? properties[field] || '' : ''; return copy; }, {}): any): CollectionProperties);

const havePropertiesChanged = (collection: CollectionProperties, properties: CollectionProperties) => !collection
    || fields.some(field => collection[field] !== properties[field]);

const NON_SAFE_CHARACTERS_REGEX = /[^a-z0-9_-]+/gi;

const MAX_LOCATION_LENGTH = 127;

/**
 * Converts the given collection name to a safe directory name
 * @param name
 * @returns {string}
 */
export const convertToSafeDirectoryName = (name: string) => {
    const safeName = name.replace(NON_SAFE_CHARACTERS_REGEX, '_');
    return safeName.length <= MAX_LOCATION_LENGTH ? safeName : safeName.substring(0, MAX_LOCATION_LENGTH);
};

/**
 * Checks whether the input is valid. Check whether the name and location are given
 * and that the location does not contain any unsafe characters.
 *
 * Please note that the location may still be invalid, if another collection uses the same
 * location. This will be checked when actually submitting the form.
 * @returns {boolean}
 */
export const isInputValid = (properties: CollectionProperties) => !!properties.name && !!properties.location && !properties.location.match(NON_SAFE_CHARACTERS_REGEX);

type PathParam = {
    path: string;
}

type CollectionEditorProps = {
    collection: Collection,
    updateExisting: boolean,
    addCollection: (CollectionProperties) => Promise<void>,
    updateCollection: (Collection) => Promise<void>,
    setCollectionLabel: (Collection) => Promise<void>,
    relocateCollection: (Collection) => Promise<void>,
    onClose: () => void,
    setBusy: (boolean) => void,
    match: Match<PathParam>,
    history: History,
    workspaceIri: string
};

type CollectionEditorState = {
    editing: boolean,
    saveInProgress: false,
    properties: CollectionProperties
};

export class CollectionEditor extends React.Component<CollectionEditorProps, CollectionEditorState> {
    static defaultProps = {
        setBusy: () => {},
        updateExisting: false
    };

    state = {
        editing: true,
        saveInProgress: false,
        properties: this.props.collection
            ? copyProperties(this.props.collection)
            : {name: '', description: '', location: '', ownerWorkspace: this.props.workspaceIri}
    };

    unmounting = false;

    componentWillUnmount() {
        this.unmounting = true;
    }

    handleCollectionUpdateError(err) {
        const msg = (err && err.message && err.message.includes('Duplicate label'))
            ? "A collection with that name already exists. Collection names must be unique."
            : err;
        ErrorDialog.showError("An error occurred while updating a collection", msg);
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
        const {addCollection} = this.props;
        this.onSaveStart();
        return addCollection(properties)
            .then(() => {
                this.close();
            })
            .catch(this.handleCollectionUpdateError)
            .finally(() => {
                this.onSaveComplete();
            });
    };

    handleCollectionLocationChange = (newLocation: string) => {
        const {collection, relocateCollection} = this.props;
        return relocateCollection(collection.location, newLocation)
            .then(() => {
                this.onSaveComplete();
                if (isCollectionPage()) {
                    // If the collection location changes, the URI for the current page should change as well
                    const {history, match: {params: {path}}} = this.props;
                    history.push(`${getCollectionAbsolutePath(newLocation)}/${path || ''}`);
                } else {
                    this.close();
                }
            })
            .catch(err => {
                this.onSaveComplete();
                ErrorDialog.showError("An error occurred while renaming a collection", err);
            });
    };

    handleCollectionLabelChange = (newLabel: string) => {
        const {collection, setCollectionLabel} = this.props;
        return setCollectionLabel(collection.location, newLabel)
            .then(() => {
                this.onSaveComplete();
                this.close();
            })
            .catch(err => {
                this.onSaveComplete();
                ErrorDialog.showError("An error occurred while changing a collection label", err);
            });
    };

    handleUpdateCollection = (properties: CollectionProperties) => {
        const {collection, updateCollection} = this.props;
        this.onSaveStart();

        return updateCollection((({iri: collection.iri, ...properties}: any): Collection))
            .then(() => {
                if (collection.name !== properties.name) {
                    this.handleCollectionLabelChange(properties.name);
                }
            })
            .then(() => {
                if (collection.location !== properties.location) {
                    this.handleCollectionLocationChange(properties.location);
                } else {
                    this.onSaveComplete();
                    this.close();
                }
            })
            .catch((err) => {
                this.onSaveComplete();
                this.handleCollectionUpdateError(err);
            });
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

    handleNameChange = (event: Event) => {
        const shouldUpdateLocation = this.shouldUpdateLocationOnNameChange();
        const newName = (event.target: any).value;

        this.handleInputChange('name', newName);

        if (shouldUpdateLocation) {
            this.handleInputChange('location', convertToSafeDirectoryName(newName));
        }
    };

    editLocationEnabled = (!this.props.collection) || (
        (this.props.collection && this.props.collection.canManage && this.props.collection.accessMode !== 'DataPublished'));

    editNameEnabled = !this.props.collection || (this.props.collection && this.props.collection.canManage);

    /**
     * Determines whether the location should be updated when the name changes.
     *
     * Returns true if the user has not changed the location manually
     * and if location change is allowed (i.e., the collection has not been published yet).
     * @type {function}
     */
    shouldUpdateLocationOnNameChange = () => this.editLocationEnabled && convertToSafeDirectoryName(this.state.properties.name) === this.state.properties.location;

    isSaveEnabled = () => (!this.state.saveInProgress)
        && isInputValid(this.state.properties)
        && havePropertiesChanged(this.props.collection, this.state.properties);

    render() {
        return (
            <Dialog
                open={this.state.editing}
                onClose={this.props.onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {this.props.collection ? 'Edit collection' : 'Add collection'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>You can edit the collection details here.</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        helperText="Unique collection name"
                        value={this.state.properties.name}
                        name="name"
                        onChange={(event) => this.handleNameChange(event)}
                        fullWidth
                        required
                        disabled={!this.editNameEnabled}
                    />
                    <TextField
                        margin="dense"
                        multiline
                        id="description"
                        label="Description"
                        name="description"
                        value={this.state.properties.description}
                        onChange={(event) => this.handleInputChange('description', event.target.value)}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="location"
                        label="Collection identifier"
                        helperText={this.editLocationEnabled
                            ? 'This identifier does not allow special characters and has to be unique.'
                            : 'Published collections cannot be moved.'}
                        value={this.state.properties.location}
                        name="location"
                        onChange={(event) => this.handleInputChange('location', event.target.value)}
                        fullWidth
                        required
                        disabled={!this.editLocationEnabled}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleSave} disabled={!this.isSaveEnabled()} aria-label="Save" color="primary">Save</Button>
                    <Button onClick={this.close} aria-label="Cancel" color="inherit">Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

const ContextualCollectionEditor = (props) => {
    const history = useHistory();
    const {addCollection, updateCollection, setLabel, relocateCollection} = useContext(CollectionsContext);

    return (
        <CollectionEditor
            {...props}
            history={history}
            addCollection={addCollection}
            updateCollection={updateCollection}
            setCollectionLabel={setLabel}
            relocateCollection={relocateCollection}
        />
    );
};

export default withRouter(ContextualCollectionEditor);
