import React from "react";
import Grid from "@material-ui/core/Grid/Grid";
import Icon from "@material-ui/core/Icon/Icon";
import Input from "@material-ui/core/Input/Input";

export default (props) => (
    <Grid container spacing={8} alignItems="flex-end" style={{padding: 4}}>
        <Grid item >
            <Icon color={props.disabled ? 'disabled': 'action'}>search</Icon>
        </Grid>
        <Grid item>
            <Input {...props}
                disableUnderline
            />
        </Grid>
    </Grid>
)
