// @flow
import React, {useContext} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    FormControl, FormGroup, FormLabel,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Typography
} from '@material-ui/core';
import {CloudDownload, FolderOutlined, MoreVert} from '@material-ui/icons';
import {useHistory, withRouter} from 'react-router-dom';

import CollectionEditor from "./CollectionEditor";
import type {Collection, Resource, Status} from './CollectionAPI';
import CollectionsContext from './CollectionsContext';
import type {History} from '../types';
import WorkspaceContext from "../workspaces/WorkspaceContext";
import type {Workspace} from "../workspaces/WorkspacesAPI";
import ErrorDialog from "../common/components/ErrorDialog";
import LoadingInlay from "../common/components/LoadingInlay";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import PermissionCard from "../permissions/PermissionCard";
import MessageDisplay from "../common/components/MessageDisplay";
import UsersContext from "../users/UsersContext";
import WorkspaceUserRolesContext, {WorkspaceUserRolesProvider} from "../workspaces/WorkspaceUserRolesContext";
import CollectionStatusChangeDialog from "./CollectionStatusChangeDialog";
import CollectionOwnerChangeDialog from "./CollectionOwnerChangeDialog";
import {descriptionForStatus, isCollectionPage} from "./collectionUtils";
import {getDisplayName} from '../users/userUtils';
import {formatDateTime} from '../common/utils/genericUtils';
import type {User} from '../users/UsersAPI';
import LinkedDataLink from '../metadata/common/LinkedDataLink';

