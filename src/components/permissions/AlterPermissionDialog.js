import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {withStyles} from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import MaterialReactSelect from '../generic/MaterialReactSelect/MaterialReactSelect'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';

export const styles = theme => ({
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
 * @param currentLoggedUser
 * @returns {*}
 */
const applyDisableFilter = (options, collaborators, currentLoggedUser) => {
    return options.map(option => {
        const isAlreadySelected = collaborators.find(c => c.subject === option.value) !== undefined;
        const isCurrentUser = option.value === currentLoggedUser.id;
        option.disabled = isAlreadySelected || isCurrentUser;
        return option;
    });
};

/**
 * Get user label by user object
 * @param user
 * @param options
 * @returns {string}
 */
const getUserLabelByUser = (user, options) => {
    let label = '';
    if (options) {
        const found = options.find(option => option.value === user.subject);
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
    if (users.data) {
        const tmp = users.data.map(r => {
            return {
                label: `${r.firstName} ${r.lastName}`,
                value: r.id
            };
        });
        return applyDisableFilter(tmp, collaborators, currentUser);
    }
};

/**
 * Get no options message based on users
 * @param users
 * @returns {string}
 */
const getNoOptionMessage = (users) => {
    let noOptionMessage = 'No options';
    if (users) {
        if (users.pending) {
            noOptionMessage = 'Loading ..';
        } else if (users.error) {
            noOptionMessage = 'Error: Cannot fetch users.';
        }
    }
    return noOptionMessage;
};

/**
 * Convert user to option value
 * @param user
 * @returns {{value}}
 */
const convertUserToOptionValue = (user) => {
    return user ? {value: user.subject} : null;
};

const AccessRights = {
    Read: 'Read',
    Write: 'Write',
    Manage: 'Manage',
};

export class AlterPermissionDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accessRight: 'Read',
            selectedUser: null,
            selectedUserLabel: '',
            error: null,
        };
    }

    resetState = () => {
        const {user} = this.props;
        this.setState({
            accessRight: user ? user.access : 'Read',
            selectedUser: user ? convertUserToOptionValue(user) : null,
            selectedUserLabel: '',
            error: null,
        });
    };

    componentDidMount() {
        this.props.fetchUsers();
    }

    handleAccessRightChange = event => {
        this.setState({accessRight: event.target.value});
    };

    handleSelectedUserChange = selectedOption => {
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
        const {collectionId, alterPermission} = this.props;
        if (selectedUser) {
            alterPermission(selectedUser.value, collectionId, accessRight);
            this.handleClose();
        } else {
            this.setState({selectedUserLabel: 'You have to select a user'});
        }
    };

    renderUser = () => {
        const {user, users, collaborators, currentLoggedUser} = this.props;
        const {selectedUser, selectedUserLabel} = this.state;
        let options = [];

        if (users.data) {
            options = transformUserToOptions(users, collaborators, currentLoggedUser);
            if (user) { // only render the label if user is passed into this component
                return (<div>
                    <Typography variant="subheading"
                                gutterBottom>{getUserLabelByUser(user, options)}</Typography>
                </div>)
            }
        }

        // otherwise render select user component
        return (<MaterialReactSelect options={options}
                                     onChange={this.handleSelectedUserChange}
                                     placeholder={'Please select a user'}
                                     value={selectedUser}
                                     noOptionsMessage={() => (getNoOptionMessage(users))}
                                     label={selectedUserLabel}/>);
    };

    render() {
        const {classes, user} = this.props;
        const {selectedUser, accessRight} = this.state;

        return (
            <Dialog open={this.props.open} onEnter={this.handleOnEnter} onClose={this.handleClose}>
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
                                onChange={this.handleAccessRightChange}>
                                {Object.keys(AccessRights).map(access => {
                                    return <FormControlLabel key={access} value={access} control={<Radio/>}
                                                             label={AccessRights[access]}/>
                                })}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleSubmit} color="primary" disabled={!selectedUser}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

AlterPermissionDialog.propTypes = {
    classes: PropTypes.func.isRequired,
    theme: PropTypes.object,
    user: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    collectionId: PropTypes.number,
    collaborators: PropTypes.array,
};

export default withStyles(styles, {withTheme: true})(AlterPermissionDialog);
