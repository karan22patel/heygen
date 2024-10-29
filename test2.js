const request = require('supertest');
const fs = require('fs');
const path = require('path');
const ClientLibrary = require('./clientLibrary'); 
const app = require('./serverTest');

const stateFilePath = path.join(__dirname, 'state.json');

jest.setTimeout(30000); 

describe('ClientLibrary Integration Tests', () => {
    let originalState;
    let server;

    beforeEach(() => {
        //Save the original state if exists
        if (fs.existsSync(stateFilePath)) {
            originalState = fs.readFileSync(stateFilePath, 'utf-8');
        }
        //Reset the state file before each test
        fs.writeFileSync(stateFilePath, JSON.stringify({}));
    });

    afterEach(() => {
        //Restore the original state after each test
        if (originalState) {
            fs.writeFileSync(stateFilePath, originalState);
        } else {
            fs.unlinkSync(stateFilePath);
        }
        //Close the server if it's running
        if (server) {
            server.close();
        }
    });

    beforeAll((done) => {
        //Start the server before running tests
        server = app.listen(3000, done);
    });

    it('should initiate the process and check status correctly', async () => {
        const client = new ClientLibrary(); // Create an instance of ClientLibrary

        //Send a request to /send to start the process
        const sendResponse = await request(server).get('/send');
        expect(sendResponse.status).toBe(200);
        expect(sendResponse.body.status).toBe('begun');

        // Call the initiateProcess method
        await client.initiateProcess(); 

        //Wait for the process to complete or error
        let completed = false;
        const completionTime = 15000; 
        const checkInterval = 1000;

        const startTime = Date.now();

        while (!completed && Date.now() - startTime < completionTime + 5000) {
            const statusResponse = await request(server).get('/status');
            expect(statusResponse.status).toBe(200);
            const { status } = statusResponse.body;
            console.log(`Checked status: ${status}`);

            if (status === 'completed' || status === 'error') {
                completed = true;
            } else {
                await new Promise(resolve => setTimeout(resolve, checkInterval));
            }
        }

        //Assert that we eventually got a completed or error status
        expect(completed).toBe(true);
        const finalStatusResponse = await request(server).get('/status');
        expect(['completed', 'error']).toContain(finalStatusResponse.body.status);
    });
});
