import React from 'react';
import Button from '@material-ui/core/Button';
import Link from 'react-router-dom/Link';
import {withStyles} from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const defaultHomeUrl = '/collections';

function getBreadCrumbLink(text, path, linkClass) {
    return (<Button component={Link} to={path} key={path} variant='text' className={linkClass}>{text}</Button>);
}

function jsxJoin (array, str) {
    if(!array || array.length === 0)
        return [];

    let returnArray = [];
    for(const idx in array) {
        if(idx > 0) {
            returnArray.push(str);
        }
        returnArray.push(array[idx])
    }

    return returnArray
}

function BreadCrumbs(props) {
    let homeUrl = props.homeUrl || defaultHomeUrl;

    let breadcrumbs = [
        getBreadCrumbLink((<Icon>home</Icon>), homeUrl, props.classes.link)
    ];

    if(props.segments) {
        let currentPath = homeUrl;
        for(let segment of props.segments) {
            currentPath += '/' + segment.segment;
            breadcrumbs.push(getBreadCrumbLink(segment.label, currentPath, props.classes.link))
        }
    }

    return (
            jsxJoin(breadcrumbs, ' > ')
        );
}

export default withStyles({link: { minWidth: 'auto' }})(BreadCrumbs);
