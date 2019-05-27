import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Input from "@material-ui/core/Input";
import {withStyles} from "@material-ui/core";

import MetadataBrowserContainer from "./MetadataBrowserContainer";
import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {getLabel} from "../../../utils/linkeddata/metadataUtils";

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const MetadataListPage = ({classes, fetchVocabulary, vocabulary, classesInCatalog, searchMetadata: search}) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [query, setQuery] = useState('');

    fetchVocabulary();

    const renderTypeClass = typeClass => {
        const targetClass = getFirstPredicateId(typeClass, constants.SHACL_TARGET_CLASS);
        const label = getLabel(typeClass);

        return (
            <MenuItem key={targetClass} value={typeClass}>
                <Checkbox checked={selectedTypes.indexOf(typeClass) > -1} />
                <ListItemText primary={label} secondary={targetClass} />
            </MenuItem>
        );
    };

    const toTargetClasses = shapes => shapes.map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));

    const performSearch = (queryString, types) => {
        search(queryString, toTargetClasses(types.length === 0 ? classesInCatalog : types));
    };

    return (
        <>
            <BreadCrumbs />
            <Paper>
                <SearchBar
                    placeholder="Search"
                    disableUnderline
                    onSearchChange={q => {
                        setQuery(q);
                        performSearch(q, selectedTypes);
                    }}
                />

                <FormControl className={classes.typeSelect}>
                    <Select
                        multiple
                        displayEmpty
                        value={selectedTypes}
                        onChange={e => {
                            setSelectedTypes(e.target.value);
                            performSearch(query, e.target.value);
                        }}
                        input={<Input id="select-multiple-checkbox" />}
                        renderValue={selected => (selected.length === 0 ? '[All types]' : selected.map(getLabel).join(', '))}
                    >
                        {classesInCatalog.map(renderTypeClass)}
                    </Select>
                </FormControl>
            </Paper>

            {classesInCatalog && classesInCatalog.length > 0 && (
                <MetadataBrowserContainer
                    vocabulary={vocabulary}
                    targetClasses={toTargetClasses(classesInCatalog)}
                    fetchVocabulary={fetchVocabulary}
                />
            )}
        </>
    );
};

const mapStateToProps = (state) => {
    const vocabulary = getVocabulary(state);
    const classesInCatalog = vocabulary.getClassesInCatalog();

    return {classesInCatalog, vocabulary};
};

const mapDispatchToProps = {
    searchMetadata,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(MetadataListPage));
