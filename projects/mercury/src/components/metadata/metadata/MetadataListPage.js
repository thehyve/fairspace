import React, {useState} from 'react';
import {connect} from 'react-redux';

import LinkedDataListPage from "../common/LinkedDataListPage";
import MetadataBrowserContainer from "./MetadataBrowserContainer";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {getLabel} from "../../../utils/linkeddata/metadataUtils";

const MetadataListPage = ({fetchVocabulary, vocabulary, classesInCatalog, search}) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [query, setQuery] = useState('');

    fetchVocabulary();

    const toTargetClasses = shapes => shapes.map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));

    const performSearch = (queryString, types) => {
        const shapes = types.length === 0 ? classesInCatalog : classesInCatalog.filter(c => {
            const targetClass = getFirstPredicateId(c, constants.SHACL_TARGET_CLASS);
            return types.includes(targetClass);
        });
        search(queryString, toTargetClasses(shapes));
    };

    const targetClasses = toTargetClasses(classesInCatalog);

    return (
        <LinkedDataListPage
            types={classesInCatalog.map(type => {
                const targetClass = getFirstPredicateId(type, constants.SHACL_TARGET_CLASS);
                const label = getLabel(type);
                return {type: targetClass, label};
            })}
            selectedTypes={selectedTypes}
            onSearchChange={q => {
                setQuery(q);
                performSearch(q, selectedTypes);
            }}
            onTypesChange={(types) => {
                setSelectedTypes(types);
                performSearch(query, types);
            }}
            listRenderer={() => (
                targetClasses && targetClasses.length > 0 && (
                    <MetadataBrowserContainer
                        targetClasses={targetClasses}
                        vocabulary={vocabulary}
                    />
                )
            )}
        />
    );
};

const mapStateToProps = (state) => {
    const vocabulary = getVocabulary(state);
    const classesInCatalog = vocabulary.getClassesInCatalog();
    return {vocabulary, classesInCatalog};
};

const mapDispatchToProps = {
    search: searchMetadata,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataListPage);
