import React from 'react';
import {Paper} from "@material-ui/core";
import BreadCrumbs from "../../common/BreadCrumbs";

export default ({children, rootBreadCrumb}) => (
        <>
            <BreadCrumbs segments={[rootBreadCrumb]} />
            <Paper style={{maxWidth: 800, padding: 20}}>
                {children}
            </Paper>
        </>
);
