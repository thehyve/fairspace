import React, {useState} from 'react';
import PropTypes from "prop-types";
import {FormControlLabel, IconButton} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

const LinkedDataPropertyValuesList = ({property, onChange, onDelete, labelId, valueComponent: ValueComponent}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const {values, errors} = property;
    const hasErrors = errors && errors.length > 0;

    const isDeletable = entry => !('isDeletable' in entry) || entry.isDeletable;

    return (
        <>
            {values.map((entry, idx) => (
                <div
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
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
                                    isDeletable(entry) && property.isEditable
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
                            </>
                        )}
                    />
                </div>
            ))}
        </>
    );
};

LinkedDataPropertyValuesList.propTypes = {
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    property: PropTypes.object,
    labelId: PropTypes.string,
    valueComponent: PropTypes.func
};

LinkedDataPropertyValuesList.defaultProps = {
    onChange: () => {},
    onDelete: () => {}
};

export default LinkedDataPropertyValuesList;
