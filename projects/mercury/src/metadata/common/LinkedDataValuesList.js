import React, {useState} from 'react';
import {Divider, Grid, IconButton, Tooltip, Typography} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {Add, Clear} from '@mui/icons-material';
import {FixedSizeList as List} from 'react-window';

import {LABEL_URI, MAX_LIST_LENGTH, STRING_URI} from '../../constants';
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
        <Grid container spacing={1} alignItems="center" className={classes.addValue} data-testid={"" + labelId}>
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
                        size="medium"
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

    const renderListItem = (entry, index) => rowDecorator(entry, (
        <Grid item xs={property.isEditable ? 10 : 12} className={classes.values}>
            <div style={{overflow: "hidden", textOverflow: "ellipsis"}}>
                {
                    columnDefinition.id === LABEL_URI
                        ? <Typography variant="h6">{columnDefinition.getValue(entry, index)}</Typography>
                        : <Typography noWrap>{columnDefinition.getValue(entry, index)}</Typography>
                }
            </div>
            {showRowDividers && <Divider />}
        </Grid>
    ));

    const renderListLimitMessage = (entry) => rowDecorator(entry, (
        <Grid item className={classes.values}>
            <div>
                <Tooltip title={"If a view tab is defined for '" + property.label + "', you can find all available values there."}>
                    <Typography fontStyle="italic" noWrap>... display limit ({MAX_LIST_LENGTH}) reached ...</Typography>
                </Tooltip>
            </div>
        </Grid>
    ));

    const renderValue = (entry, index) => rowDecorator(entry, (
        <Grid
            container
            spacing={1}
            alignItems="center"
            onMouseEnter={() => setHoveredIndex(index)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
            onMouseLeave={() => setHoveredIndex(null)}
            onDoubleClick={() => onOpen(entry)}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
        >
            {index === MAX_LIST_LENGTH ? renderListLimitMessage(entry) : renderListItem(entry, index)}
            {
                property.isEditable && isDeleteButtonEnabled(entry) && (
                    <Grid item xs={2}>
                        <IconButton
                            data-testid="delete-btn"
                            title="Delete"
                            onClick={() => {
                                onDelete(index);
                                incrementSerialNumber();
                            }}
                            style={{opacity: hoveredIndex === index ? 1 : 0}}
                            aria-label="Delete"
                            size="medium"
                        >
                            <Clear />
                        </IconButton>
                    </Grid>
                )
            }
        </Grid>
    ));

    const renderValueWindowed = ({index, style}) => (<div style={style}>{renderValue(values[index], index)}</div>);

    const renderValues = () => {
        if (values.length > 20) {
            return (
                <List
                    height={300}
                    itemCount={values.length}
                    itemSize={30}
                >
                    {renderValueWindowed}
                </List>
            );
        }

        return values.map((entry, idx) => renderValue(entry, idx));
    };

    return (
        <>
            {showHeader ? (
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={property.isEditable ? 10 : 12}>
                        {columnDefinition.label}
                    </Grid>
                </Grid>
            ) : undefined}
            {renderValues()}
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
