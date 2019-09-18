import React, {useCallback, useContext, useState} from "react";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import {LoadingInlay, MessageDisplay, useAsync} from "@fairspace/shared-frontend";
import {uniq} from 'lodash';
import {VocabularyAPI} from "./LinkedDataAPI";
import NetworkGraphVisualization from "../common/components/NetworkGraphVisualization";
import LinkedDataContext from "./LinkedDataContext";
import {getFirstPredicateId, getFirstPredicateValue} from "../common/utils/linkeddata/jsonLdUtils";
import {SHACL_CLASS, SHACL_NAME} from "../constants";

const styles = {
    graph: {
        height: 'calc(100vh - 300px)',
        minHeight: 200,
        maxHeight: 500
    }
};

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const VocabularyGraph = ({classes}) => {
    const {vocabulary, editorPath} = useContext(LinkedDataContext);
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
        return uniq(relationShapes.filter(s => s), false, shape => shape['@id']);
    };

    const showShape = shape => (
        <div key={shape['@id']}>
            <Typography variant="h6">{getFirstPredicateValue(shape, SHACL_NAME)}</Typography>
            <Link to={getEntityRelativeUrl(editorPath, shape['@id'])}>View</Link>
        </div>
    );

    const renderNodeInfo = node => showShape(vocabulary.determineShapeForTypes([node.id]));
    const renderEdgeInfo = edge => getRelationShapes(edge).map(showShape);

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
                {selection.nodes.map(renderNodeInfo)}
                {selection.edges.map(renderEdgeInfo)}
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(VocabularyGraph);
