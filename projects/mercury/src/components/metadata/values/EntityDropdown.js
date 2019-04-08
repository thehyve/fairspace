import React from 'react';
import {connect} from 'react-redux';
import Dropdown from "./Dropdown";
import {fetchEntitiesIfNeeded} from "../../../actions/metadataActions";

function EntityDropdown(props) {
    props.fetchEntitiesIfNeeded(props.property.className);

    return <Dropdown {...props} />;
}

const mapStateToProps = (state, ownProps) => {
    if (state.cache && state.cache.entitiesByType && ownProps.property.className) {
        const entities = state.cache.entitiesByType[ownProps.property.className];
        if (entities && entities.data && !entities.pending && !entities.error) {
            return {entities: entities.data};
        }
    }

    return {entities: []};
};

const mapDispatchToProps = {
    fetchEntitiesIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(EntityDropdown);
