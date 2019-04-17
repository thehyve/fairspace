import React from 'react';
import PropTypes from 'prop-types';

import Dropdown from "./Dropdown";
import LoadingInlay from "../../../common/LoadingInlay";
import ErrorMessage from "../../../common/ErrorMessage";

class EntityDropdown extends React.Component {
    constructor(props) {
        super(props);
        props.fetchEntities(props.property.className);
    }

    render() {
        if (this.props.pending) {
            return <LoadingInlay />;
        }

        if (this.props.error) {
            return <ErrorMessage message={this.props.error} />;
        }

        return (
            <Dropdown {...this.props} />
        );
    }
}

EntityDropdown.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onChange: PropTypes.func,
    fetchEntities: PropTypes.func.isRequired,

    entities: PropTypes.array,
    pending: PropTypes.bool,
    error: PropTypes.string
};

export default EntityDropdown;
