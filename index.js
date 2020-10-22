const engine = require('./engine');
const lsCommitTypes = require('./ls-commit-types.json');

module.exports = engine({
    types: lsCommitTypes.types,
    defaultType: process.env.CZ_TYPE,
    defaultScope: process.env.CZ_SCOPE,
    defaultDescription: process.env.CZ_DESCRIPTION,
    defaultBody: process.env.CZ_BODY,
});
