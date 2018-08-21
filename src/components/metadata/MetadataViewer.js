import React from 'react';
import combine from './MetadataUtils';


/**
 * This compp
 */
class MetadataViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.vocabulary = props.vocabulary;
        this.metadata = props.metadata;
        this.state = {
            properties: []
        };
    }

    componentWillMount() {
        combine(this.vocabulary, this.metadata)
            .then(props => this.setState({properties: props}));

    }

    renderValue(v) {
        return (<li key={v}>{v}</li>)
    }


    renderProperty(p) {
        const items = p.values.map(this.renderValue.bind(this));
        return (<li key={p.label}><b>{p.label}:</b><ul>{items}</ul></li>);
    }


    render() {
        return (
            <div>
                <ul>
                    {this.state.properties.map(this.renderProperty.bind(this))}
                </ul>
            </div>
        )
    }
}

export default MetadataViewer
