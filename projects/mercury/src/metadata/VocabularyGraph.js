import React, {useCallback, useContext, useState} from "react";
import {withRouter} from "react-router-dom";
import {Checkbox, FormControlLabel, Grid, Radio, RadioGroup} from "@material-ui/core";
import {uniqBy} from 'lodash';

import {LoadingInlay, MessageDisplay, useAsync} from "../common";
import {VocabularyAPI} from "./LinkedDataAPI";
import NetworkGraphVisualization, {
    EDGE_LENGTH_LARGE,
    EDGE_LENGTH_MEDIUM,
    EDGE_LENGTH_SMALL
} from "../common/components/NetworkGraphVisualization";
import LinkedDataContext from "./LinkedDataContext";
import {getFirstPredicateId} from "./common/jsonLdUtils";
import {SHACL_CLASS} from "../constants";
import {determinePropertyShapesForTypes, determineShapeForTypes} from "./common/vocabularyUtils";

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=${encodeURIComponent(id)}`;

const VocabularyGraph = ({history}) => {
    const {vocabulary, editorPath} = useContext(LinkedDataContext);
    const {data, error, loading} = useAsync(useCallback(() => VocabularyAPI.graph(), []));
    const [showEdgesLabels, setShowEdgesLabels] = useState(false);
    const [edgesLength, setEdgesLength] = useState(EDGE_LENGTH_SMALL);

    const handleNodeDoubleClick = useCallback(
        (id) => {
            const shape = determineShapeForTypes(vocabulary, [id]);
            const url = getEntityRelativeUrl(editorPath, shape['@id']);
            history.push(url);
        }, [editorPath, history, vocabulary]
    );

    const getRelationShape = useCallback((from, to) => determinePropertyShapesForTypes(vocabulary, [from])
        .find(propertyShape => getFirstPredicateId(propertyShape, SHACL_CLASS) === to), [vocabulary]);

    const getRelationShapes = useCallback(edge => {
        const relationShapes = [];
        if (edge.arrows === 'to' || edge.arrows.to) {
            relationShapes.push(getRelationShape(edge.from, edge.to));
        }

        if (edge.arrows === 'from' || edge.arrows.from) {
            relationShapes.push(getRelationShape(edge.to, edge.from));
        }

        // Return a unique list of non-undefined values
        return uniqBy(relationShapes.filter(s => s), s => s['@id']);
    }, [getRelationShape]);

    const handleEdgeDoubleClick = useCallback(
        (edge) => {
            if (edge) {
                const shape = getRelationShapes(edge)[0];
                const url = getEntityRelativeUrl(editorPath, shape['@id']);
                history.push(url);
            }
        }, [editorPath, getRelationShapes, history]
    );

    if (loading) {
        return <LoadingInlay />;
    }

    if (error) {
        return <MessageDisplay message="An error occurred while loading vocabulary graph data" />;
    }

    return (
        <Grid container direction="column">
            <Grid item>
                <Grid container spacing={4} alignItems="center">
                    <Grid item>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={showEdgesLabels}
                                    onChange={(e) => setShowEdgesLabels(e.target.checked)}
                                />
                            )}
                            label="Edges Labels"
                        />
                    </Grid>
                    <Grid item>
                        <RadioGroup
                            row
                            aria-label="edges length"
                            name="edgesLength"
                            value={edgesLength}
                            onChange={(e) => setEdgesLength(e.target.value)}
                        >
                            <FormControlLabel value={EDGE_LENGTH_SMALL} control={<Radio />} label="Short Edges" />
                            <FormControlLabel value={EDGE_LENGTH_MEDIUM} control={<Radio />} label="Medium" />
                            <FormControlLabel value={EDGE_LENGTH_LARGE} control={<Radio />} label="Long" />
                        </RadioGroup>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <NetworkGraphVisualization
                    showEdgesLabels={showEdgesLabels}
                    edgesLength={edgesLength}
                    network={data}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    onEdgeDoubleClick={handleEdgeDoubleClick}
                    style={{
                        height: 'calc(100vh - 360px)'
                    }}
                />
            </Grid>
        </Grid>
    );
};

export default withRouter(VocabularyGraph);
