import React from 'react';
import PropTypes from "prop-types";
import {withRouter} from "react-router-dom";
import {compareBy, joinWithSeparator} from '../../common';

import {SHACL_NAME, SHACL_ORDER, SHACL_PATH, TOOLTIP_ENTER_DELAY} from "../../constants";
import {getFirstPredicateId, getFirstPredicateValue} from "../../common/utils/linkeddata/jsonLdUtils";
import {getLocalPart} from "../../common/utils/linkeddata/metadataUtils";
import LinkedDataValuesTable from "./LinkedDataValuesTable";
import IriTooltip from "../../common/components/IriTooltip";
import Iri from "../../common/components/Iri";
import {isGenericIriResource, isRelationShape} from "../../common/utils/linkeddata/vocabularyUtils";
import {workspacePrefix} from '../../workspaces/workspaces';

const IDENTIFIER_COLUMN = {id: '@id', label: 'Uri', getValue: entry => entry['@id']};

export const LinkedDataRelationTable = ({property, values, onDelete, onAdd, canAdd, addComponent, editorPath, history}) => {
    // Determine the columns to show. If no important property shapes are defined or a shape is empty, only
    // the URI will be shown
    let columnDefinitions: any[];

    if (property.importantPropertyShapes && property.importantPropertyShapes.length > 0) {
        columnDefinitions = property.importantPropertyShapes
            .sort(compareBy(shape => {
                const order = getFirstPredicateValue(shape, SHACL_ORDER);
                return typeof order === 'number' ? order : Number.MAX_SAFE_INTEGER;
            }))
            .map(shape => {
                const propertyPath = getLocalPart(getFirstPredicateId(shape, SHACL_PATH) || '');
                const renderEntry = isGenericIriResource(shape) || isRelationShape(shape) ? iri => <Iri key={iri} iri={iri} /> : iri => iri.toString();

                return {
                    id: shape['@id'],
                    label: getFirstPredicateValue(shape, SHACL_NAME),
                    getValue: entry => {
                        if (entry) {
                            return (entry.otherEntry && Array.isArray(entry.otherEntry[propertyPath])
                                ? joinWithSeparator(
                                    entry.otherEntry[propertyPath]
                                        .filter(e => e)
                                        .map(renderEntry),
                                    ', '
                                )
                                : entry.id);
                        }
                        return "";
                    }
                };
            });
    } else {
        columnDefinitions = [IDENTIFIER_COLUMN];
    }

    const rowDecorator = (entry, children) => <IriTooltip key={entry.id} enterDelay={TOOLTIP_ENTER_DELAY} title={<Iri iri={entry.id} />}>{children}</IriTooltip>;
    const onOpen = entry => history.push(`${workspacePrefix()}${editorPath}?iri=` + encodeURIComponent(entry.id));

    return (
        <LinkedDataValuesTable
            onOpen={onOpen}
            onAdd={onAdd}
            onDelete={onDelete}
            columnDefinitions={columnDefinitions}
            property={property}
            values={values}
            showHeader={columnDefinitions.length > 1}
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
