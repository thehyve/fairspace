import React, {useEffect, useRef} from 'react';
import vis from 'vis-network';
import PropTypes from "prop-types";

const draw = (dotNotation, ref, onSelect) => {
    // provide data in the DOT language
    const {nodes, edges, options} = vis.network.convertDot(dotNotation);

    const data = {nodes, edges};

    // you can extend the options like a normal JSON variable:
    options.physics = {
        stabilization: false,
        barnesHut: {
            springLength: 200
        }
    };

    // create a network
    // eslint-disable-next-line no-new
    const visNetwork = new vis.Network(ref.current, data, options);

    if (onSelect) {
        // Bind select event handler, while returning all known information on
        // selected edges and nodes
        visNetwork.on("select", params => {
            onSelect({
                ...params,
                nodes: params.nodes.map(nodeId => nodes.find(node => node.id === nodeId)),
                edges: params.edges.map(edgeId => edges.find(edge => edge.id === edgeId))
            });
        });
    }
};

/**
 * Draws a network visualization using vis-network
 * @param network   dot-notation of the network to draw
 * @returns {*}
 * @constructor
 */
const NetworkGraphVisualization = ({network, onSelect, ...otherProps}) => {
    const ref = useRef(null);

    useEffect(() => {
        if (network) draw(network, ref, onSelect);
    }, [network, ref, onSelect]);

    return <div {...otherProps} ref={ref} />;
};

NetworkGraphVisualization.propTypes = {
    network: PropTypes.string
};

export default NetworkGraphVisualization;
