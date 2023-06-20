// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import {withRouter} from "react-router-dom";
import {TOOLTIP_ENTER_DELAY} from "../../constants";
import LinkedDataValuesList from "./LinkedDataValuesList";
import IriTooltip from "../../common/components/IriTooltip";
import Iri from "../../common/components/Iri";
const IDENTIFIER_COLUMN = {
    id: '@id',
    label: 'Uri',
    getValue: entry => entry.label || entry['@id']
};
export const LinkedDataRelationTable = ({
    property,
    values,
    onDelete,
    onAdd,
    canEdit,
    addComponent,
    editorPath,
    history
}) => {
    const rowDecorator = (entry, children) => <IriTooltip key={entry.id} enterDelay={TOOLTIP_ENTER_DELAY} title={<Iri iri={entry.id} />}>{children}</IriTooltip>;

    const onOpen = entry => history.push(`${editorPath}?iri=${encodeURIComponent(entry.id)}`);

    return <LinkedDataValuesList onOpen={onOpen} onAdd={onAdd} onDelete={onDelete} columnDefinition={IDENTIFIER_COLUMN} property={property} values={values} showHeader={false} canEdit={canEdit} addComponent={addComponent} rowDecorator={rowDecorator} />;
};
LinkedDataRelationTable.propTypes = {
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    property: PropTypes.object,
    canEdit: PropTypes.bool,
    editorPath: PropTypes.string
};
LinkedDataRelationTable.defaultProps = {
    onAdd: () => {},
    onDelete: () => {},
    canEdit: true
};
export default withRouter(LinkedDataRelationTable);