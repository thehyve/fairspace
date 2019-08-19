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

import MaterialReactSelect from '../common/components/MaterialReactSelect';
import getDisplayName from "../common/utils/userUtils";
import {AccessRights} from "../common/utils/permissionUtils";

export const styles = () => ({
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
});

/**
 * Disable options if a user is :
 *  - already a collaborator,
 *  - current logged user, or
 *  - owner of the collection
 * @param options
 * @param collaborators
 * @param currentUser
 * @returns {*}
 */
const applyDisableFilter = (options, collaborators, currentUser) => options.map((option) => {
    const isAlreadySelected = collaborators.find(c => c.user === option.value) !== undefined;
    const isCurrentUser = option.value === currentUser.iri;
    option.disabled = isAlreadySelected || isCurrentUser;
    return option;
});

/**
 * Get user label by user object
 * @param user
 * @param options
 * @returns {string}
 */
const getUserLabelByUser = (user, options) => {
    let label = '';
    if (options) {
        const found = options.find(option => option.value === user);
        label = found && found.label;
    }
    return label;
};

/**
 * Transform result to become react-select friendly array [{label: string, value: string}]
 * @param users
 * @returns {Array}
 */
const transformUserToOptions = (users, collaborators, currentUser) => {
    const tmp = users.map(r => ({
        label: getDisplayName(r),
        value: r.iri
    }));
    return applyDisableFilter(tmp, collaborators, currentUser);
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
            selectedUser: {value: user},
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
            alterPermission(selectedUser.value, iri, accessRight);
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

    renderUser = () => {
        const {user, users, collaborators, currentUser} = this.props;
        const {selectedUser, selectedUserLabel} = this.state;

        let options = [];

        if (users && collaborators) {
            options = transformUserToOptions(users, collaborators, currentUser);
            if (user) { // only render the label if user is passed into this component
                return (
                    <div>
                        <Typography
                            variant="subtitle1"
                            gutterBottom
                        >
                            {getUserLabelByUser(user, options)}
                        </Typography>
                    </div>
                );
            }
        }

        // otherwise render select user component
        return (
            <MaterialReactSelect
                options={options}
                onChange={this.handleSelectedUserChange}
                placeholder="Please select a user"
                value={selectedUser}
                noOptionsMessage={this.getNoOptionMessage}
                label={selectedUserLabel}
            />
        );
    };

    render() {
        const {classes, user, open, loading, error} = this.props;
        const {selectedUser, accessRight} = this.state;

        return (
            <Dialog open={open} onEnter={this.handleOnEnter} onClose={this.handleClose}>
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
                                        label={access}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.handleClose}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={!selectedUser || loading || error}
                    >
                        Submit
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

export default withStyles(styles, {withTheme: true})(AlterPermissionDialog);
