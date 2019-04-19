import React from "react";
import {connect} from 'react-redux';
import * as vocabularyActions from "../../../actions/vocabularyActions";
import EntityDropdown from "../common/values/EntityDropdown";

class VocabularyDropdownContainer extends React.Component {
    constructor(props) {
        super(props);
        props.fetchEntities(props.property.className);
    }

    render() {
        return <EntityDropdown {...this.props} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    const {cache: {vocabularyEntitiesByType}} = state;
    const dropdownOptions = vocabularyEntitiesByType[ownProps.property.className];
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
    fetchEntities: vocabularyActions.fetchVocabularyEntitiesIfNeeded
});

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyDropdownContainer);
