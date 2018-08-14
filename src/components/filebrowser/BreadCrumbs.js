import React from 'react';
import Button from "@material-ui/core/Button";
import Link from "react-router-dom/Link";
import {withStyles} from '@material-ui/core/styles';
import Icon from "@material-ui/core/Icon";

const defaultHomeUrl = "/collections";

function getBreadCrumbLink(text, path, linkClass) {
    return (<Button component={Link} to={path} key={path} variant="text" className={linkClass}>{text}</Button>);
}

function jsxJoin (array, str) {
    return array.length > 0
        ? array
            .reduce((acc, x) => acc === null ? [x] : [acc, str, x], null)
        : null;
}

function BreadCrumbs(props) {
    let homeUrl = props.homeUrl || defaultHomeUrl;
    let rootName = props.rootName || "/";
    let rootUrl = props.rootUrl|| homeUrl;

    let breadcrumbs = [
        getBreadCrumbLink((<Icon>home</Icon>), homeUrl, props.classes.link),
        getBreadCrumbLink(rootName, rootUrl, props.classes.link)
    ];

    if(props.segments) {
        let currentPath = rootUrl;
        for(let segment of props.segments) {
            currentPath += "/" + segment;
            breadcrumbs.push(getBreadCrumbLink(segment, currentPath, props.classes.link))
        }
    }

    return (
            jsxJoin(breadcrumbs, " > ")
        );
}

export default withStyles({link: { minWidth: 'auto' }})(BreadCrumbs);
