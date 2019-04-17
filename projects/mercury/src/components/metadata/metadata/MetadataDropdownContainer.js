import {connect} from 'react-redux';
import * as metadataActions from "../../../actions/metadataActions";
import EntityDropdown from "../common/values/EntityDropdown";

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

export default connect(mapStateToProps, mapDispatchToProps)(EntityDropdown);
