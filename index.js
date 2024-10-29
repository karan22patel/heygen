//Importing the ClientLibrary class
const ClientLibrary = require('./clientLibrary');

//Define the API URLs
const apiURL = 'http://localhost:3000/send';
const apiURL2 = 'http://localhost:3000/status';

//Create an instance of ClientLibrary with the API URLs
const client = new ClientLibrary(apiURL, apiURL2);

//Start the process by calling initiateProcess
client.initiateProcess();