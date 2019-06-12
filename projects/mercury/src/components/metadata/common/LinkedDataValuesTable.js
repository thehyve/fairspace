import React, {useState} from 'react';
import PropTypes from "prop-types";
import {Button, Table, TableBody, TableCell, TableHead, TableRow, withStyles} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import TableFooter from "@material-ui/core/TableFooter";

const styles = {
    buttonColumn: {
        width: 80
    },
    noRowDividers: {
        '& td': {
            borderBottomWidth: 0
        }
    }
}

export const LinkedDataValuesTable = ({classes, property, columnDefinitions, onAdd, onDelete, canAdd, showHeader, labelId, addComponent: AddComponent}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const isDeletable = entry => !('isDeletable' in entry) || entry.isDeletable;
    const showRowDividers = property.maxValuesCount !== 1;

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
                {property.values.map((entry, idx) => (
                    <TableRow
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                    >
                        {columnDefinitions.map(columnDef => <TableCell key={columnDef.id}>{columnDef.getValue(entry, idx)}</TableCell>)}
                        {property.isEditable
                            ? (
                                <TableCell className={classes.buttonColumn}>{
                                    isDeletable(entry)
                                        ? (
                                            <Button
                                                size="small"
                                                aria-label="Delete"
                                                title="Delete"
                                                onClick={() => onDelete(idx)}
                                                style={{
                                                    visibility: hoveredIndex === idx ? 'visible' : 'hidden',
                                                }}
                                            >
                                                <ClearIcon />
                                            </Button>
                                        ) : null
                                }
                                </TableCell>
                            ) : undefined}
                    </TableRow>
                ))}
            </TableBody>

            {canAdd && AddComponent ? (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={columnDefinitions.length}>
                            <AddComponent
                                property={property}
                                placeholder=""
                                onChange={onAdd}
                                aria-labelledby={labelId}
                            />
                        </TableCell>
                        {property.isEditable ? <TableCell className={classes.buttonColumn} /> : undefined}
                    </TableRow>
                </TableFooter>
            ) : undefined
            }
        </Table>
    );
};

LinkedDataValuesTable.propTypes = {
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    showHeader: PropTypes.bool,
    canAdd: PropTypes.bool,

    columnDefinitions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            label: PropTypes.string,
            getValue: PropTypes.func
        })
    ),
    property: PropTypes.object,

    classes: PropTypes.object
};

LinkedDataValuesTable.defaultProps = {
    onDelete: () => {},
    showHeader: true,
    canAdd: true,
    columnDefinitions: [],
    classes: {}
};

export default withStyles(styles)(LinkedDataValuesTable);
