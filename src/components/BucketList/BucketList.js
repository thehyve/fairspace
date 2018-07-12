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
            console.log(this.state.bucketList)
        });
    }

    render() {
        return (
            <ul>
                {this.state.bucketList.map(function (bucket) {
                    return <li>{bucket.name}<p><i>Created on: {bucket.creationDate.toLocaleDateString()}</i></p></li>
                })
                }
            </ul>
        );
    }
}

export default BucketList;
