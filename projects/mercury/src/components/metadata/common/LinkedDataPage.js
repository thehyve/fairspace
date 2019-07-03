import React from 'react';
import {Paper} from "@material-ui/core";
import BreadCrumbs from "../../common/breadcrumbs/BreadCrumbs";

export default ({children}) => (
        <>
            <BreadCrumbs />
            <Paper style={{maxWidth: 800, padding: 20}}>
                {children}
            </Paper>
        </>
);
