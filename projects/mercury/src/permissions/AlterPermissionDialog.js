import React from 'react';
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
import {AccessRights} from "../common/utils/permissionUtils";
import UserSelect from "./UserSelect";
import {hasAccess} from "../common/utils/userUtils";

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
            accessRight: 'Read',
            selectedUser: null,
            selectedUserLabel: ''
        };
    }

    resetState = () => {
        const {access, user} = this.props;
        this.setState({
            accessRight: access || 'Read',
            selectedUser: {iri: user},
            selectedUserLabel: ''
        });
    };

    handleAccessRightChange = (event) => {
        this.setState({accessRight: event.target.value});
    };

    handleSelectedUserChange = (selectedOption) => {
        this.setState({selectedUser: selectedOption});
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleOnEnter = () => {
        this.resetState();
    };

    handleSubmit = () => {
        const {selectedUser, accessRight} = this.state;
        const {iri, alterPermission} = this.props;
        if (selectedUser) {
            alterPermission(selectedUser.iri, iri, accessRight);
            this.handleClose();
        } else {
            this.setState({selectedUserLabel: 'You have to select a user'});
        }
    };

    /**
     * Get no options message based on users
     * @param users
     * @returns {string}
     */
    getNoOptionMessage = () => {
        const {loading, error} = this.props;

        if (loading) {
            return 'Loading ..';
        }

        if (error) {
            return 'Error: Cannot fetch users.';
        }

        return 'No options';
    };

    getName = iri => {
        const {users} = this.props;
        return users.find(u => u.iri === iri).name;
    };

    renderUser = () => {
        const {user, users, collaborators, currentUser} = this.props;
        const {selectedUser, selectedUserLabel} = this.state;

        // only render the label if user is passed into this component
        if (users && collaborators && user) {
            return (
                <div>
                    <Typography
                        variant="subtitle1"
                        gutterBottom
                        data-testid="user"
                    >
                        {this.getName(user)}
                    </Typography>
                </div>
            );
        }

        // otherwise render select user component
        return (
            <UserSelect
                onChange={this.handleSelectedUserChange}
                filter={u => hasAccess(u) && u.iri !== currentUser.iri && collaborators.find(c => c.user === u.iri) === undefined}
                placeholder="Please select a user"
                value={selectedUser}
                label={selectedUserLabel}
                autoFocus
            />
        );
    };

    render() {
        const {classes, user, open, loading, error} = this.props;
        const {selectedUser, accessRight} = this.state;

        return (
            <Dialog
                open={open}
                onEnter={this.handleOnEnter}
                onClose={this.handleClose}
                data-testid="permissions-dialog"
            >
                <DialogTitle id="scroll-dialog-title">Share with</DialogTitle>
                <DialogContent>
                    <div className={user ? classes.rootEdit : classes.root}>
                        {this.renderUser()}
                        <FormControl className={classes.formControl}>
                            <FormLabel component="legend">Access right</FormLabel>
                            <RadioGroup
                                aria-label="Access right"
                                name="access-right"
                                className={classes.group}
                                value={accessRight}
                                onChange={this.handleAccessRightChange}
                            >
                                {AccessRights.map(access => (
                                    <FormControlLabel
                                        key={access}
                                        value={access}
                                        control={<Radio />}
                                        Sparqlq
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
                        disabled={Boolean(!selectedUser || loading || error)}
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
    access: PropTypes.string,
    user: PropTypes.string,
    iri: PropTypes.string,
};

export default withStyles(styles)(AlterPermissionDialog);
