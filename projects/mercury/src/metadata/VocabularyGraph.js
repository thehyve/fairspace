import React, {useCallback, useContext, useState} from "react";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Icon from "@material-ui/core/Icon";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import withStyles from "@material-ui/core/styles/withStyles";
import {LoadingInlay, MessageDisplay, useAsync} from "@fairspace/shared-frontend";
import {uniqBy} from 'lodash';
import {VocabularyAPI} from "./LinkedDataAPI";
import NetworkGraphVisualization from "../common/components/NetworkGraphVisualization";
import LinkedDataContext from "./LinkedDataContext";
import {getFirstPredicateId, getFirstPredicateValue} from "../common/utils/linkeddata/jsonLdUtils";
import {SHACL_CLASS, SHACL_NAME, SHACL_PATH, SHACL_TARGET_CLASS} from "../constants";
import {getNamespacedIri} from "../common/utils/linkeddata/metadataUtils";

const styles = {
    graph: {
        height: 'calc(100vh - 300px)',
        minHeight: 200,
        maxHeight: 500
    }
};

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const VocabularyGraph = ({classes}) => {
    const {namespaces, vocabulary, editorPath} = useContext(LinkedDataContext);
    const {data, error, loading} = useAsync(useCallback(() => VocabularyAPI.graph(), []));
    const [selection, setSelection] = useState({nodes: [], edges: []});

    const handleSelect = useCallback(params => {
        setSelection(params);
    }, []);

    if (loading) {
        return <LoadingInlay />;
    }

    if (error) {
        return <MessageDisplay message="An error occurred while loading vocabulary graph data" />;
    }

    const getRelationShape = (from, to) => vocabulary
        .determinePropertyShapesForTypes([from])
        .find(propertyShape => getFirstPredicateId(propertyShape, SHACL_CLASS) === to);

    const getRelationShapes = edge => {
        const relationShapes = [];
        if (edge.arrows === 'to' || edge.arrows.to) {
            relationShapes.push(getRelationShape(edge.from, edge.to));
        }

        if (edge.arrows === 'from' || edge.arrows.from) {
            relationShapes.push(getRelationShape(edge.to, edge.from));
        }

        // Return a unique list of non-undefined values
        return uniqBy(relationShapes.filter(s => s), s => s['@id']);
    };

    const showShape = (shape, predicateToShow, icon) => (
        <ListItem
            key={shape['@id']}
            component={Link}
            to={getEntityRelativeUrl(editorPath, shape['@id'])}
        >
            {icon ? <ListItemIcon><Icon>{icon}</Icon></ListItemIcon> : undefined}
            <ListItemText
                primary={getFirstPredicateValue(shape, SHACL_NAME)}
                secondary={getNamespacedIri(getFirstPredicateId(shape, predicateToShow), namespaces)}
            />
        </ListItem>
    );

    const renderNodeInfo = node => showShape(vocabulary.determineShapeForTypes([node.id]), SHACL_TARGET_CLASS, 'lens');
    const renderEdgeInfo = edge => getRelationShapes(edge).map(shape => showShape(shape, SHACL_PATH, 'link'));

    return (
        <Grid container spacing={8}>
            <Grid item sm={12} md={8}>
                <NetworkGraphVisualization
                    network={data}
                    onSelect={handleSelect}
                    className={classes.graph}
                />
            </Grid>
            <Grid item sm={12} md={4}>
                <List>
                    {selection.nodes.map(renderNodeInfo)}
                    {selection.edges.map(renderEdgeInfo)}
                </List>
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(VocabularyGraph);
