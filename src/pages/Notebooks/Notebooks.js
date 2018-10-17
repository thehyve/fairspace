import React from 'react';
import Typography from "@material-ui/core/Typography";
import Config from "../../services/Config/Config";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import asPage from "../../containers/asPage/asPage";

const Notebooks = () => (
    <React.Fragment>
        <BreadCrumbs />

        <Typography>
            <a target="_blank" rel="noopener noreferrer" href={Config.get().urls.jupyter}>Open JupyterLab</a>
        </Typography>
    </React.Fragment>
);

export default asPage(Notebooks);



