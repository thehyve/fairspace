import React from 'react';
import PropTypes from "prop-types";
import {withRouter} from "react-router-dom";

import {METADATA_PATH, TOOLTIP_ENTER_DELAY} from "../../constants";
import LinkedDataValuesTable from "./LinkedDataValuesTable";
import IriTooltip from "../../common/components/IriTooltip";
import Iri from "../../common/components/Iri";

const IDENTIFIER_COLUMN = {id: '@id', label: 'Uri', getValue: entry => entry.label || entry['@id']};

export const LinkedDataRelationTable = (
    {property, values, onDelete, onAdd, canAdd, addComponent, checkValueAddedNotSubmitted, history}
) => {
    const rowDecorator = (entry, children) => <IriTooltip key={entry.id} enterDelay={TOOLTIP_ENTER_DELAY} title={<Iri iri={entry.id} />}>{children}</IriTooltip>;
    const onOpen = entry => history.push(`${METADATA_PATH}?iri=${encodeURIComponent(entry.id)}`);

    return (
        <LinkedDataValuesTable
            onOpen={onOpen}
            onAdd={onAdd}
            onDelete={onDelete}
            columnDefinitions={[IDENTIFIER_COLUMN]}
            property={property}
            values={values}
            showHeader={false}
            canAdd={canAdd}
            addComponent={addComponent}
            checkValueAddedNotSubmitted={checkValueAddedNotSubmitted}
            rowDecorator={rowDecorator}
        />
    );
};

LinkedDataRelationTable.propTypes = {
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    checkValueAddedNotSubmitted: PropTypes.func,
    property: PropTypes.object,
    canAdd: PropTypes.bool
};

LinkedDataRelationTable.defaultProps = {
    onAdd: () => {},
    onDelete: () => {},
    canAdd: true
};

export default withRouter(LinkedDataRelationTable);
