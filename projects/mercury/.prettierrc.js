module.exports = {
    // Global Prettier options
    printWidth: 120,
    singleQuote: true,
    trailingComma: 'none',
    bracketSpacing: false,
    semi: true,
    singleAttributePerLine: false,
    arrowParens: 'avoid',

    overrides: [
        {
            files: '*.js',
            options: {
                parser: 'flow'
            }
        }
    ]
};
