import React from 'react';
import {Paper} from "@material-ui/core";
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from '.';
import {BreadCrumbs} from "../../common/components";

export default ({subject}) => (
    <>
        <BreadCrumbs />
        <Paper style={{maxWidth: 800, padding: 20}}>
            <LinkedDataEntityHeader subject={subject} />
            <LinkedDataEntityFormContainer subject={subject} fullpage />
        </Paper>
    </>
);
