// @flow
import React, {useContext} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    FormControl,
    FormGroup,
    FormLabel,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Typography
} from '@mui/material';
import {CloudDownload, Folder, MoreVert} from '@mui/icons-material';
import {useHistory, withRouter} from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';

import CollectionEditor from './CollectionEditor';
import type {Collection, Resource, Status} from './CollectionAPI';
import CollectionsContext from './CollectionsContext';
import type {History} from '../types';
import WorkspaceContext from '../workspaces/WorkspaceContext';
import type {Workspace} from '../workspaces/WorkspacesAPI';
import ErrorDialog from '../common/components/ErrorDialog';
import LoadingInlay from '../common/components/LoadingInlay';
import ConfirmationDialog from '../common/components/ConfirmationDialog';
import PermissionCard from '../permissions/PermissionCard';
import MessageDisplay from '../common/components/MessageDisplay';
import UsersContext from '../users/UsersContext';
import WorkspaceUserRolesContext, {WorkspaceUserRolesProvider} from '../workspaces/WorkspaceUserRolesContext';
import CollectionStatusChangeDialog from './CollectionStatusChangeDialog';
import CollectionOwnerChangeDialog from './CollectionOwnerChangeDialog';
import {descriptionForStatus, isCollectionPage} from './collectionUtils';
import {getDisplayName} from '../users/userUtils';
import {camelCaseToWords, formatDateTime} from '../common/utils/genericUtils';
import type {User} from '../users/UsersAPI';
import LinkedDataLink from '../metadata/common/LinkedDataLink';
import UserContext from '../users/UserContext';
import ProgressButton from '../common/components/ProgressButton';

