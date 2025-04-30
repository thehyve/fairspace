/* eslint-disable */
// Mock implementation of cheerio/lib/utils
module.exports = {
    // Provide minimal implementation of the utils module
    domEach: (arr, fn) => {
        Array.from(arr).forEach(fn);
    },
    cloneDom: dom => dom,
    isTag: () => true,
    isHtml: () => false,
    uniqueSort: arr => arr,
    compareDocumentPosition: () => 0,
    removeSubsets: arr => arr
    // Add any other functions that might be needed
};
/* eslint-enable */
