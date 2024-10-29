const express = require('express');
const app = express();
const port = 3000;

let uptimeSeconds = 0;
let startTime = Date.now();
const COMPLETION_TIME = 15 * 1000;

//function to get a random status
const getRandomStatus = () => {
    const statuses = ['pending', 'error', 'completed'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
};

//Route to start the process
app.get('/send', (req, res) => {
    const status = "begun";
    startTime = Date.now();
    res.json({ status });
});

//Route to check the status
app.get('/status', (req, res) => {
    const elapsedTime = Date.now() - startTime;
    let status = "pending";

    if (elapsedTime >= COMPLETION_TIME) {
        status = Math.random() > 0.1 ? "completed" : "error";
    }

    res.json({ status });
});

//Only start the server if not in a test environment
if (require.main === module) {
    app.listen(port, (error) => {
        if (error) {
            console.log('Something went wrong', error);
        } else {
            console.log(`Server is listening on port ${port}`);
        }
    });
}
//Export the app for testing
module.exports = app;  
