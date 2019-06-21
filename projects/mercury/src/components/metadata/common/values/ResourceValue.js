import React from 'react';
import PropTypes from 'prop-types';
import IriValueContainer, {noNamespace} from "./IriValueContainer";

class ResourceValue extends React.Component {
    state = {
        namespace: noNamespace
    };

    handleLocalPartChange = (value) => this.props.onChange({id: this.state.namespace.value + value});

    handleNamespaceChange = namespace => this.setState({namespace});

    render() {
        const {entry, onChange, ...otherProps} = this.props;

        return (
            <IriValueContainer
                namespace={this.state.namespace}
                localPart={entry.id || ''}
                onLocalPartChange={this.handleLocalPartChange}
                onNamespaceChange={this.handleNamespaceChange}
                {...otherProps}
            />
        );
    }
}

ResourceValue.propTypes = {
    entry: PropTypes.object,
    onChange: PropTypes.func
};

ResourceValue.defaultProps = {
    entry: {},
};

export default ResourceValue;
