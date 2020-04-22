import React, {useState} from 'react';
import PropTypes from "prop-types";
import {IconButton, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, withStyles} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import {canDelete} from "../../common/utils/linkeddata/metadataUtils";
import {STRING_URI} from '../../constants';

const styles = {
    buttonColumn: {
        width: 80
    },
    valueColumn: {
        cursor: 'default'
    },
    noRowDividers: {
        '& td': {
            borderBottomWidth: 0
        }
    }
};

export const LinkedDataValuesTable = (
    {classes, property, values, columnDefinitions, onOpen, onAdd, onDelete, rowDecorator, canAdd,
        hasRestrictedOperationsRight, showHeader, labelId, checkValueAddedNotSubmitted, addComponent: AddComponent}
) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const showRowDividers = property.maxValuesCount !== 1 && !(property.isEditable && property.datatype === STRING_URI);

    // The serial number is used to initialise a fresh 'add component' after adding or
    // deleting an item, in order to update the list of options correctly.
    const [serialNumber, setSerialNumber] = useState(0);

    const incrementSerialNumber = () => setSerialNumber(serialNumber + 1);

    // Delete button is enabled, if both:
    // - given entry can be deleted for the property specified
    // - user has a right to perform delete operations or given entry was just added and not submitted yet
    const isDeleteButtonEnabled = (entry) => (
        canDelete(property, entry)
        && (hasRestrictedOperationsRight || checkValueAddedNotSubmitted(property, entry))
    );

    return (
        <Table padding="none" className={showRowDividers ? '' : classes.noRowDividers}>
            {showHeader
                ? (
                    <TableHead>
                        <TableRow>
                            {columnDefinitions.map(columnDef => <TableCell key={columnDef.id}>{columnDef.label}</TableCell>)}
                            {property.isEditable ? <TableCell className={classes.buttonColumn} /> : undefined}
                        </TableRow>
                    </TableHead>
                ) : undefined}
            <TableBody>
                {values.map((entry, idx) => rowDecorator(entry, (
                    <TableRow
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onFocus={() => setHoveredIndex(idx)}
                        onBlur={() => setHoveredIndex(null)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onDoubleClick={() => onOpen(entry)}
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                    >
                        {columnDefinitions.map(columnDef => (
                            <TableCell className={classes.valueColumn} key={columnDef.id}>
                                {columnDef.getValue(entry, idx)}
                            </TableCell>
                        ))}
                        {
                            property.isEditable
                            && (
                                <TableCell className={classes.buttonColumn}>{
                                    isDeleteButtonEnabled(entry)
                                    && (
                                        <IconButton
                                            data-testid="delete-btn"
                                            title="Delete"
                                            onClick={() => {
                                                onDelete(idx);
                                                incrementSerialNumber();
                                            }}
                                            style={{opacity: hoveredIndex === idx ? 1 : 0}}
                                            aria-label="Delete"
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    )
                                }
                                </TableCell>
                            )
                        }
                    </TableRow>
                )))}
            </TableBody>

            {canAdd && AddComponent ? (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={columnDefinitions.length} style={{borderBottom: 'none'}}>
                            <AddComponent
                                key={serialNumber}
                                property={property}
                                currentValues={values}
                                placeholder=""
                                onChange={val => {
                                    if (val) {
                                        onAdd(val);
                                        incrementSerialNumber();
                                    }
                                }}
                                aria-labelledby={labelId}
                            />
                        </TableCell>
                        {property.isEditable ? <TableCell className={classes.buttonColumn} style={{borderBottom: 'none'}} /> : undefined}
                    </TableRow>
                </TableFooter>
            ) : undefined}
        </Table>
    );
};

LinkedDataValuesTable.propTypes = {
    onOpen: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    rowDecorator: PropTypes.func,
    checkValueAddedNotSubmitted: PropTypes.func,
    showHeader: PropTypes.bool,
    canAdd: PropTypes.bool,
    hasRestrictedOperationsRight: PropTypes.bool,

    columnDefinitions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            label: PropTypes.string,
            getValue: PropTypes.func
        })
    ),
    property: PropTypes.object,
    values: PropTypes.array,

    classes: PropTypes.object
};

LinkedDataValuesTable.defaultProps = {
    onOpen: () => {},
    onDelete: () => {},
    hasRestrictedOperationsRight: () => {},
    rowDecorator: (entry, children) => children,
    showHeader: true,
    canAdd: true,
    columnDefinitions: [],
    classes: {},
    values: []
};

export default withStyles(styles)(LinkedDataValuesTable);
