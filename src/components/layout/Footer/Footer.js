import React from 'react';
import {connect} from 'react-redux';
import styles from './Footer.styles';
import {withStyles} from '@material-ui/core/styles';

export class Footer extends React.Component {

    render() {
        return (
            <div className={this.props.classes.footer}>{this.props.name} {this.props.version}</div>
        )
    };
}

function mapStateToProps(state) {
    const data = state.workspace.data;
    return {
        name: data ? data.name : '',
        version: data ? data.version : ''
    };
}

export default connect(mapStateToProps)(withStyles(styles)(Footer));


