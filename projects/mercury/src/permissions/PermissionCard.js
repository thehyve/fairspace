import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {Avatar, Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import classnames from "classnames";

import LockOpen from "@material-ui/icons/LockOpen";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import PermissionViewer from "./PermissionViewer";
import {getAccessModeDescription, getPrincipalsWithCollectionAccess} from "./permissionUtils";
import {camelCaseToWords} from "../common/utils/genericUtils";
import CollectionsContext from "../collections/CollectionsContext";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import ErrorDialog from "../common/components/ErrorDialog";

const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    permissionsCard: {
        marginTop: 10
    },
    avatar: {
        width: 20,
        height: 20,
        display: 'inline-block',
        verticalAlign: 'middle',
        margin: '0 4px'
    },
    additionalCollaborators: {
        display: 'inline-block',
        lineHeight: '20px',
        verticalAlign: 'middle',
        margin: '0 4px'
    },
    propertyLabel: {
        margin: 'auto',
        width: '50%'
    },
    propertyText: {
        marginTop: 2,
        marginBottom: 0,
        marginInlineStart: 4,
        width: '100%'
    },
    propertyDiv: {
        marginLeft: 32,
        marginRight: 32,
        marginBottom: 16
    }
});

export const PermissionCard = ({classes, collection, users, workspaceUsers, workspaces, maxCollaboratorIcons = 5, setBusy}) => {
    const [expanded, setExpanded] = useState(false);
    const [changingAccessMode, setChangingAccessMode] = useState(false);
    const [selectedAccessMode, setSelectedAccessMode] = useState(collection.accessMode);
    const {setAccessMode} = useContext(CollectionsContext);

    const toggleExpand = () => setExpanded(!expanded);
    const collaboratingUsers = getPrincipalsWithCollectionAccess(users, collection.userPermissions, 'User');
    const collaboratingWorkspaces = getPrincipalsWithCollectionAccess(workspaces, collection.workspacePermissions, 'Workspace');
    const allCollaborators = [...collaboratingWorkspaces, ...collaboratingUsers];

    const handleSetAccessMode = (event) => {
        if (collection.canManage) {
            setSelectedAccessMode(event.target.value);
            setChangingAccessMode(true);
        }
    };

    const handleCancelSetAccessMode = () => {
        setChangingAccessMode(false);
    };

    const handleConfirmSetAccessMode = () => {
        setBusy(true);
        setAccessMode(collection.location, selectedAccessMode)
            .then(handleCancelSetAccessMode)
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                () => handleConfirmSetAccessMode()
            ))
            .finally(setBusy(false));
    };

    const permissionIcons = allCollaborators
        .slice(0, maxCollaboratorIcons)
        .map(({iri, name}) => (
            <Avatar
                key={iri}
                title={name}
                src="/public/images/avatar.png"
                className={classes.avatar}
            />
        ));

    const cardHeaderAction = (
        <>
            {permissionIcons}
            {allCollaborators.length > maxCollaboratorIcons ? (
                <div className={classes.additionalCollaborators}>
                    + {allCollaborators.length - maxCollaboratorIcons}
                </div>
            ) : ''}
            <IconButton
                className={classnames(classes.expand, {
                    [classes.expandOpen]: expanded,
                })}
                onClick={toggleExpand}
                aria-expanded={expanded}
                aria-label="Show more"
                title="Access"
            >
                <ExpandMore />
            </IconButton>
        </>
    );

    const renderAccessModeChangeConfirmation = () => (
        <ConfirmationDialog
            open
            title="Confirmation"
            content={`Are you sure you want to change the access mode of ${collection.name} to ${selectedAccessMode}?`}
            dangerous
            agreeButtonText="Confirm"
            onAgree={handleConfirmSetAccessMode}
            onDisagree={handleCancelSetAccessMode}
            onClose={handleCancelSetAccessMode}
        />
    );

    const renderAccessMode = () => (
        <div className={classes.propertyDiv}>
            <FormControl className={classes.propertyText}>
                <InputLabel id="demo-simple-select-helper-label">Access mode</InputLabel>
                <Select
                    value={collection.accessMode}
                    onChange={mode => handleSetAccessMode(mode)}
                    inputProps={{'aria-label': 'Access mode'}}
                    disabled={!collection.canManage}
                >
                    {collection.availableAccessModes.map(mode => (
                        <MenuItem key={mode} value={mode}>
                            {camelCaseToWords(mode)}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{getAccessModeDescription(collection.accessMode)}</FormHelperText>
            </FormControl>
        </div>
    );

    return (
        <Card classes={{root: classes.permissionsCard}}>
            <CardHeader
                action={cardHeaderAction}
                titleTypographyProps={{variant: 'h6'}}
                title="Access"
                avatar={(
                    <LockOpen />
                )}
                subheader="Share the collection with users and workspaces."
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>
                    {renderAccessMode()}
                    <PermissionViewer
                        collection={collection}
                        users={users}
                        collaborators={allCollaborators}
                        workspaces={workspaces}
                        workspaceUsers={workspaceUsers}
                    />
                </CardContent>
                {changingAccessMode && renderAccessModeChangeConfirmation()}
            </Collapse>
        </Card>
    );
};

PermissionCard.propTypes = {
    classes: PropTypes.object,
    collection: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    workspaceUsers: PropTypes.array.isRequired,
    workspaces: PropTypes.array.isRequired,
    maxCollaboratorIcons: PropTypes.number,
    setBusy: PropTypes.func
};

export default withStyles(styles)(PermissionCard);
