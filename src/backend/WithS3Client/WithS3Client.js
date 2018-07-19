import React from "react";
import AWS from "aws-sdk/index";
import Config from '../../components/generic/Config/Config';

/**
 * Passes a configured S3 client into the childrens props
 *
 * Each child will receive a property `s3` with a reference
 * to a configured AWS S3 client.
 */
class WithS3Client extends React.Component {
    static s3Client  = new AWS.S3({
        accessKeyId: 'not-needed' ,
        secretAccessKey: 'due-to-oauth-authentication' ,
        endpoint: "/",
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        httpOptions: {
            xhrWithCredentials: true,
        }
    });

    constructor(props) {
        super(props);
        this.props = props;

        WithS3Client.s3Client.endpoint = new AWS.Endpoint(Config.get().urls.storage);
    }

    render() {
        if(React.Children.count(this.props.children) === 0) {
            return null;
        }

        return React.Children.map(
            this.props.children,
            child => {
                if(typeof child === 'object') {
                    return React.cloneElement(child, {s3: WithS3Client.s3Client});
                } else {
                    return child;
                }
            }
        );
    }
}

export default WithS3Client
