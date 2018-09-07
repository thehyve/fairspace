import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from "@material-ui/core/Avatar";
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import FetchUsername from "../../../backend/FetchUsername/FetchUsername";

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

    constructor(props) {
        super(props);
        this.classes = props.classes;
        this.props = props;
    }

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
                <FetchUsername>
                    {({isFetching, data, error}) => {
                        if (isFetching) {
                            return "Unknown";
                        }
                        if (data) {
                            return (
                                <Button
                                        aria-owns={anchorEl ? 'user-menu' : null}
                                        aria-haspopup="true"
                                        color="inherit"
                                        onClick={this.handleClick}
                                        className={this.classes.row}>
                                    <Avatar alt="{data.username}" src="/images/avatar.png" className={this.classes.avatar}/>
                                    <span>{data.username}</span>
                                </Button>)
                        }
                        if (error) {
                            return "Error";
                        }
                    }}
                </FetchUsername>
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
}

export default withStyles(styles)(UserMenu)
