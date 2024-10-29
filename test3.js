const fs = require('fs');
const path = require('path');
const ClientLibrary = require('./clientLibrary1'); 
const app = require('./serverTest');
const request = require('supertest');

jest.setTimeout(20000); 

describe('ClientLibrary Integration Tests', () => {
    let originalState;
    const stateFilePath = path.join(__dirname, 'state.json');
    let server;

    beforeAll((done) => {
        //Start the server before running tests
        server = app.listen(3000, done);
    });

    beforeEach(() => {
        //Save the original state if it exists
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
    });

    afterAll(() => {
        //Close the server after all tests complete
        server.close();
    });

    it('should initiate the process and eventually reach a completed or error status', async () => {
        const client = new ClientLibrary();

        // Initiate the process with initiateProcess()
        await client.initiateProcess();

        //Simulate interval checking until status is completed or error, but without continuous polling
        const completionTime = 15000; // Max wait time of 15 seconds for completion
        let statusResponse;
        let completed = false;
        const startTime = Date.now();

        while (!completed && Date.now() - startTime < completionTime) {
            //Check the /status endpoint through the client library function
            statusResponse = await request(server).get('/status');
            expect(statusResponse.status).toBe(200);

            const { status } = statusResponse.body;
            console.log(`Checked status: ${status}`);

            if (status === 'completed' || status === 'error') {
                completed = true;
            } else {
                //Wait for 1 second before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        //Assert that the process eventually completes or encounters an error
        expect(completed).toBe(true);
        expect(['completed', 'error']).toContain(statusResponse.body.status);

        //Verify state persistence in the state file
        const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        expect(state).toBeDefined();
        expect(state.maxTime).toBeDefined();
        expect(state.optTime).toBeDefined();
        expect(state.minTime).toBeDefined();
    });
});
