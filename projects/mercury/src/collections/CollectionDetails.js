// @flow
import React, {useContext} from 'react';
import {Card, CardContent, CardHeader, IconButton, List, Menu, MenuItem, Typography} from '@material-ui/core';
import {CloudDownload, FolderOpen, MoreVert} from '@material-ui/icons';
import {useHistory, withRouter} from 'react-router-dom';

import LockOpen from "@material-ui/icons/LockOpen";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import CollectionEditor from "./CollectionEditor";
import type {Collection, Resource} from './CollectionAPI';
import CollectionsContext from './CollectionsContext';
import type {History} from '../types';
import UserContext from '../users/UserContext';
import WorkspaceContext from "../workspaces/WorkspaceContext";
import type {Workspace} from "../workspaces/WorkspacesAPI";
import {isDataSteward} from "../users/userUtils";
import ErrorDialog from "../common/components/ErrorDialog";
import LoadingInlay from "../common/components/LoadingInlay";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import {compareBy} from "../common/utils/genericUtils";

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
    currentUser: any;
    inCollectionsBrowser: boolean;
    deleteCollection: (Resource) => Promise<void>;
    undeleteCollection: (Resource) => Promise<void>;
    setBusy: (boolean) => void;
    history: History;
};

type CollectionDetailsState = {
    editing: boolean;
    deleting: boolean;
    undeleting: boolean;
    anchorEl: any;
}

class CollectionDetails extends React.Component<CollectionDetailsProps, CollectionDetailsState> {
    static defaultProps = {
        inCollectionsBrowser: false,
        setBusy: () => {}
    };

    state = {
        editing: false,
        anchorEl: null,
        deleting: false,
        undeleting: false
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

    handleUndelete = () => {
        if (this.props.collection.canWrite) {
            this.setState({undeleting: true});
            this.handleMenuClose();
        }
    };

    handleCloseDelete = () => {
        this.setState({deleting: false});
    };

    handleCloseUndelete = () => {
        this.setState({undeleting: false});
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
        this.handleCloseDelete();
        deleteCollection(collection)
            .then(() => history.push('/collections'))
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                () => this.handleCollectionDelete(collection)
            ))
            .finally(() => setBusy(false));
    };

    handleCollectionUndelete = (collection: Collection) => {
        const {setBusy, undeleteCollection, history} = this.props;
        setBusy(true);
        this.handleCloseUndelete();
        undeleteCollection(collection)
            .then(() => history.push('/collections'))
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while undeleting a collection",
                () => this.handleCollectionUndelete(collection)
            ))
            .finally(() => setBusy(false));
    };

    render() {
        const {loading, collection, inCollectionsBrowser = false} = this.props;
        const {anchorEl, editing, deleting, undeleting} = this.state;
        const iconName = collection.type && ICONS[collection.type] ? collection.type : DEFAULT_COLLECTION_TYPE;

        if (loading) {
            return <LoadingInlay />;
        }

        return (
            <>
                <Card>
                    <CardHeader
                        action={collection.canWrite && (
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
                                    {!collection.dateDeleted && (
                                        <MenuItem onClick={this.handleEdit}>
                                            Edit
                                        </MenuItem>
                                    )}
                                    {isDataSteward(this.props.currentUser) && (
                                        <MenuItem onClick={this.handleDelete}>
                                            {collection && collection.dateDeleted ? 'Delete permanently' : 'Delete'}
                                        </MenuItem>
                                    )}
                                    {collection.dateDeleted && (
                                        <MenuItem onClick={this.handleUndelete}>
                                            Undelete
                                        </MenuItem>
                                    )}
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

                <Card>
                    <CardHeader
                        titleTypographyProps={{variant: 'h6'}}
                        title="Shared with workspaces"
                        avatar={(
                            <LockOpen />
                        )}
                    />
                    <CardContent>
                        <List dense disablePadding>
                            {collection.sharedWith.map(workspaceIri => this.props.workspaces.find(ws => ws.iri === workspaceIri))
                                .sort(compareBy('name'))
                                .map(ws => (
                                    <ListItem key={'share-' + ws.iri}>
                                        <ListItemText
                                            primary={ws.name}
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                        </List>
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
                {undeleting ? (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={`Undelete collection ${collection.name}`}
                        dangerous
                        agreeButtonText="Undelete"
                        onAgree={() => this.handleCollectionUndelete(this.props.collection)}
                        onDisagree={this.handleCloseUndelete}
                        onClose={this.handleCloseUndelete}
                    />
                ) : null}
                {deleting && collection.dateDeleted && (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={`Collection ${collection.name} is already marked as deleted.`
                         + " Are you sure you want to delete it permanently?"}
                        dangerous
                        agreeButtonText="Delete permanently"
                        onAgree={() => this.handleCollectionDelete(this.props.collection)}
                        onDisagree={this.handleCloseDelete}
                        onClose={this.handleCloseDelete}
                    />
                )}
                {deleting && !collection.dateDeleted && (
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
                )}

            </>
        );
    }
}

const ContextualCollectionDetails = (props) => {
    const history = useHistory();
    const {currentUser} = useContext(UserContext);
    const {deleteCollection, undeleteCollection} = useContext(CollectionsContext);
    const {workspaces, workspacesLoading} = useContext(WorkspaceContext);

    return (
        <CollectionDetails
            {...props}
            loading={props.loading || workspacesLoading}
            currentUser={currentUser}
            workspaces={workspaces}
            history={history}
            deleteCollection={deleteCollection}
            undeleteCollection={undeleteCollection}
        />
    );
};

export default withRouter(ContextualCollectionDetails);
