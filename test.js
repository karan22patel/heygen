const request = require('supertest');
const fs = require('fs');
const app = require('./serverTest'); 
const apiURL = 'http://localhost:3000/send';
const apiURL2 = 'http://localhost:3000/status';

jest.setTimeout(20000);

describe('Client Library Tests', () => {
    let originalState;
    const stateFilePath = './state.json';

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
    });

    it('should initiate the process and eventually complete or return error', async () => {
        //Send a request to /send to start the process
        const sendResponse = await request(app).get('/send');
        expect(sendResponse.status).toBe(200);
        expect(sendResponse.body.status).toBe('begun');

        //Simulate the behavior of your client library's interval polling
        const completionTime = 15000;
        let statusResponse;
        let completed = false;
        const startTime = Date.now();

        while (!completed && Date.now() - startTime < completionTime + 5000) {
            //Polling the /status endpoint
            statusResponse = await request(app).get('/status');
            expect(statusResponse.status).toBe(200);

            const { status } = statusResponse.body;
            console.log(`Checked status: ${status}`);

            if (status === 'completed' || status === 'error') {
                completed = true;
            } else {
                //Wait before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        //Assert that we eventually got a completed or error status
        expect(completed).toBe(true);
        expect(['completed', 'error']).toContain(statusResponse.body.status);
    });
});
