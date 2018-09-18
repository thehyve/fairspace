import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from "@material-ui/core/Avatar";
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';

const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 0,
        paddingBottom: 0
    },
    avatar: {
        margin: 10,
    }
};

class UserMenu extends React.Component {
    state = {
        anchorEl: null,
    };

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleLogout = () => {
        this.handleClose();
        this.props.onLogout();
    };

    render() {
        const { anchorEl } = this.state;

        return (
            <div>
                {this.renderUserButton()}
                <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="menu-list-grow"
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={this.handleClose}>
                                    <MenuList>
                                        <MenuItem onClick={this.handleClose} disabled>Profile</MenuItem>
                                        <MenuItem onClick={this.handleClose} disabled>My account</MenuItem>
                                        <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        );
    }

    renderUserButton() {
        const { pending, error, user } = this.props;

        if (pending) {
            return "Unknown";
        }
        if (error) {
            return "Error";
        }
        if (user) {
            return (
                <Button
                    aria-owns={this.state.anchorEl ? 'user-menu' : null}
                    aria-haspopup="true"
                    color="inherit"
                    onClick={this.handleClick}
                    className={this.props.classes.row}>
                    <Avatar alt="{data.username}" src="/images/avatar.png" className={this.props.classes.avatar}/>
                    <span>{user.username}</span>
                </Button>)
        }
    }
}

const mapStateToProps = ({account: { user }}) => {
    return {
        pending: user.pending,
        error: user.error,
        user: user.item
    }
}

export default connect(mapStateToProps)(withStyles(styles)(UserMenu));
