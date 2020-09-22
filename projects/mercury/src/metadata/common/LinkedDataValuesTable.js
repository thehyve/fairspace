import React, {useState} from 'react';
import PropTypes from "prop-types";
import {IconButton, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, Typography, withStyles} from '@material-ui/core';
import {Clear} from '@material-ui/icons';

import {LABEL_URI, STRING_URI} from '../../constants';

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
    {classes, property, values, columnDefinitions, onOpen, onAdd, onDelete, rowDecorator, canEdit,
        showHeader, labelId, addComponent: AddComponent}
) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const showRowDividers = property.maxValuesCount !== 1 && !(property.isEditable && property.datatype === STRING_URI);

    // The serial number is used to initialise a fresh 'add component' after adding or
    // deleting an item, in order to update the list of options correctly.
    const [serialNumber, setSerialNumber] = useState(0);

    const incrementSerialNumber = () => setSerialNumber(serialNumber + 1);
    const maxValuesReached = (property.maxValuesCount && (values.length >= property.maxValuesCount)) || false;

    // Delete button is enabled, if given entry can be deleted for the property specified and the entry can be edited
    const isDeleteButtonEnabled = () => property.isEditable && canEdit;
    const isAddButtonEnabled = canEdit && !maxValuesReached && AddComponent;

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
                                {
                                    columnDef.id === LABEL_URI
                                        ? <Typography variant="h4">{columnDef.getValue(entry, idx)}</Typography>
                                        : columnDef.getValue(entry, idx)
                                }
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
                                            <Clear />
                                        </IconButton>
                                    )
                                }
                                </TableCell>
                            )
                        }
                    </TableRow>
                )))}
            </TableBody>

            {isAddButtonEnabled ? (
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
    showHeader: PropTypes.bool,
    canEdit: PropTypes.bool,

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
    rowDecorator: (entry, children) => children,
    showHeader: true,
    canEdit: true,
    columnDefinitions: [],
    classes: {},
    values: []
};

export default withStyles(styles)(LinkedDataValuesTable);
