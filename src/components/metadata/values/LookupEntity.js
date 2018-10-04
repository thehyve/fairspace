import React from 'react';
import PropTypes from 'prop-types';
import MaterialReactSelect from "../../generic/MaterialReactSelect/MaterialReactSelect";
import {connect} from 'react-redux';
import {fetchEntitiesIfNeeded} from "../../../actions/metadata";
import {LABEL_URI} from "../../../services/MetadataAPI/MetadataAPI";

function LookupEntity({entities, property, onSave, dispatch}) {
    // Ensure that the entities for lookup have been retrieved
    dispatch(fetchEntitiesIfNeeded(property.range));

    // Transform the entities to ensure a label is present
    const options = entities.map(entity => {
        const id = entity['@id'];
        let label

        if(entity[LABEL_URI]) {
            label = entity[LABEL_URI][0]
        } else {
            label = id.substring(id.lastIndexOf('/')+1);
        }

        const option = {
            disabled: property.values.map(v => v.id).includes(id),
            id: id,
            label: label
        }

        return option;
    });

    options.sort((a, b) => {
        if(a.disabled > b.disabled) {
            return 1;
        } else if(a.disabled < b.disabled) {
            return -1;
        } else return 0;
    })

    // Prevent saving any labels used for UI
    const handleSave = selected => {
        onSave({id: selected.id})
    }

    return <div style={{width: '100%'}}>
        <MaterialReactSelect options={options}
                             onChange={handleSave}
                             placeholder={'Add new...'}/>
    </div>
}

LookupEntity.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onSave: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    if(state.cache && state.cache.entitiesByType) {
        const entities = state.cache.entitiesByType[ownProps.property.range];
        if (entities && !entities.pending && !entities.error) {
            return {entities: entities.data}
        }
    }

    return {entities: []}
}

export default connect(mapStateToProps)(LookupEntity);
