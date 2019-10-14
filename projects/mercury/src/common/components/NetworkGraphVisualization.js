import React, {useEffect, useRef} from 'react';
import PropTypes from "prop-types";
import vis from 'vis-network';

/**
 * Draws a network visualization using vis-network
 * @param network   dot-notation of the network to draw
 * @returns {*}
 * @constructor
 */
const NetworkGraphVisualization = ({
    network, showEdgesLabels, edgesLength, onNodeDoubleClick, onEdgeDoubleClick, style
}) => {
    const ref = useRef(null);

    useEffect(() => {
        if (network) {
            const {nodes, edges, options} = vis.network.convertDot(network);
            const edgesToShow = showEdgesLabels ? edges : edges.map(edge => ({...edge, label: ''}));
            const data = {nodes, edges: edgesToShow};
            // you can extend the options like a normal JSON variable:
            const networkOptions = {
                ...options,
                layout: {
                    randomSeed: 0
                },
                nodes: {
                    shape: 'box',
                    color: {
                        border: '#9e9e9e',
                        background: '#BBDEFB'
                    },
                    size: 20
                },
                physics: {
                    stabilization: true,
                    barnesHut: {
                        springLength: Number(edgesLength)
                    }
                }
            };

            // create a network
            const visNetwork = new vis.Network(ref.current, data, networkOptions);

            if (onNodeDoubleClick || onEdgeDoubleClick) {
                visNetwork.on("doubleClick", params => {
                    if (params.nodes[0] && onNodeDoubleClick) {
                        onNodeDoubleClick(params.nodes[0]);
                    } else if (params.edges[0] && onEdgeDoubleClick) {
                        console.log({edges, esge: params.edges[0]});

                        onEdgeDoubleClick(edges.find(edge => edge.id === params.edges[0]));
                    }
                });
            }
        }
    }, [network, ref, onNodeDoubleClick, onEdgeDoubleClick, showEdgesLabels, edgesLength]);

    return (
        <div
            style={style}
            ref={ref}
        />
    );
};

NetworkGraphVisualization.propTypes = {
    network: PropTypes.string
};

export default NetworkGraphVisualization;
