import React, {useState} from 'react';
import PropTypes from "prop-types";
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    TableFooter, withStyles, IconButton
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import {canDelete} from "../../common/utils/linkeddata/metadataUtils";

const styles = {
    buttonColumn: {
        width: 80
    },
    noRowDividers: {
        '& td': {
            borderBottomWidth: 0
        }
    }
};

export const LinkedDataValuesTable = ({classes, property, values, columnDefinitions, onOpen, onAdd, onDelete, rowDecorator, canAdd, showHeader, labelId, addComponent: AddComponent}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

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
                        {columnDefinitions.map(columnDef => <TableCell key={columnDef.id}>{columnDef.getValue(entry, idx)}</TableCell>)}
                        {
                            property.isEditable
                            && (
                                <TableCell className={classes.buttonColumn}>{
                                    canDelete(property, entry)
                                    && (
                                        <IconButton
                                            data-testid="delete-btn"
                                            title="Delete"
                                            onClick={() => onDelete(idx)}
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
                        <TableCell colSpan={columnDefinitions.length}>
                            <AddComponent
                                property={property}
                                currentValues={values}
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
    onOpen: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    rowDecorator: PropTypes.func,
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
    values: PropTypes.array,

    classes: PropTypes.object
};

LinkedDataValuesTable.defaultProps = {
    onOpen: () => {},
    onDelete: () => {},
    rowDecorator: (entry, children) => children,
    showHeader: true,
    canAdd: true,
    columnDefinitions: [],
    classes: {},
    values: []
};

export default withStyles(styles)(LinkedDataValuesTable);
