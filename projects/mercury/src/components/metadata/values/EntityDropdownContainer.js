import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Dropdown from "./Dropdown";
import * as metadataActions from "../../../actions/metadataActions";
import LoadingInlay from "../../common/LoadingInlay";
import ErrorMessage from "../../common/ErrorMessage";

class EntityDropdownContainer extends React.Component {
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

EntityDropdownContainer.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onChange: PropTypes.func,
    fetchEntities: PropTypes.func.isRequired,

    entities: PropTypes.array,
    pending: PropTypes.bool,
    error: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
    const {cache: {entitiesByType}} = state;
    const dropdownOptions = entitiesByType[ownProps.property.className];
    const pending = !dropdownOptions || dropdownOptions.pending;
    const error = (dropdownOptions && dropdownOptions.error) || '';

    const entities = (!pending && !error) ? dropdownOptions.data : [];

    return {
        pending,
        error,
        entities,
    };
};

const mapDispatchToProps = ({
    fetchEntities: metadataActions.fetchEntitiesIfNeeded
});

export default connect(mapStateToProps, mapDispatchToProps)(EntityDropdownContainer);
