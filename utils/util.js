const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

module.exports = { delay };
