import React, {useState} from 'react';
import PropTypes from "prop-types";
import {IconButton, TableHead} from '@material-ui/core';
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import ClearIcon from '@material-ui/icons/Clear';
import {SHACL_NAME, SHACL_PATH, SHACL_TARGET_CLASS} from "../../../constants";
import {getFirstPredicateId, getFirstPredicateValue} from "../../../utils/linkeddata/jsonLdUtils";
import {getLocalPart} from "../../../utils/linkeddata/metadataUtils";

const LinkedDataPropertyValuesTable = ({property, onDelete}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const isDeletable = entry => !('isDeletable' in entry) || entry.isDeletable;

    const columns = property.importantPropertyShapes && property.importantPropertyShapes.length > 0
        ? property.importantPropertyShapes
        : [{'@id': '@id', [SHACL_NAME]: ['Uri'], [SHACL_TARGET_CLASS]: '@id'}];

    const showEntry = (entry, shape) => {
        if (!entry || !shape) {
            return '';
        }

        const propertyPath = getLocalPart(getFirstPredicateId(shape, SHACL_PATH));
        return entry[propertyPath] ? entry[propertyPath].join(', ') : '';
    };

    // When no values are specified, do not show the table at all
    if (!property.values || property.values.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {columns.map(shape => <TableCell key={shape['@id']}>{getFirstPredicateValue(shape, SHACL_NAME)}</TableCell>)}
                    {property.isEditable ? <TableCell /> : undefined}
                </TableRow>
            </TableHead>
            <TableBody>
                {property.values.map((entry, idx) => (
                    <TableRow
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                    >
                        {columns.map(shape => <TableCell key={shape['@id']}>{showEntry(entry.otherEntry, shape)}</TableCell>)}
                        {property.isEditable
                            ? (
                                <TableCell>{
                                    isDeletable(entry)
                                        ? (
                                            <IconButton
                                                size="small"
                                                aria-label="Delete"
                                                title="Delete"
                                                onClick={() => onDelete(idx)}
                                                style={{
                                                    visibility: hoveredIndex === idx ? 'visible' : 'hidden',
                                                    padding: 6,
                                                    marginLeft: 8
                                                }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        ) : null
                                }
                                </TableCell>
                            ) : undefined}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

LinkedDataPropertyValuesTable.propTypes = {
    onDelete: PropTypes.func,
    property: PropTypes.object,
};

LinkedDataPropertyValuesTable.defaultProps = {
    onDelete: () => {}
};

export default LinkedDataPropertyValuesTable;
