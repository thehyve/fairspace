import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {AccessRights} from "./permissionUtils";
import PermissionCandidateSelect from "./PermissionCandidateSelect";
import CollectionsContext from "../collections/CollectionsContext";
import Dropdown from "../metadata/common/values/Dropdown";
import type {Access} from "../collections/CollectionAPI";

export const styles = {
    root: {
        width: 400,
        height: 150,
        display: 'block',
    },
    rootEdit: {
        width: 400,
        display: 'block',
        paddingBottom: 40
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        marginTop: 20,
    },
    autocomplete: {
        width: '100%'
    },
};

export class AlterPermissionDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedAccessRight: null,
            selectedPrincipal: null
        };
    }

    resetState = () => {
        const {access, principal} = this.props;
        this.setState({
            selectedAccessRight: (access && access !== 'None') ? access : null,
            selectedPrincipal: principal
        });
    };

    handleAccessRightChange = (selectedOption) => {
        this.setState({selectedAccessRight: selectedOption ? selectedOption.label : null});
    };

    handleSelectedPrincipalChange = (selectedOption) => {
        this.setState({selectedPrincipal: selectedOption});
        this.handleAccessRightChange(null);
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleOnEnter = () => {
        this.resetState();
    };

    handleSubmit = () => {
        const {selectedPrincipal, selectedAccessRight} = this.state;
        const {collection, setPermission} = this.props;
        if (selectedPrincipal && selectedAccessRight) {
            setPermission(collection.location, selectedPrincipal.iri, selectedAccessRight);
            this.handleClose();
        }
    };

    getNoOptionMessage = () => {
        const {loading, error} = this.props;

        if (loading) {
            return 'Loading ..';
        }

        if (error) {
            return 'Error accessing the server. Try again later.';
        }

        return 'No options';
    };

    getAccessRightsForPrincipal: Access[] = () => {
        const {selectedPrincipal} = this.state;
        const {collection, workspaceUsers} = this.props;
        if (!selectedPrincipal
            || (selectedPrincipal.type === 'User' && workspaceUsers.some(wu => wu.iri === selectedPrincipal.iri))
            || (selectedPrincipal.type === 'Workspace' && selectedPrincipal.iri === collection.ownerWorkspace)) {
            return AccessRights;
        }
        return ['Read'];
    };

    renderAccessRightControl = () => {
        const {classes} = this.props;
        const accessRights = this.getAccessRightsForPrincipal();
        const options = accessRights.map(access => ({label: access}));

        return (
            <Dropdown
                data-testid="access-right-change-dropdown"
                options={options}
                clearTextOnSelection={false}
                onChange={this.handleAccessRightChange}
                label="Select access right"
                className={classes.formControl}
            />
        );
    };

    renderPermissionControl = () => {
        const {principal, permissionCandidates, permissions, currentUser} = this.props;
        const {selectedPrincipal} = this.state;

        // only render the label if principal is passed into this component
        if (principal) {
            return (
                <div>
                    <Typography
                        variant="subtitle1"
                        gutterBottom
                        data-testid="principal"
                    >
                        {principal.name}
                    </Typography>
                </div>
            );
        }

        // otherwise render select permission candidates component
        return (
            <PermissionCandidateSelect
                permissionCandidates={permissionCandidates}
                onChange={this.handleSelectedPrincipalChange}
                filter={p => (!currentUser || p.iri !== currentUser.iri)
                    && !permissions.some(c => c.iri === p.iri)}
                value={selectedPrincipal}
                label="Select user or workspace"
                autoFocus
            />
        );
    };

    render() {
        const {classes, principal, open, loading, error, title} = this.props;
        const {selectedPrincipal, selectedAccessRight} = this.state;

        return (
            <Dialog
                open={open}
                onEnter={this.handleOnEnter}
                onClose={this.handleClose}
                data-testid="permissions-dialog"
            >
                <DialogTitle id="scroll-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <div className={principal ? classes.rootEdit : classes.root}>
                        {this.renderPermissionControl()}
                        {this.renderAccessRightControl()}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={Boolean(!selectedPrincipal || !selectedAccessRight || loading || error)}
                        data-testid="submit"
                    >
                        Save
                    </Button>
                    <Button
                        onClick={this.handleClose}
                        color="default"
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

AlterPermissionDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    title: PropTypes.string,
    access: PropTypes.string,
    principal: PropTypes.object,
    collection: PropTypes.object,
    permissionCandidates: PropTypes.array,
    permissions: PropTypes.array,
    workspaceUsers: PropTypes.array
};

const ContextualAlterPermissionDialog = props => {
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <AlterPermissionDialog
            {...props}
            setPermission={setPermission}
            loading={loading}
            error={error}
        />
    );
};

export default withStyles(styles)(ContextualAlterPermissionDialog);
