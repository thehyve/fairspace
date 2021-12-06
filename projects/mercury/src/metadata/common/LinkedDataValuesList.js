import React, {useState} from 'react';
import {Divider, Grid, IconButton, Typography, withStyles} from '@material-ui/core';
import {Add, Clear} from '@material-ui/icons';

import {LABEL_URI, STRING_URI} from '../../constants';
import styles from './LinkedDataValuesTable.styles';
import StringValue from './values/StringValue';

type AddValueToListProps = {
    serialNumber: number;
    classes: any;
    property: any;
    values: any[];
    onAdd: () => {};
    labelId: string;
    addComponent: any;
};

const AddValueToList = (props: AddValueToListProps) => {
    const {serialNumber, classes, property, values, onAdd, labelId, addComponent: AddComponent} = props;
    const [newValue, setNewValue] = useState('');
    const isStringValue = (AddComponent === StringValue);
    return (
        <Grid container spacing={1} alignItems="center" className={classes.addValue}>
            <Grid item xs={isStringValue ? 10 : 12}>
                <AddComponent
                    data-testid="add-value-input"
                    variant="outlined"
                    // label='New value'
                    key={serialNumber}
                    property={property}
                    currentValues={values}
                    placeholder=""
                    aria-labelledby={labelId}
                    onChange={val => {
                        if (val) {
                            if (AddComponent === StringValue) {
                                setNewValue(val);
                            } else {
                                onAdd(val);
                            }
                        }
                    }}
                    className={`${classes.addValueInput} ${classes.values}`}
                />
            </Grid>
            {isStringValue && (
                <Grid item>
                    <IconButton
                        data-testid="add-btn"
                        title="Add"
                        onClick={() => {
                            const value = newValue;
                            setNewValue('');
                            onAdd(value);
                        }}
                        aria-label="Add"
                    >
                        <Add color={newValue ? 'primary' : 'inherit'} />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};

type ColumnDefinition = {
    id: string;
    label: string;
    getValue: () => {};
};

type LinkedDataValuesListProps = {
    onOpen: () => {};
    onAdd: () => {};
    onDelete: () => {};
    rowDecorator: () => {};
    showHeader: boolean;
    canEdit: boolean;
    labelId: string;
    columnDefinition: ColumnDefinition;
    property: any;
    values: any[];
    classes: any;
    addComponent: any;
};

export const LinkedDataValuesList = (props: LinkedDataValuesListProps) => {
    const {
        classes = {}, property, values = [], columnDefinition,
        onOpen = () => {
        }, onAdd = null, onDelete = () => {
        },
        rowDecorator = (entry, children) => children,
        canEdit = true, showHeader = true,
        labelId, addComponent: AddComponent
    } = props;

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
        <>
            {showHeader ? (
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={property.isEditable ? 10 : 12}>
                        {columnDefinition.label}
                    </Grid>
                </Grid>
            ) : undefined}
            {values.map((entry, idx) => rowDecorator(entry, (
                <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onFocus={() => setHoveredIndex(idx)}
                    onBlur={() => setHoveredIndex(null)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onDoubleClick={() => onOpen(entry)}
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                >
                    <Grid item xs={property.isEditable ? 10 : 12} className={classes.values}>
                        {
                            columnDefinition.id === LABEL_URI
                                ? <Typography variant="h6">{columnDefinition.getValue(entry, idx)}</Typography>
                                : columnDefinition.getValue(entry, idx)
                        }
                        {showRowDividers && <Divider />}
                    </Grid>
                    {
                        property.isEditable && isDeleteButtonEnabled(entry) && (
                            <Grid item xs={2}>
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
                            </Grid>
                        )
                    }
                </Grid>
            )))}

            {isAddButtonEnabled && (
                (property.maxValuesCount === 1)
                    ? (
                        <Grid container spacing={1} alignItems="center">
                            <Grid item xs={10}>
                                <AddComponent
                                    key={serialNumber}
                                    property={property}
                                    currentValues={values}
                                    placeholder=""
                                    aria-labelledby={labelId}
                                    onChange={(val) => {
                                        if (val) {
                                            onAdd(val);
                                            incrementSerialNumber();
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )
                    : (
                        <AddValueToList
                            serialNumber={serialNumber}
                            classes={classes}
                            property={property}
                            values={values}
                            labelId={labelId}
                            addComponent={AddComponent}
                            onAdd={(val) => {
                                if (val) {
                                    onAdd(val);
                                    incrementSerialNumber();
                                }
                            }}
                        />
                    )
            )}
        </>
    );
};

export default withStyles(styles)(LinkedDataValuesList);
