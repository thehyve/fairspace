import React, {useContext} from 'react';
import Switch from "@material-ui/core/Switch";
import {formatDateTime} from '@fairspace/shared-frontend';

import LinkedDataLink from "../LinkedDataLink";
import {BOOLEAN_URI, DATETIME_URI, MARKDOWN_URI} from "../../../constants";
import Iri from "../../../common/components/Iri";
import LinkedDataContext from "../../LinkedDataContext";
import ReactMarkdown from "react-markdown";

export const ReferringValue = ({property, entry, editorPath}) => {
    function extractDisplayValue(value) {
        switch (property.datatype) {
            case DATETIME_URI:
                return formatDateTime(value.value);
            case BOOLEAN_URI:
                return <Switch checked={value.value} readOnly />;
            case MARKDOWN_URI:
                return <ReactMarkdown source={value.value} />;
            default:
                return value.label || value.value || <Iri iri={value.id} />;
        }
    }

    const displayValue = property.isGenericIriResource ? entry.id : extractDisplayValue(entry);

    if (entry.id) {
        // External links should be represented by a direct link to the URI itself
        // Other iri entities should be opened in the metadata/vocabulary editor
        return property.isExternalLink
            ? <a href={entry.id}>{entry.id}</a>
            : (
                <LinkedDataLink editorPath={editorPath} uri={entry.id}>
                    {displayValue}
                </LinkedDataLink>
            );
    }

    return displayValue;
};

const ContextualReferringValue = props => {
    const {editorPath} = useContext(LinkedDataContext);

    return <ReferringValue {...props} editorPath={editorPath} />;
};

export default ContextualReferringValue;
