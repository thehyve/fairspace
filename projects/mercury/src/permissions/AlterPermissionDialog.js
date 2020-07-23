import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {withStyles} from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import {AccessRights} from "./permissionUtils";
import PermissionCandidateSelect from "./PermissionCandidateSelect";
import CollectionsContext from "../collections/CollectionsContext";

export const styles = {
    root: {
        width: 400,
        height: 350,
        display: 'block',
    },
    rootEdit: {
        width: 400,
        display: 'block',
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
            accessRight: 'List',
            selectedPrincipal: null,
            selectedPrincipalLabel: ''
        };
    }

    resetState = () => {
        const {access, principal} = this.props;
        this.setState({
            accessRight: (access && access !== 'None') ? access : 'List',
            selectedPrincipal: principal,
            selectedPrincipalLabel: ''
        });
    };

    handleAccessRightChange = (event) => {
        this.setState({accessRight: event.target.value});
    };

    handleSelectedUserChange = (selectedOption) => {
        this.setState({selectedPrincipal: selectedOption});
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleOnEnter = () => {
        this.resetState();
    };

    handleSubmit = () => {
        const {selectedPrincipal, accessRight} = this.state;
        const {collection, setPermission} = this.props;
        if (selectedPrincipal) {
            setPermission(collection.location, selectedPrincipal.iri, accessRight);
            this.handleClose();
        } else {
            this.setState({selectedPrincipalLabel: 'You have to select one option'});
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

    renderPermission = () => {
        const {principal, permissionCandidates, permissions, currentUser} = this.props;
        const {selectedPrincipal, selectedPrincipalLabel} = this.state;

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
                onChange={this.handleSelectedUserChange}
                filter={p => (!currentUser || p.iri !== currentUser.iri)
                    && !permissions.some(c => c.iri === p.iri)}
                placeholder="Please select one option"
                value={selectedPrincipal}
                label={selectedPrincipalLabel}
                autoFocus
            />
        );
    };

    render() {
        const {classes, principal, open, loading, error, title} = this.props;
        const {selectedPrincipal, accessRight} = this.state;
        const accessRights = this.props.accessRights || AccessRights;

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
                        {this.renderPermission()}
                        <FormControl className={classes.formControl}>
                            <FormLabel component="legend">Access right</FormLabel>
                            <RadioGroup
                                aria-label="Access right"
                                name="access-right"
                                className={classes.group}
                                value={accessRight}
                                onChange={this.handleAccessRightChange}
                            >
                                {accessRights.map(access => (
                                    <FormControlLabel
                                        key={access}
                                        value={access}
                                        control={<Radio />}
                                        label={access}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={Boolean(!selectedPrincipal || loading || error)}
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
    accessRights: PropTypes.array
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
