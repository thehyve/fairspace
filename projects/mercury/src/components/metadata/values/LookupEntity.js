import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MaterialReactSelect from "../../common/MaterialReactSelect";
import {fetchEntitiesIfNeeded} from "../../../actions/metadataActions";
import {getLabel} from "../../../utils/metadataUtils";

function LookupEntity({
    entities, property, onSave, dispatch, ...otherProps
}) {
    // Ensure that the entities for lookup have been retrieved
    dispatch(fetchEntitiesIfNeeded(property.range));

    // Transform the entities to ensure a label is present
    const options = entities.map((entity) => {
        const id = entity['@id'];
        const label = getLabel(entity);

        const option = {
            disabled: property.values.some(v => v.id === id),
            id,
            label
        };

        return option;
    });

    options.sort((a, b) => {
        if (a.disabled > b.disabled) {
            return 1;
        } if (a.disabled < b.disabled) {
            return -1;
        } return 0;
    });

    // Prevent saving any labels used for UI
    const handleSave = (selected) => {
        onSave({id: selected.id, label: selected.label});
    };

    return (
        <MaterialReactSelect
            style={{width: '100%'}}
            {...otherProps}
            options={options}
            onChange={handleSave}
        />
    );
}

LookupEntity.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onSave: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    if (state.cache && state.cache.entitiesByType) {
        const entities = state.cache.entitiesByType[ownProps.property.range];
        if (entities && entities.data && !entities.pending && !entities.error) {
            return {entities: entities.data};
        }
    }

    return {entities: []};
};

export default connect(mapStateToProps)(LookupEntity);
