import * as AWS from 'aws-sdk'
import config from "../../config";

function listCollections() {
    return new Promise((resolve, reject) => {

        let endpoint = config.urls.storage;
        let retrieveExternalConfig = config.retrieveExternalConfig;

        if (retrieveExternalConfig !== "") {
            fetch(retrieveExternalConfig)
                .then(response => {
                    endpoint = response.data.urls.storage;
                });
        }

        const s3Client  = new AWS.S3({
            accessKeyId: 'AKIAIOSFODNN7EXAMPLE' ,
            secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' ,
            endpoint: endpoint,
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
            httpOptions: {
                xhrWithCredentials: true,
            }
        });


        s3Client.listBuckets((err, buckets) => {
            if (err) {
                reject(err);
                console.error(err);
            }
            resolve(buckets.Buckets)
        })
    });
}

export default listCollections;
