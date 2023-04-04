/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";

const BooleanSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {onChange = () => {}, activeFilterValues = [], classes} = props;
    const [booleanFilterValue, setBooleanFilterValue] = useState();

    useEffect(() => {
        if (activeFilterValues.length === 1 && activeFilterValues[0] !== null) {
            setBooleanFilterValue(activeFilterValues[0]);
        } else {
            setBooleanFilterValue();
        }
    }, [activeFilterValues]);

    const handleChange = (event, newValue) => {
        if (booleanFilterValue !== newValue) {
            setBooleanFilterValue(newValue);
            const valueArray = newValue === null ? [] : [newValue];
            onChange(valueArray);
        }
    };

    return (
        <div className={classes.booleanContent}>
            <ToggleButtonGroup
                size="small"
                value={booleanFilterValue}
                fullWidth
                exclusive
                onChange={handleChange}
            >
                <ToggleButton color="success" variant="contained" value="true">True</ToggleButton>
                <ToggleButton color="error" variant="contained" value="false">False</ToggleButton>
            </ToggleButtonGroup>
        </div>

    );
};

export default BooleanSelectionFacet;
