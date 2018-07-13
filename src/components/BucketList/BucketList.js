import React, {Component} from 'react';
import listCollections from "../App/ListCollections";

class BucketList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bucketList: []
        };
    }

    componentDidMount() {
        let bucketListPromise = listCollections();
        bucketListPromise.then((successBucketList) => {
            this.setState({
                bucketList: successBucketList
            });
        });
    }

    render() {
        return (
            <ul>
                {this.state.bucketList.map(function (bucket) {
                    return <li>{bucket.Name}<p><i>Created on: {bucket.CreationDate.toLocaleDateString()}{}</i></p></li>
                })
                }
            </ul>
        );
    }
}

export default BucketList;