export const ICONS = {
    LOCAL_STORAGE: <Folder aria-label="Local storage" />,
    AZURE_BLOB_STORAGE: <CloudDownload />,
    S3_BUCKET: <CloudDownload />,
    GOOGLE_CLOUD_BUCKET: <CloudDownload />
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

type CollectionDetailsProps = {
    loading: boolean,
    collection: Collection,
    onChangeOwner: () => void,
    workspaces: Workspace[],
    deleteCollection: Resource => Promise<void>,
    undeleteCollection: Resource => Promise<void>,
    unpublish: Resource => Promise<void>,
    setStatus: (name: string, status: Status) => Promise<void>,
    setOwnedBy: (name: string, owner: string) => Promise<void>,
    setBusy: boolean => void,
    history: History
};

type CollectionDetailsState = {
    editing: boolean,
    changingStatus: boolean,
    changingOwner: boolean,
    deleting: boolean,
    undeleting: boolean,
    unpublishing: boolean,
    anchorEl: any
};

const styles = theme => ({
    card: {
        '& .MuiCardHeader-root .MuiSvgIcon-root': {
            color: theme.palette.primary.contrastText
        }
    }
});

class CollectionDetails extends React.Component<CollectionDetailsProps, CollectionDetailsState> {
    static defaultProps = {
        onChangeOwner: () => {},
        setBusy: () => {}
    };

    state = {
        editing: false,
        changingStatus: false,
        changingOwner: false,
        anchorEl: null,
        deleting: false,
        undeleting: false,
        unpublishing: false,
        isActiveOperation: false
    };

    unmounting = false;

    componentWillUnmount() {
        this.unmounting = true;
    }

    handleCollectionOperation = operationPromise => {
        this.setState({isActiveOperation: true});
        return operationPromise
            .then(r => {
                this.setState({isActiveOperation: false});
                return r;
            })
            .catch(e => {
                this.setState({isActiveOperation: false});
                return Promise.reject(e);
            });
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

    handleUnpublish = () => {
        if (this.props.collection.canUnpublish) {
            this.setState({unpublishing: true});
            this.handleMenuClose();
        }
    };

    handleCloseDelete = () => {
        this.setState({deleting: false});
    };

    handleCloseUndelete = () => {
        this.setState({undeleting: false});
    };

    handleCloseUnpublish = () => {
        this.setState({unpublishing: false});
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
        this.handleCollectionOperation(deleteCollection(collection))
            .then(() => {
                if (isCollectionPage()) {
                    history.push('/collections');
                }
            })
            .catch(e =>
                ErrorDialog.showError('An error occurred while deleting a collection', e, () =>
                    this.handleCollectionDelete(collection)
                )
            );
    };

    handleCollectionUndelete = (collection: Collection) => {
        const {undeleteCollection} = this.props;
        this.handleCloseUndelete();
        this.handleCollectionOperation(undeleteCollection(collection)).catch(e =>
            ErrorDialog.showError('An error occurred while undeleting a collection', e, () =>
                this.handleCollectionUndelete(collection)
            )
        );
    };

    handleCollectionUnpublish = (collection: Collection) => {
        const {unpublish} = this.props;
        this.handleCloseUnpublish();
        this.handleCollectionOperation(unpublish(collection)).catch(err =>
            ErrorDialog.showError('An error occurred while unpublishing a collection', err, () =>
                this.handleCollectionUnpublish(collection)
            )
        );
    };

    handleCollectionOwnerChange = (collection: Collection, selectedOwner: Workspace) => {
        const {setOwnedBy, onChangeOwner, history} = this.props;
        this.handleCloseChangingOwner();
        onChangeOwner();
        this.handleCollectionOperation(setOwnedBy(collection.name, selectedOwner.iri))
            .then(() => {
                if (!selectedOwner.canCollaborate) {
                    history.push('/collections');
                }
            })
            .catch(err =>
                ErrorDialog.showError('An error occurred while changing an owner of a collection', err, () =>
                    this.handleCollectionOwnerChange(collection, selectedOwner)
                )
            );
    };

    renderCollectionOwner = (workspace: Workspace) =>
        workspace && (
            <FormControl>
                <FormLabel>Owner workspace</FormLabel>
                <FormGroup>
                    <Link
                        color="inherit"
                        underline="hover"
                        href={`/workspace?iri=${encodeURI(workspace.iri)}`}
                        onClick={e => {
                            e.preventDefault();
                            this.props.history.push(`/workspace?iri=${encodeURI(workspace.iri)}`);
                        }}
                    >
                        <Typography variant="body2">{workspace.code}</Typography>
                    </Link>
                </FormGroup>
            </FormControl>
        );

    renderCollectionStatus = () =>
        this.props.collection.status && (
            <FormControl>
                <FormLabel>Status</FormLabel>
                <FormGroup>
                    <ListItemText
                        primary={camelCaseToWords(this.props.collection.status, '-')}
                        secondary={descriptionForStatus(this.props.collection.status)}
                    />
                </FormGroup>
            </FormControl>
        );

    renderDeleted = (dateDeleted: string, deletedBy: User) =>
        dateDeleted && [
            <ListItem key="dateDeleted" disableGutters>
                <FormControl>
                    <FormLabel>Deleted</FormLabel>
                    <FormGroup>
                        <Typography variant="body2">{formatDateTime(dateDeleted)}</Typography>
                    </FormGroup>
                </FormControl>
            </ListItem>,
            <ListItem key="deletedBy" disableGutters>
                <FormControl>
                    <FormLabel>Deleted by</FormLabel>
                    <FormGroup>
                        <Typography variant="body2">
                            <LinkedDataLink uri={deletedBy.iri}>{getDisplayName(deletedBy)}</LinkedDataLink>
                        </Typography>
                    </FormGroup>
                </FormControl>
            </ListItem>
        ];

    render() {
        const {loading, error, collection, users, workspaceRoles, workspaces} = this.props;
        const {anchorEl, editing, changingStatus, changingOwner, deleting, undeleting, unpublishing} = this.state;
        const iconName = collection.type && ICONS[collection.type] ? collection.type : DEFAULT_COLLECTION_TYPE;

        if (error) {
            return <MessageDisplay message="An error occurred loading collection details." />;
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
                <MenuItem key="ownership" onClick={this.handleChangeOwner} disabled={workspaces.length <= 1}>
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
        if (collection.canUndelete) {
            menuItems.push(
                <MenuItem key="undelete" onClick={this.handleUndelete}>
                    Undelete &hellip;
                </MenuItem>
            );
        }
        if (collection.canDelete) {
            menuItems.push(
                <MenuItem key="delete" onClick={this.handleDelete}>
                    <Typography color={collection.dateDeleted ? 'error' : 'inherit'}>
                        {collection.dateDeleted ? 'Delete permanently' : 'Delete'} &hellip;
                    </Typography>
                </MenuItem>
            );
        }
        if (collection.canUnpublish) {
            menuItems.push(
                <MenuItem key="unpublish" onClick={this.handleUnpublish}>
                    <Typography color="error">Unpublish &hellip;</Typography>
                </MenuItem>
            );
        }

        return (
            <>
                <Card className={this.props.classes.card}>
                    <CardHeader
                        action={
                            menuItems &&
                            menuItems.length > 0 && (
                                <>
                                    <ProgressButton active={this.state.isActiveOperation}>
                                        <IconButton
                                            aria-label="More"
                                            aria-owns={anchorEl ? 'long-menu' : undefined}
                                            aria-haspopup="true"
                                            onClick={this.handleMenuClick}
                                            styles={{color: 'white'}}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </ProgressButton>
                                    <Menu
                                        id="simple-menu"
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={this.handleMenuClose}
                                    >
                                        {menuItems}
                                    </Menu>
                                </>
                            )
                        }
                        titleTypographyProps={{variant: 'h6'}}
                        title={collection.name}
                        avatar={ICONS[iconName]}
                        style={{wordBreak: 'break-word'}}
                    />
                    <CardContent style={{paddingTop: 8, paddingBottom: 16}}>
                        <Typography component="p" style={{whiteSpace: 'pre-line'}}>
                            {collection.description}
                        </Typography>
                        <List>
                            <ListItem disableGutters>{this.renderCollectionOwner(ownerWorkspace)}</ListItem>
                            <ListItem disableGutters>{this.renderCollectionStatus()}</ListItem>
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
                        workspace={ownerWorkspace}
                        updateExisting
                        setBusy={this.props.setBusy}
                        onClose={() => {
                            if (!this.unmounting) {
                                this.setState({editing: false});
                            }
                        }}
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
                        content={
                            <span>
                                Are you sure you want to <b>undelete</b> collection <em>{collection.name}</em>?
                            </span>
                        }
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
                        content={
                            <span>
                                Collection {collection.name} is already marked as deleted.
                                <br />
                                <b>Are you sure you want to delete it permanently</b>?
                            </span>
                        }
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
                        content={
                            <span>
                                Are you sure you want to <b>delete</b> collection <em>{collection.name}</em>?
                            </span>
                        }
                        dangerous
                        agreeButtonText="Delete"
                        onAgree={() => this.handleCollectionDelete(this.props.collection)}
                        onDisagree={this.handleCloseDelete}
                        onClose={this.handleCloseDelete}
                    />
                )}
                {unpublishing && (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={
                            <span>
                                <b>
                                    Warning: The action is not recommended! Collection (meta)data may already be
                                    referenced in other systems.
                                </b>
                                <br />
                                Are you sure you want to <b>unpublish</b> collection <em>{collection.name}</em>?<br />
                                Collection view mode will be changed to <em>Metadata published</em>.
                            </span>
                        }
                        dangerous
                        agreeButtonText="Unpublish"
                        onAgree={() => this.handleCollectionUnpublish(this.props.collection)}
                        onDisagree={this.handleCloseUnpublish}
                        onClose={this.handleCloseUnpublish}
                    />
                )}
            </>
        );
    }
}

const ContextualCollectionDetails = props => {
    const history = useHistory();
    const {users} = useContext(UsersContext);
    const {currentUser} = useContext(UserContext);
    const {deleteCollection, undeleteCollection, setStatus, setOwnedBy, unpublish} = useContext(CollectionsContext);
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
                        currentUser={currentUser}
                        workspaceRoles={workspaceRoles}
                        workspaces={workspaces}
                        history={history}
                        deleteCollection={deleteCollection}
                        undeleteCollection={undeleteCollection}
                        unpublish={unpublish}
                        setStatus={setStatus}
                        setOwnedBy={setOwnedBy}
                    />
                )}
            </WorkspaceUserRolesContext.Consumer>
        </WorkspaceUserRolesProvider>
    );
};

export default withRouter(withStyles(styles)(ContextualCollectionDetails));
