// @flow
import React, {useContext} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    IconButton,
    List,
    Menu,
    MenuItem,
    Typography
} from '@material-ui/core';
import {CloudDownload, FolderOpen, HighlightOffSharp, MoreVert} from '@material-ui/icons';
import {useHistory, withRouter} from 'react-router-dom';
import LockOpen from "@material-ui/icons/LockOpen";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import {ConfirmationButton, ConfirmationDialog, ErrorDialog, LoadingInlay} from '../common';

import CollectionEditor from "./CollectionEditor";
import type {Collection, Resource} from './CollectionAPI';
import CollectionsContext from '../common/contexts/CollectionsContext';
import {workspacePrefix} from '../workspaces/workspaces';
import type {History} from '../types';
import UsersContext from '../common/contexts/UsersContext';
import {getDisplayName} from "../common/utils/userUtils";
import SharingContext, {SharingProvider} from "../common/contexts/SharingContext";
import {sortPermissions} from "../common/utils/permissionUtils";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import type {Workspace} from "../workspaces/WorkspacesAPI";

export const ICONS = {
    LOCAL_STORAGE: <FolderOpen aria-label="Local storage" />,
    AZURE_BLOB_STORAGE: <CloudDownload />,
    S3_BUCKET: <CloudDownload />,
    GOOGLE_CLOUD_BUCKET: <CloudDownload />
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

type CollectionDetailsProps = {
    loading: boolean;
    collection: Collection;
    workspaces: Array<Workspace>;
    users: any[];
    inCollectionsBrowser: boolean;
    deleteCollection: (Resource) => Promise<void>;
    setBusy: (boolean) => void;
    history: History;
};

type CollectionDetailsState = {
    editing: boolean;
    deleting: boolean;
    anchorEl: any;
}

export class CollectionDetails extends React.Component<CollectionDetailsProps, CollectionDetailsState> {
    static defaultProps = {
        inCollectionsBrowser: false,
        setBusy: () => {}
    };

    state = {
        editing: false,
        anchorEl: null,
        deleting: false,
        showAddShareDialog: false,
        workspacesToAdd: []
    };

    handleEdit = () => {
        if (this.props.collection.canWrite) {
            this.setState({editing: true});
            this.handleMenuClose();
        }
    };

    handleDelete = () => {
        if (this.props.collection.canWrite) {
            this.setState({deleting: true});
            this.handleMenuClose();
        }
    };

    handleCloseDelete = () => {
        this.setState({deleting: false});
    };

    handleMenuClick = (event: Event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    };

    handleCollectionDelete = (collection: Collection) => {
        const {setBusy, deleteCollection, history} = this.props;
        setBusy(true);
        deleteCollection(collection)
            .then(() => history.push(`${workspacePrefix()}/collections`))
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                this.handleCollectionDelete
            ))
            .finally(() => setBusy(false));
    };

    getUsernameByIri = (iri: string) => {
        const {users} = this.props;
        const user = users.find(u => u.iri === iri);
        return user ? getDisplayName(user) : iri;
    };

    toggleWorkspaceToAdd = (ws) => {
        // eslint-disable-next-line react/no-access-state-in-setstate
        const workspaces = [...this.state.workspacesToAdd];
        const idx = workspaces.indexOf(ws);
        if (idx < 0) {
            workspaces.push(ws);
        } else {
            workspaces.splice(idx, 1);
        }
        this.setState({workspacesToAdd: workspaces});
    }

    render() {
        const {loading, collection, inCollectionsBrowser = false} = this.props;
        const {anchorEl, editing, deleting} = this.state;
        const iconName = collection.type && ICONS[collection.type] ? collection.type : DEFAULT_COLLECTION_TYPE;

        if (loading) {
            return <LoadingInlay />;
        }

        return (
            <>
                <Card>
                    <CardHeader
                        action={!collection.canWrite ? null : (
                            <>
                                <IconButton
                                    aria-label="More"
                                    aria-owns={anchorEl ? 'long-menu' : undefined}
                                    aria-haspopup="true"
                                    onClick={this.handleMenuClick}
                                >
                                    <MoreVert />
                                </IconButton>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={this.handleMenuClose}
                                >
                                    <MenuItem onClick={this.handleEdit}>
                                        Edit
                                    </MenuItem>
                                    <MenuItem onClick={this.handleDelete}>
                                        Delete
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                        titleTypographyProps={{variant: 'h6'}}
                        title={collection.name}
                        avatar={ICONS[iconName]}
                    />
                    <CardContent style={{paddingTop: 0}}>
                        <Typography component="p">
                            {collection.description}
                        </Typography>
                    </CardContent>
                </Card>

                {editing ? (
                    <CollectionEditor
                        collection={collection}
                        updateExisting
                        inCollectionsBrowser={inCollectionsBrowser}
                        setBusy={this.props.setBusy}
                        onClose={() => this.setState({editing: false})}
                    />
                ) : null}
                {deleting ? (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={`Delete collection ${collection.name}`}
                        dangerous
                        agreeButtonText="Delete"
                        onAgree={() => this.handleCollectionDelete(this.props.collection)}
                        onDisagree={this.handleCloseDelete}
                        onClose={this.handleCloseDelete}
                    />
                ) : null}

                <SharingProvider iri={collection.iri}>
                    <SharingContext.Consumer>
                        {({permissions, alterPermission}) => {
                            const workspacesToShareWith = this.props.workspaces
                                .filter(ws => permissions.every(p => p.user !== ws.iri));
                            return (
                                <div>
                                    <Card>
                                        <CardHeader
                                            titleTypographyProps={{variant: 'h6'}}
                                            title="Share"
                                            avatar={(
                                                <LockOpen />
                                            )}
                                        />
                                        <CardContent />
                                        <List dense disablePadding>
                                            {
                                                sortPermissions(permissions.filter(p => p.access === 'Read')).map(p => (
                                                    <ListItem key={p.user}>
                                                        <ListItemText primary={p.name} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} />
                                                        {collection.canManage && (
                                                            <ListItemSecondaryAction>
                                                                <ConfirmationButton
                                                                    onClick={() => {
                                                                        this.props.setBusy(true);
                                                                        alterPermission(p.user, collection.iri, 'None')
                                                                            .catch(e => ErrorDialog.showError(e, 'Error unsharing the collection'))
                                                                            .finally(() => this.props.setBusy(false));
                                                                    }}
                                                                    disabled={p.access === 'Manage'}
                                                                    message="Are you sure you want to remove this share?"
                                                                    agreeButtonText="Ok"
                                                                    dangerous
                                                                >
                                                                    <IconButton disabled={p.access === 'Manage' || !collection.canManage}>
                                                                        <HighlightOffSharp />
                                                                    </IconButton>
                                                                </ConfirmationButton>
                                                            </ListItemSecondaryAction>
                                                        )}
                                                    </ListItem>
                                                ))
                                            }
                                        </List>

                                        {collection.canManage && (
                                            <Button
                                                style={{margin: 8}}
                                                color="primary"
                                                variant="contained"
                                                aria-label="Add"
                                                title="Add a new share"
                                                onClick={() => this.setState({showAddShareDialog: true, workspacesToAdd: []})}
                                            >
                                                Share
                                            </Button>
                                        )}

                                    </Card>
                                    <Dialog open={this.state.showAddShareDialog}>
                                        <DialogTitle>Share collection {collection.name} with other workspaces</DialogTitle>
                                        <DialogContent>
                                            {
                                                workspacesToShareWith.length
                                                    ? (
                                                        <List>
                                                            {
                                                                workspacesToShareWith.map(ws => (
                                                                    <ListItem key={ws.iri} onClick={() => this.toggleWorkspaceToAdd(ws.iri)}>
                                                                        <ListItemIcon>
                                                                            <Checkbox
                                                                                edge="start"
                                                                                checked={this.state.workspacesToAdd.includes(ws.iri)}
                                                                                tabIndex={-1}
                                                                                disableRipple
                                                                            />
                                                                        </ListItemIcon>
                                                                        <ListItemText primary={ws.name} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} />
                                                                    </ListItem>
                                                                ))
                                                            }
                                                        </List>
                                                    )
                                                    : 'This collection has been already shared with all workspaces'
                                            }

                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={
                                                    () => {
                                                        this.props.setBusy(true);
                                                        this.setState({showAddShareDialog: false});

                                                        Promise.all(this.state.workspacesToAdd.map(ws => alterPermission(ws, collection.iri, 'Read')))
                                                            .catch(e => ErrorDialog.showError(e, 'Error sharing the collection'))
                                                            .finally(() => this.props.setBusy(false));
                                                    }
                                                }
                                                color="default"
                                            >
                                                Ok
                                            </Button>
                                            <Button
                                                onClick={() => this.setState({showAddShareDialog: false})}
                                                color="default"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                            );
                        }}

                    </SharingContext.Consumer>
                </SharingProvider>
            </>
        );
    }
}

const ContextualCollectionDetails = (props) => {
    const history = useHistory();
    const {users} = useContext(UsersContext);
    const {deleteCollection} = useContext(CollectionsContext);
    const {workspaces, workspacesLoading} = useContext(WorkspaceContext);

    return (
        <CollectionDetails
            {...props}
            loading={props.loading || workspacesLoading}
            users={users}
            workspaces={workspaces}
            history={history}
            deleteCollection={deleteCollection}
        />
    );
};

export default withRouter(ContextualCollectionDetails);
