const fs = require('fs');
const fixtureDir = __dirname + '/../fixtures';

const load = filename  => fs.readFileSync(fixtureDir + '/' + filename).toString()
const asJSON = input => JSON.parse(input)

module.exports = {
    load: load,
    asJSON: filename => asJSON(load(filename))
};
