import React, {Component} from 'react';
import Collection from "./Collection";

/**
 * Requires a configured s3 client. See WithS3Client
 */
class CollectionList extends Component {
    constructor(props) {
        super(props);
        this.s3Client = props.s3;

        this.state = {
            loading: false,
            error: false,
            collections: []
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        this.s3Client.listBuckets((err, buckets) => {
            if (err) {
                console.error(err);
                this.setState({error: true, loading: false});
            } else {
                this.setState({loading: false, collections: buckets.Buckets});
            }
        });
    }

    render() {
        if(this.state.loading) {
            return (<div>Loading...</div>)
        } else if(this.state.error) {
            return (<div>An error occurred while loading collections</div>)
        } else if(!this.state.collections || this.state.collections.length === 0) {
            return (<div>No collections</div>)
        } else {
            return (
                <ul>
                    {this.state.collections.map(function (collection) {
                        return (<li key={collection.Name}><Collection collection={collection} /></li>)
                    })}
                </ul>
            );
        }
    }
}

export default CollectionList;
