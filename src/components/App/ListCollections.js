import * as minio from 'minio'

function listCollections() {
    return new Promise((resolve, reject) => {
        const minioClient = new minio.Client({
            endPoint: '127.0.0.1',
            port: 9000,
            secure: false,
            accessKey: 'AKIAIOSFODNN7EXAMPLE',
            secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        });

        minioClient.listBuckets((err, buckets) => {
            if (err) {
                reject(err);
                console.error(err);
            }
            resolve(buckets)
        });
    });
}

export default listCollections;
