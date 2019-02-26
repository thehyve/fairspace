export const mockResponse = (response, status = 200, statusText = 'OK', headers = {'Content-type': 'application/json'}) => {
    return new window.Response(response, {
        status,
        statusText,
        headers
    });
};
