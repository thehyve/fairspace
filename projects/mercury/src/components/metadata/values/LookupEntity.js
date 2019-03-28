import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MaterialReactSelect from "../../common/MaterialReactSelect";
import {fetchEntitiesIfNeeded} from "../../../actions/metadataActions";
import {getLabel} from "../../../utils/metadataUtils";
import {compareBy} from "../../../utils/comparisionUtils";

function LookupEntity({entities, property, onChange, dispatch, ...otherProps}) {
    // Ensure that the entities for lookup have been retrieved
    dispatch(fetchEntitiesIfNeeded(property.className));

    // Transform the entities to ensure a label is present
    const options = entities.map((entity) => {
        const id = entity['@id'];
        const label = getLabel(entity);
        const disabled = property.values.some(v => v.id === id);

        return {disabled, id, label};
    }).sort(compareBy('disabled'));

    return (
        <MaterialReactSelect
            style={{width: '100%'}}
            {...otherProps}
            options={options}
            // TODO: I think label is not needed here?
            onChange={({id, label}) => onChange({id, label})}
        />
    );
}

LookupEntity.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onSave: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    if (state.cache && state.cache.entitiesByType && ownProps.property.className) {
        const entities = state.cache.entitiesByType[ownProps.property.className];
        if (entities && entities.data && !entities.pending && !entities.error) {
            return {entities: entities.data};
        }
    }

    return {entities: []};
};

export default connect(mapStateToProps)(LookupEntity);
