const apiURL = 'http://localhost:3000/send';
const apiURL2 = 'http://localhost:3000/status';

const fs = require('fs');
const maxInterval = 60000; 
const stateFilePath = './state.json';
let maxTime = 60000;
let optTime = 10000;
let minTime = 1000;
let iterations = 0;

//function to load former parameters if they exist
function loadState() {
    if (fs.existsSync(stateFilePath)) {
        const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        maxTime = state.maxTime || maxTime;
        optTime = state.optTime || optTime;
        minTime = state.minTime || minTime;
    }
}

//function to save the parameters for future iterations
function saveState() {
    const state = { maxTime, optTime, minTime };
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
}

//fetch the API URL
fetch(apiURL).then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}).then(data => {
    console.log(data);
    const status = data.status;
    //if endpoint has been reached set parameters
    if (status === "begun") {
        console.log("Request has been initiated");
        loadState();
        //function will call the api 4 times with fast timer, after that it will use slowTime.
        let fastTime = minTime;
        let slowTime = 2000;
        let time = minTime;
        
        //function calling the API
        /*
        Essentially the status will be checked 3 times from min to opt time with equal time spacing, 
        then a fourth time after with an equal time increment. After it is considered that the process will take
        longer and therefore the status will be checked incrementally using a slow time.
        Based on various situations the min and opt time will be updated. This is done that subsequent function calls
        will be much more efficient if consistent in terms of timing. 

        */
        function checkStatus() {
            //fetch api
            fetch(apiURL2).then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            }).then(statusData => {
                //if the status is completed then save the min and opt time parameters
                if (statusData.status === "completed") {
                    console.log("Process is completed");

                    let temp1 = minTime;
                    if (iterations === 0) {
                        minTime = 0;
                    } else if (iterations === 1) {
                        minTime = minTime;
                    } else if (iterations === 2) {
                        minTime = minTime + time;
                    } else if (iterations === 3) {
                        minTime = minTime + 2 * time;
                    } else {
                        minTime = optTime;
                    }
                    if(iterations >= 5){
                        optTime = 4 * fastTime + temp1 + slowTime * (iterations - 4);
                    }
                    else{
                        optTime = fastTime * iterations + temp1;
                    }
                    
                    saveState();
                    //if the status is error then save the min and opt time parameters
                } else if (statusData.status === "error") {
                    console.log("An error was encountered");

                    let temp1 = minTime;
                    if (iterations === 0) {
                        minTime = 0;
                    } else if (iterations === 1) {
                        minTime = minTime;
                    } else if (iterations === 2) {
                        minTime = minTime + time;
                    } else if (iterations === 3) {
                        minTime = minTime + 2 * time;
                    } else {
                        minTime = optTime;
                    }
                    if(iterations >= 5){
                        optTime = 4 * fastTime + temp1 + slowTime * (iterations - 4);
                    }
                    else{
                        optTime = fastTime * iterations + temp1;
                    }

                    saveState();
                    //if status is pending, increment iterations and ensure fast time is correct. 
                } else {
                    console.log("Pending");
                    iterations += 1;

                    fastTime = (optTime - minTime) / 3;
                    if(iterations >= 5){
                        time = slowTime;
                    }
                    else{
                        time = fastTime;
                    }
                    //wait and call function after time.
                    setTimeout(checkStatus, time);
                }
            }).catch(error => {
                console.error('Error while checking status:', error);
            });
        }

        // Start the first status check
        setTimeout(checkStatus, time);
    }
}).catch(error => {
    console.error('Error:', error);
});