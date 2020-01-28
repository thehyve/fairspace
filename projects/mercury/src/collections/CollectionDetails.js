// @flow
import React, {useContext} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    Typography
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {withRouter, useHistory} from 'react-router-dom';
import {ConfirmationDialog, ErrorDialog, LoadingInlay} from '../common';

import CollectionEditor from "./CollectionEditor";
import PermissionContext, {PermissionProvider} from "../common/contexts/PermissionContext";
import PermissionsCard from "../permissions/PermissionsCard";
import TechnicalMetadata from "../file/TechnicalMetadata";
import type {Collection, Resource} from './CollectionAPI';
import CollectionsContext from '../common/contexts/CollectionsContext';
import {projectPrefix} from '../projects/projects';
import type {History} from '../types';
import type {AuditInfo} from '../file/TechnicalMetadata';
import UsersContext from '../common/contexts/UsersContext';
import getDisplayName from '../common/utils/userUtils';

export const ICONS = {
    LOCAL_STORAGE: 'folder_open',
    AZURE_BLOB_STORAGE: 'cloud_open',
    S3_BUCKET: 'cloud_open',
    GOOGLE_CLOUD_BUCKET: 'cloud_open'
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

type CollectionDetailsProps = {
    loading: boolean;
    collection: Collection;
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
        deleting: false
    };

    handleEdit = () => {
        if (this.props.collection.canManage) {
            this.setState({editing: true});
            this.handleMenuClose();
        }
    };

    handleDelete = () => {
        if (this.props.collection.canManage) {
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
            .then(() => history.push(`${projectPrefix()}/collections`))
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

    collectionMetadata(): AuditInfo {
        const {collection} = this.props;
        return {
            dateCreated: collection.dateCreated,
            createdBy: collection.createdBy ? this.getUsernameByIri(collection.createdBy) : collection.createdBy,
            dateModified: collection.dateModified,
            modifiedBy: collection.modifiedBy ? this.getUsernameByIri(collection.modifiedBy) : collection.modifiedBy
        };
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
                        action={!collection.canManage ? null : (
                            <>
                                <IconButton
                                    aria-label="More"
                                    aria-owns={anchorEl ? 'long-menu' : undefined}
                                    aria-haspopup="true"
                                    onClick={this.handleMenuClick}
                                >
                                    <MoreVertIcon />
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
                        avatar={(
                            <Icon>
                                {ICONS[iconName]}
                            </Icon>
                        )}
                    />
                    <CardContent style={{paddingTop: 0}}>
                        <Typography component="p">
                            {collection.description}
                        </Typography>

                        <TechnicalMetadata fileProps={this.collectionMetadata()} />
                    </CardContent>
                </Card>

                <PermissionProvider iri={collection.iri}>
                    <PermissionContext.Consumer>
                        {({permissions}) => (
                            <PermissionsCard
                                permissions={permissions}
                                iri={collection.iri}
                                canManage={collection.canManage}
                            />
                        )}
                    </PermissionContext.Consumer>
                </PermissionProvider>

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
            </>
        );
    }
}

const ContextualCollectionDetails = (props) => {
    const history = useHistory();
    const {users} = useContext(UsersContext);
    const {deleteCollection} = useContext(CollectionsContext);

    return (
        <CollectionDetails
            {...props}
            users={users}
            history={history}
            deleteCollection={deleteCollection}
        />
    );
};

export default withRouter(ContextualCollectionDetails);
