import React from 'react';
import CollectionList from "../../components/CollectionList/CollectionList";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";

function FileBrowser(props) {
    function generateId() {
        return '' + (Math.random() * 10000000);
    }

    function handleAddClick(e) {
        props.s3.createBucket({
            'Bucket': generateId()
        }, (err, data) => {

        });
    }

    return (
        <div>
            <CollectionList s3={props.s3} />

            <Button variant="fab" color="primary" aria-label="Add" onClick={handleAddClick}>
                <Icon>add</Icon>
            </Button>
        </div>
    );
}

export default (FileBrowser);



