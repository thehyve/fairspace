import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from "@material-ui/core/Avatar";
import { withStyles } from '@material-ui/core/styles';
import FetchUsername from "../../backend/FetchUsername/FetchUsername";

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

    handleClick(event) {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose() {
        this.setState({ anchorEl: null });
    };

    handleLogout() {
        this.handleClose();
        this.props.onLogout();
    }

    render() {
        const { anchorEl } = this.state;

        return (
            <div>
                <FetchUsername>
                    {({fetching, data, error}) => {
                        if (fetching) {
                            return "Unknown";
                        }
                        if (data) {
                            return (
                                <Button
                                        aria-owns={anchorEl ? 'user-menu' : null}
                                        aria-haspopup="true"
                                        color="inherit"
                                        onClick={this.handleClick.bind(this)}
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
                <Menu
                    id="user-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose.bind(this)}
                >
                    <MenuItem onClick={this.handleClose.bind(this)}>Profile</MenuItem>
                    <MenuItem onClick={this.handleLogout.bind(this)}>Logout</MenuItem>
                </Menu>
            </div>
        );
    }
}

export default withStyles(styles)(UserMenu);