import React from 'react';
import PropTypes from "prop-types";
import {
    IconButton,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormGroup,
    FormHelperText,
    withStyles
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import {LinkedDataValuesContext} from "./LinkedDataValuesContext";

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        width: '100%',
        margin: theme.spacing.unit,
    },
});

class LinkedDataProperty extends React.Component {
    state = {
        hoveredIndex: null
    };

    setHoveredIndex = (hoveredIndex) => {
        this.setState({hoveredIndex});
    };

    render() {
        const {classes, editable, property, onAdd, onChange, onDelete} = this.props;
        const {readOnlyComponent, editComponent, addComponent} = this.context;
        const hasErrors = property.errors && property.errors.length > 0;

        // Do not show an add component if no multiples are allowed
        // and there is already a value
        const maxValuesReached = (property.maxValuesCount && (property.values.length >= property.maxValuesCount)) || false;
        const canAdd = editable && !property.machineOnly && !maxValuesReached;
        const labelId = `label-${property.key}`;

        // The edit component should not actually allow editing the value if editable is set to false
        // or if the property contains settings that disallow editing existing values
        const disableEditing = !editable || LinkedDataProperty.disallowEditingOfExistingValues(property);
        const ValueComponent = disableEditing ? readOnlyComponent() : editComponent(property);
        const ValueAddComponent = addComponent(property);
        const required = property.minValuesCount > 0;

        return (
            <div className={classes.root}>
                <FormControl required={required} error={hasErrors} component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">{property.label}</FormLabel>
                    <FormGroup>
                        {property.values.map((entry, idx) => (
                            <div
                                onMouseEnter={() => this.setHoveredIndex(idx)}
                                onMouseLeave={() => this.setHoveredIndex(null)}
                                // eslint-disable-next-line react/no-array-index-key
                                key={idx}
                            >
                                <FormControlLabel
                                    style={{width: '100%', margin: 0}}
                                    control={(
                                        <>
                                            <ValueComponent
                                                property={property}
                                                entry={entry}
                                                onChange={(value) => onChange(value, idx)}
                                                aria-labelledby={labelId}
                                                error={hasErrors}
                                            />
                                            {
                                                editable
                                                    ? (
                                                        <IconButton
                                                            size="small"
                                                            aria-label="Delete"
                                                            title="Delete"
                                                            onClick={() => onDelete(idx)}
                                                            style={{visibility: this.state.hoveredIndex === idx ? 'visible' : 'hidden'}}
                                                        >
                                                            <ClearIcon />
                                                        </IconButton>
                                                    ) : null
                                            }
                                        </>
                                    )}
                                />
                            </div>
                        ))}

                        {canAdd ? (
                            <FormControlLabel
                                style={{width: '100%', margin: 0}}
                                control={(
                                    <div style={{width: '100%'}}>
                                        <ValueAddComponent
                                            property={property}
                                            placeholder="Add new"
                                            onChange={onAdd}
                                            aria-labelledby={labelId}
                                        />
                                    </div>

                                )}
                            />
                        ) : null}

                    </FormGroup>
                    {hasErrors ? (<FormHelperText>{property.errors.map(e => `${e}. `)}</FormHelperText>) : null}
                </FormControl>
            </div>
        );
    }

    /**
     * Checks whether the configuration of this property disallowed editing of existing values
     * This is the case if
     *   - the property is machineOnly
     *   - the field refers to a url (marked as RESOURCE_URI)
     *   - the value is taken from a set of allowed values
     * @param property
     * @returns {Boolean}
     */
    static disallowEditingOfExistingValues(property) {
        return property.machineOnly
            || property.isGenericIriResource
            || property.allowedValues;
    }
}

LinkedDataProperty.contextType = LinkedDataValuesContext;

LinkedDataProperty.propTypes = {
    onChange: PropTypes.func,
    editable: PropTypes.bool,
    property: PropTypes.object,
    classes: PropTypes.object,
};


LinkedDataProperty.defaultProps = {
    onChange: () => {},
    editable: true,
    classes: {}
};

export default withStyles(styles)(LinkedDataProperty);
