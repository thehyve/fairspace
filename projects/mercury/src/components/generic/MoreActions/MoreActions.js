import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import MoreActionsMenu from "./MoreActionsMenu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

class MoreActions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }

    handleClick = (event) => {
        if (this.props.onClick) {
            this.props.onClick(event);
        }
        this.setState({anchorEl: event.currentTarget})
    };

    handleMenuOnClose = () => {
        this.setState({anchorEl:null});
    };

    /**
     * Wrapper around a menu item that ensures that the menu is closed
     * when clicking on the menuitem
     * @param menuItem
     */
    closeMenuOnClick = (menuItem, idx) =>
        <MenuItem key={idx} onClick={this.handleMenuOnClose}>
            {menuItem}
        </MenuItem>


    render() {
        const {ariaLabel, visibility} = this.props;
        return (
            <div>
                <IconButton aria-label={ariaLabel} style={{visibility: visibility}} onClick={this.handleClick}>
                    <MoreIcon/>
                </IconButton>
                <MoreActionsMenu
                    menuItems={this.props.children ? this.props.children.map(this.closeMenuOnClick) : undefined}
                    onClose={this.handleMenuOnClose}
                    anchorEl={this.state.anchorEl}/>
            </div>
        )
    }
}

MoreActions.defaultProps = {
    ariaLabel: 'More actions',
    visibility: 'visible'
};

MoreActions.propTypes = {
    ariaLabel: PropTypes.string,
    onClick: PropTypes.func,
    visibility: PropTypes.string,
};

export default MoreActions;
