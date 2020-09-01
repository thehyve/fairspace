// @flow
import React, {useContext} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    withStyles
} from '@material-ui/core';
import {CloudDownload, FolderOpen, MoreVert} from '@material-ui/icons';
import {useHistory, withRouter} from 'react-router-dom';

import FormHelperText from "@material-ui/core/FormHelperText";
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
import {camelCaseToWords} from "../common/utils/genericUtils";
import CollectionStatusChangeDialog from "./CollectionStatusChangeDialog";
import CollectionOwnerChangeDialog from "./CollectionOwnerChangeDialog";
import {getStatusDescription} from "./collectionUtils";

export const ICONS = {
    LOCAL_STORAGE: <FolderOpen aria-label="Local storage" />,
    AZURE_BLOB_STORAGE: <CloudDownload />,
    S3_BUCKET: <CloudDownload />,
    GOOGLE_CLOUD_BUCKET: <CloudDownload />
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

const styles = {
    propertyLabel: {
        color: 'gray'
    },
    propertyText: {
        marginTop: 2,
        marginBottom: 0,
        marginInlineStart: 4
    },
    propertyDetails: {
        marginLeft: 8
    }
};

type CollectionDetailsProps = {
    loading: boolean;
    collection: Collection;
    workspaces: Array<Workspace>;
    inCollectionsBrowser: boolean;
    deleteCollection: (Resource) => Promise<void>;
    undeleteCollection: (Resource) => Promise<void>;
    setStatus: (location: string, status: Status) => Promise<void>;
    setOwnedBy: (location: string, owner: string) => Promise<void>;
    setBusy: (boolean) => void;
    history: History;
    classes: any;
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

    renderCollectionProperty = (property: string, value: string, helperValue: string = null) => (
        <Grid container direction="row">
            <Grid item xs={2}>
                <p className={`${this.props.classes.propertyLabel} ${this.props.classes.propertyText}`}>
                    {property}:
                </p>
            </Grid>
            <Grid item xs={10}>
                <p className={this.props.classes.propertyText}>
                    {camelCaseToWords(value)}
                </p>
                {helperValue && (
                    <FormHelperText>{helperValue}</FormHelperText>
                )}
            </Grid>
        </Grid>
    );

    renderCollectionDescription = () => (
        <Typography component="p" className={this.props.classes.propertyText}>
            {this.props.collection.description}
        </Typography>
    );

    renderCollectionStatus = () => (
        this.props.collection.status
        && this.renderCollectionProperty('Status', this.props.collection.status, getStatusDescription(this.props.collection.status))
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

        const menuItems = [];
        if (!collection.dateDeleted) {
            if (collection.canWrite) {
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
                    <MenuItem key="status" onClick={this.handleChangeStatus}>
                        Change status &hellip;
                    </MenuItem>
                ]);
            }
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
                        action={menuItems && (
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
                        {this.renderCollectionDescription()}
                        {this.renderCollectionStatus()}
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
                        setOwnedBy={this.props.setOwnedBy}
                        onClose={() => this.setState({changingOwner: false})}
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

export default withRouter(withStyles(styles)(ContextualCollectionDetails));
