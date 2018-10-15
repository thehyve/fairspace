import React from 'react';
import Typography from "@material-ui/core/Typography";
import Config from "../../components/generic/Config/Config";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";

function Notebooks(props) {
    return (<div>
        <BreadCrumbs segments={[{segment: 'notebooks', label: 'Notebooks'}]}/>

        <Typography><a target="_blank" href={Config.get().urls.jupyter}>Open JupyterLab</a></Typography>
    </div>);
}

export default (Notebooks);



