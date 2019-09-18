import React, {useEffect, useRef} from 'react';
import vis from 'vis-network';
import PropTypes from "prop-types";

// const network = `
// digraph {
//   node [shape=circle fontsize=16]
//   edge [length=100, color=gray, fontcolor=black]
//   A -> A[label=0.5];
//   B -> B[label=1.2] -> C[label=0.7] -- A;
//   B -> D;
//   D -> {B; C}
//   D -> E[label=0.2];
//   F -> F;
//   A [
//     fontcolor=white,
//     color=red,
//   ]
// }
// `;

/**
 * Draws a network visualization using vis-network
 * @param network   dot-notation of the network to draw
 * @returns {*}
 * @constructor
 */
const NetworkGraphVisualization = ({network, ...otherProps}) => {
    const ref = useRef(null);

    const draw = (dotNotation) => {
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
        new vis.Network(ref.current, data, options);
    };

    useEffect(() => {
        if (network) draw(network);
    }, [network]);

    return <div {...otherProps} ref={ref} />;
};

NetworkGraphVisualization.propTypes = {
    network: PropTypes.string
};

export default NetworkGraphVisualization;
