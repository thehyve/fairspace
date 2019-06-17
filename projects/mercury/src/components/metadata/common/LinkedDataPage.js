import React from 'react';
import {Paper} from "@material-ui/core";

import BreadCrumbs from "../../common/BreadCrumbs";

export default ({children, homeUrl}) => (
        <>
            <BreadCrumbs homeUrl={homeUrl} />
            <Paper style={{maxWidth: 800, padding: 20}}>
                {children}
            </Paper>
        </>
);
