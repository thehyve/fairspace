import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import MoreActionsMenu from "./MoreActionsMenu";

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

    render() {
        const {ariaLabel, className} = this.props;
        return (
            <div>
                <IconButton aria-label={ariaLabel}
                            className={className}
                            onClick={this.handleClick}>
                    <MoreIcon/>
                </IconButton>
                <MoreActionsMenu
                    menuItems={this.props.children}
                    onClose={this.handleMenuOnClose}
                    anchorEl={this.state.anchorEl}/>
            </div>
        )
    }
}

MoreActions.propTypes = {
    onClick: PropTypes.func,
};

export default MoreActions;
