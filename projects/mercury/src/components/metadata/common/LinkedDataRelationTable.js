import React from 'react';
import PropTypes from "prop-types";
import {SHACL_NAME, SHACL_ORDER, SHACL_PATH} from "../../../constants";
import {getFirstPredicateId, getFirstPredicateValue} from "../../../utils/linkeddata/jsonLdUtils";
import {getLocalPart} from "../../../utils/linkeddata/metadataUtils";
import LinkedDataValuesTable from "./LinkedDataValuesTable";
import {compareBy} from "../../../utils/genericUtils";
import Tooltip from "@material-ui/core/Tooltip";
import {withRouter} from "react-router-dom";

const IDENTIFIER_COLUMN = {id: '@id', label: 'Uri', getValue: entry => entry['@id']};

export const LinkedDataRelationTable = ({property, onDelete, onAdd, canAdd, addComponent, editorPath, history}) => {
    // Determine the columns to show. If no important property shapes are defined, only
    // the URI will be shown
    let columnDefinitions;

    if (property.importantPropertyShapes && property.importantPropertyShapes.length > 0) {
        columnDefinitions = property.importantPropertyShapes
            .sort(compareBy(shape => {
                const order = getFirstPredicateValue(shape, SHACL_ORDER);
                return typeof order === 'number' ? order : Number.MAX_SAFE_INTEGER;
            }))
            .map(shape => {
                const propertyPath = getLocalPart(getFirstPredicateId(shape, SHACL_PATH) || '');
                return {
                    id: shape['@id'],
                    label: getFirstPredicateValue(shape, SHACL_NAME),
                    getValue: entry => (entry && entry.otherEntry && Array.isArray(entry.otherEntry[propertyPath]) ? entry.otherEntry[propertyPath].join(', ') : '')
                };
            });
    } else {
        columnDefinitions = [IDENTIFIER_COLUMN];
    }

    const rowDecorator = (entry, children) => <Tooltip key={entry.id} title={entry.id}>{children}</Tooltip>
    const onOpen = entry => history.push(`${editorPath}?iri=` + encodeURIComponent(entry.id));

    return (
        <LinkedDataValuesTable
            onOpen={onOpen}
            onAdd={onAdd}
            onDelete={onDelete}
            columnDefinitions={columnDefinitions}
            property={property}
            showHeader={property.values && property.values.length > 0}
            canAdd={canAdd}
            addComponent={addComponent}
            rowDecorator={rowDecorator}
        />
    );
};

LinkedDataRelationTable.propTypes = {
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    property: PropTypes.object,
    canAdd: PropTypes.bool,
    editorPath: PropTypes.string
};

LinkedDataRelationTable.defaultProps = {
    onAdd: () => {},
    onDelete: () => {},
    canAdd: true
};

export default withRouter(LinkedDataRelationTable);
