import React from 'react';
import PropTypes from 'prop-types';
import MaterialReactSelect from "../../generic/MaterialReactSelect/MaterialReactSelect";
import {connect} from 'react-redux';
import {fetchEntitiesIfNeeded} from "../../../actions/metadata";

function LookupEntity({entities, property, onSave, dispatch}) {
    // Ensure that the entities for lookup have been retrieved
    dispatch(fetchEntitiesIfNeeded(property.range));

    // Transform the entities to ensure a label is present
    const options = entities.map(entity => {
        const id = entity['@id'];
        let label

        if(entity['http://www.w3.org/2000/01/rdf-schema#label']) {
            label = entity['http://www.w3.org/2000/01/rdf-schema#label'][0]
        } else {
            label = id.substring(id.lastIndexOf('/')+1);
        }

        return {
            id,
            label
        }
    });

    // Prevent saving any labels used for UI
    const handleSave = selected => onSave({id: selected.id})

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
            return {entities: entities.items}
        }
    }

    return {entities: []}
}

export default connect(mapStateToProps)(LookupEntity);
