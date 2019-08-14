import React from 'react';
import PropTypes from 'prop-types';
import IriValueContainer from "./IriValueContainer";

class ResourceValue extends React.Component {
    state = {
        namespace: undefined
    };

    handleLocalPartChange = (value) => this.props.onChange({
        id: this.state.namespace ? this.state.namespace.value + value : value
    });

    handleNamespaceChange = namespace => this.setState({namespace});

    render() {
        const {entry, onChange, onBlur, ...otherProps} = this.props;

        return (
            <IriValueContainer
                namespace={this.state.namespace}
                localPart={entry.id || ''}
                onLocalPartChange={this.handleLocalPartChange}
                onNamespaceChange={this.handleNamespaceChange}
                onBlur={() => onBlur(this.state.namespace)}
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
