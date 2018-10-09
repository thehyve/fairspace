import React from 'react';
import './Footer.css';
import {connect} from 'react-redux';

export class Footer extends React.Component {

    render() {
        return (
            <div className={'footer'}>{this.props.workspaceName} {this.props.workspaceVersion}</div>
        )
    };
}

function mapStateToProps(state) {
    return {
        workspaceName: state.workspace.name,
        workspaceVersion: state.workspace.version
    };
}

export default connect(mapStateToProps)(Footer);


