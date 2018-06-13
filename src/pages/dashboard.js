import React from 'react';
import {ViewTitle} from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export default () => (
    <Card>
        <ViewTitle title="Welcome to the administration panel" />
        <CardContent>Lorem ipsum sic dolor amet...</CardContent>
    </Card>
);