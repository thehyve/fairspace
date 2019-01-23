export default function (status, statusText, response) {
    return new window.Response(response, {
        status,
        statusText,
        headers: {
            'Content-type': 'application/json'
        }
    });
}
