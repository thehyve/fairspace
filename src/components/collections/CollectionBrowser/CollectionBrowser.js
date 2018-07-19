import React from 'react';
import CollectionList from "../CollectionList/CollectionList";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.s3Client = props.s3;

        // Initialize state
        this.state = {
            loading: false,
            error: false,
            collections: []
        };
    }

    componentDidMount() {
        this.loadCollections();
    }

    loadCollections() {
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

    generateId() {
        return '' + (Math.random() * 10000000);
    }

    handleAddClick(e) {
        this.s3Client.createBucket({
            'Bucket': this.generateId()
        }, (err) => {
            if(err) {
                console.error("An error occurred while creating a bucket", err);
            } else {
                // Load collections after creating a bucket
                this.loadCollections();
            }
        });
    }

    render() {
        // Actual contents
        let contents;
        if(this.state.loading) {
            contents = (<Typography variant="body2" paragraph={true} noWrap>Loading...</Typography>)
        } else if(this.state.error) {
            contents = (<Typography variant="body2" paragraph={true} noWrap>An error occurred</Typography>)
        } else {
            contents = (<div>
                    <CollectionList collections={this.state.collections}/>

                    <Button variant="fab" color="primary" aria-label="Add" onClick={this.handleAddClick.bind(this)}>
                        <Icon>add</Icon>
                    </Button>
                </div>)
        }

        // Markup and title
        return (
            <div>
                <Typography variant="title" paragraph={true} noWrap>{'Collections overview'}</Typography>

                {contents}
            </div>
        );
    }
}

export default (CollectionBrowser);