export const ICONS = {
    LOCAL_STORAGE: <FolderOutlined aria-label="Local storage" />,
    AZURE_BLOB_STORAGE: <CloudDownload />,
    S3_BUCKET: <CloudDownload />,
    GOOGLE_CLOUD_BUCKET: <CloudDownload />
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

type CollectionDetailsProps = {
    loading: boolean;
    collection: Collection;
    workspaces: Workspace[];
    inCollectionsBrowser: boolean;
    deleteCollection: (Resource) => Promise<void>;
    undeleteCollection: (Resource) => Promise<void>;
    setStatus: (location: string, status: Status) => Promise<void>;
    setOwnedBy: (location: string, owner: string) => Promise<void>;
    setBusy: (boolean) => void;
    history: History;
};

type CollectionDetailsState = {
    editing: boolean;
    changingStatus: boolean,
    changingOwner: boolean,
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
        changingStatus: false,
        changingOwner: false,
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

    handleChangeStatus = () => {
        if (this.props.collection.canManage) {
            this.setState({changingStatus: true});
            this.handleMenuClose();
        }
    };

    handleChangeOwner = () => {
        if (this.props.collection.canManage) {
            this.setState({changingOwner: true});
            this.handleMenuClose();
        }
    };

    handleDelete = () => {
        if (this.props.collection.canDelete) {
            this.setState({deleting: true});
            this.handleMenuClose();
        }
    };

    handleUndelete = () => {
        if (this.props.collection.canUndelete) {
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

    handleCloseChangingOwner = () => {
        this.setState({changingOwner: false});
    };

    handleMenuClick = (event: Event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    };

    handleCollectionDelete = (collection: Collection) => {
        const {deleteCollection, history} = this.props;
        this.handleCloseDelete();
        deleteCollection(collection)
            .then(() => {
                if (isCollectionPage()) {
                    history.push('/collections');
                }
            })
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                () => this.handleCollectionDelete(collection)
            ));
    };

    handleCollectionUndelete = (collection: Collection) => {
        const {undeleteCollection} = this.props;
        this.handleCloseUndelete();
        undeleteCollection(collection)
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while undeleting a collection",
                () => this.handleCollectionUndelete(collection)
            ));
    };

    handleCollectionOwnerChange = (collection: Collection, selectedOwner: Workspace) => {
        const {setOwnedBy, history} = this.props;
        this.handleCloseChangingOwner();
        setOwnedBy(collection.location, selectedOwner.iri)
            .then(() => {
                if (isCollectionPage()) {
                    history.push('/collections');
                }
            })
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while changing an owner of a collection",
                () => this.handleCollectionOwnerChange(collection, selectedOwner)
            ));
    };

    renderCollectionOwner = (workspace: Workspace) => (
        workspace
        && (
            <FormControl>
                <FormLabel>Owner workspace</FormLabel>
                <FormGroup>
                    <Link
                        color="inherit"
                        underline="hover"
                        href={`/workspace?iri=${encodeURI(workspace.iri)}`}
                        onClick={(e) => {
                            e.preventDefault();
                            this.props.history.push(`/workspace?iri=${encodeURI(workspace.iri)}`);
                        }}
                    >
                        <Typography variant="body2">{workspace.name}</Typography>
                    </Link>
                </FormGroup>
            </FormControl>
        )
    );

    renderCollectionStatus = () => (
        this.props.collection.status
        && (
            <FormControl>
                <FormLabel>Status</FormLabel>
                <FormGroup>
                    <ListItemText
                        primary={this.props.collection.status}
                        secondary={descriptionForStatus(this.props.collection.status)}
                    />
                </FormGroup>
            </FormControl>
        )
    );

    renderDeleted = (dateDeleted: string, deletedBy: User) => (
        dateDeleted && [
            <ListItem key="dateDeleted" disableGutters>
                <FormControl>
                    <FormLabel>Deleted</FormLabel>
                    <FormGroup>
                        <Typography variant="body2">
                            {formatDateTime(dateDeleted)}
                        </Typography>
                    </FormGroup>
                </FormControl>
            </ListItem>,
            <ListItem key="deletedBy" disableGutters>
                <FormControl>
                    <FormLabel>Deleted by</FormLabel>
                    <FormGroup>
                        <Typography variant="body2">
                            <LinkedDataLink uri={deletedBy.iri}>
                                {getDisplayName(deletedBy)}
                            </LinkedDataLink>
                        </Typography>
                    </FormGroup>
                </FormControl>
            </ListItem>
        ]
    );

    render() {
        const {loading, error, collection, users, workspaceRoles, workspaces, inCollectionsBrowser = false} = this.props;
        const {anchorEl, editing, changingStatus, changingOwner, deleting, undeleting} = this.state;
        const iconName = collection.type && ICONS[collection.type] ? collection.type : DEFAULT_COLLECTION_TYPE;

        if (error) {
            return (<MessageDisplay message="An error occurred loading collection details." />);
        }

        if (loading) {
            return <LoadingInlay />;
        }
        const workspaceUsers = users.filter(u => workspaceRoles.some(r => r.iri === u.iri));

        const ownerWorkspace = workspaces.find(w => w.iri === collection.ownerWorkspace);

        const deletedBy = collection.deletedBy && users.find(u => u.iri === collection.deletedBy);

        const menuItems = [];
        if (collection.canWrite && !collection.dateDeleted) {
            menuItems.push(
                <MenuItem key="edit" onClick={this.handleEdit}>
                    Edit
                </MenuItem>
            );
        }
        if (collection.canManage) {
            menuItems.push([
                <MenuItem key="ownership" onClick={this.handleChangeOwner}>
                    Transfer ownership &hellip;
                </MenuItem>,
                <MenuItem
                    key="status"
                    onClick={this.handleChangeStatus}
                    disabled={collection.availableStatuses.length === 1}
                >
                    Change status &hellip;
                </MenuItem>
            ]);
        }
        if (collection.canDelete) {
            menuItems.push(
                <MenuItem key="delete" onClick={this.handleDelete}>
                    {collection.dateDeleted ? 'Delete permanently' : 'Delete'} &hellip;
                </MenuItem>
            );
        }
        if (collection.canUndelete) {
            menuItems.push(
                <MenuItem key="undelete" onClick={this.handleUndelete}>
                    Undelete &hellip;
                </MenuItem>
            );
        }

        return (
            <>
                <Card>
                    <CardHeader
                        action={menuItems && menuItems.length > 0 && (
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
                                    {menuItems}
                                </Menu>
                            </>
                        )}
                        titleTypographyProps={{variant: 'h6'}}
                        title={collection.name}
                        avatar={ICONS[iconName]}
                        style={{wordBreak: 'break-word'}}
                    />
                    <CardContent style={{paddingTop: 0}}>
                        <Typography component="p">
                            {collection.description}
                        </Typography>
                        <List>
                            <ListItem disableGutters>
                                {this.renderCollectionOwner(ownerWorkspace)}
                            </ListItem>
                            <ListItem disableGutters>
                                {this.renderCollectionStatus()}
                            </ListItem>
                            {this.renderDeleted(collection.dateDeleted, deletedBy)}
                        </List>
                    </CardContent>
                </Card>

                <PermissionCard
                    collection={collection}
                    users={users}
                    workspaceUsers={workspaceUsers}
                    workspaces={workspaces}
                    setBusy={this.props.setBusy}
                />

                {editing ? (
                    <CollectionEditor
                        collection={collection}
                        updateExisting
                        inCollectionsBrowser={inCollectionsBrowser}
                        setBusy={this.props.setBusy}
                        onClose={() => this.setState({editing: false})}
                    />
                ) : null}
                {changingStatus ? (
                    <CollectionStatusChangeDialog
                        collection={collection}
                        setValue={this.props.setStatus}
                        onClose={() => this.setState({changingStatus: false})}
                    />
                ) : null}
                {changingOwner ? (
                    <CollectionOwnerChangeDialog
                        collection={collection}
                        workspaces={workspaces}
                        changeOwner={this.handleCollectionOwnerChange}
                        onClose={() => this.handleCloseChangingOwner()}
                    />
                ) : null}
                {undeleting ? (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={(
                            <span>
                                Are you sure you want to <b>undelete</b> collection <em>{collection.name}</em>?
                            </span>
                        )}
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
                        content={(
                            <span>
                                Collection {collection.name} is already marked as deleted.<br />
                                <b>Are you sure you want to delete it permanently</b>?
                            </span>
                        )}
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
                        content={(
                            <span>
                                Are you sure you want to <b>delete</b> collection <em>{collection.name}</em>?
                            </span>
                        )}
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
    const {users} = useContext(UsersContext);
    const {deleteCollection, undeleteCollection, setStatus, setOwnedBy} = useContext(CollectionsContext);
    const {workspaces, workspacesError, workspacesLoading} = useContext(WorkspaceContext);

    return (
        <WorkspaceUserRolesProvider iri={props.collection.ownerWorkspace}>
            <WorkspaceUserRolesContext.Consumer>
                {({workspaceRoles, workspaceRolesError, workspaceRolesLoading}) => (
                    <CollectionDetails
                        {...props}
                        error={props.error || workspacesError || workspaceRolesError}
                        loading={props.loading || workspacesLoading || workspaceRolesLoading}
                        users={users}
                        workspaceRoles={workspaceRoles}
                        workspaces={workspaces}
                        history={history}
                        deleteCollection={deleteCollection}
                        undeleteCollection={undeleteCollection}
                        setStatus={setStatus}
                        setOwnedBy={setOwnedBy}
                    />
                )}
            </WorkspaceUserRolesContext.Consumer>
        </WorkspaceUserRolesProvider>
    );
};

export default withRouter(ContextualCollectionDetails);
