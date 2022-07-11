// Workaround for https://github.com/remarkjs/react-markdown/issues/635
module.exports = {
    moduleNameMapper: {
        'react-markdown': './__mocks__/react-markdown.js',
    },
};
