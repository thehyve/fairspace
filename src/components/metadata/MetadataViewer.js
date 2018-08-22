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
            .then(props => {
                if (this.willUnmount) {
                    return
                }
                this.setState({properties: props});
            });
    }

    componentWillUnmount() {
        this.willUnmount = true
    }

    static renderValue(v) {
        return MetadataViewer.isValidUrl(v)
            ? (<a href={MetadataViewer.navigableLink(v)}>{v}</a>)
            : (<li key={v}>{v}</li>)
    }

    static isValidUrl(s) {
        try {
            new URL(s);
            return true;
        } catch (_) {
            return false;
        }
    }

    static navigableLink(link) {
        return link.startsWith(window.location.origin)
            ? link.replace('/iri/', '/metadata/')
            : link
    }


    renderProperty(p) {
        const items = p.values.map(MetadataViewer.renderValue.bind(this));
        return (<li key={p.label}><b>{p.label}:</b>
            <ul>{items}</ul>
        </li>);
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
