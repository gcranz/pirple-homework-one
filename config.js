/*
* create and export configuration variables
*/

//container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'envName' : 'quality',
  'httpsPort' : 3443

};

// Production environment
environments.production = {
  'httpPort' : 8080,
  'envName' : 'production',
  'httpsPort' : 8443
};

// determine which environment was passed as a command line arg
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of those above, else default to quality
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module
module.exports = environmentToExport;

