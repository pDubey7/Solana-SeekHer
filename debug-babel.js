const fs = require('fs');
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

// Hook Node's require resolution to see what is trying to be resolved
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.includes('plugin')) {
    fs.appendFileSync('babel-trace.log', `Resolving plugin: ${request} from ${parent ? parent.filename : 'unknown'}\n`);
  }
  return originalResolveFilename.apply(this, arguments);
};

// Start the autolinking script
require('expo/bin/autolinking');
