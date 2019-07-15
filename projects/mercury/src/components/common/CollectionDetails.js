import React from 'react';
import {Card, CardContent, CardHeader, Icon, IconButton, Menu, MenuItem, Typography} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import LoadingInlay from './LoadingInlay';
import CollectionEditor from "./CollectionEditor";
import ConfirmationDialog from './ConfirmationDialog';
import {PermissionProvider} from "../permissions/PermissionContext";
import PermissionsCard from "../permissions/PermissionsCard";
import TechnicalMetadata from "../metadata/metadata/TechnicalMetadata";

export const ICONS = {
    LOCAL_STORAGE: 'folder_open',
    AZURE_BLOB_STORAGE: 'cloud_open',
    S3_BUCKET: 'cloud_open',
    GOOGLE_CLOUD_BUCKET: 'cloud_open'
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

class CollectionDetails extends React.Component {
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
    }

    handleDelete = () => {
        if (this.props.collection.canManage) {
            this.setState({deleting: true});
            this.handleMenuClose();
        }
    }

    handleCloseDelete = () => {
        this.setState({deleting: false});
    }

    handleMenuClick = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    };

    handleSave = (name, description, location) => {
        this.props.onUpdateCollection(name, description, location);
        this.setState({editing: false});
    }

    render() {
        const {loading, collection} = this.props;
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
                                        Rename
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
                    <CardContent>
                        <Typography component="p">
                            {collection.description}
                        </Typography>

                        {this.props.collectionProps ? <TechnicalMetadata fileProps={this.props.collectionProps} /> : undefined }
                    </CardContent>
                </Card>

                <PermissionProvider iri={collection.iri}>
                    <PermissionsCard iri={collection.iri} canManage={collection.canManage} />
                </PermissionProvider>

                {editing ? (
                    <CollectionEditor
                        name={collection.name}
                        description={collection.description}
                        location={collection.location}
                        title={`Edit ${collection.name}`}
                        connectionString={collection.connectionString}
                        onSave={this.handleSave}
                        onClose={() => this.setState({editing: false})}
                    />
                ) : null}
                {deleting ? (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={`Delete ${collection.name}`}
                        onAgree={() => this.props.onCollectionDelete(this.props.collection)}
                        onDisagree={this.handleCloseDelete}
                        onClose={this.handleCloseDelete}
                    />
                ) : null}
            </>
        );
    }
}

export default CollectionDetails;
