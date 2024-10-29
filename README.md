# heygen
HeyGen Takehome Assignment

## Files explained:
client.js is the initial file used for development and testing.<br />
clientLibrary.js is the first library developed without any inputs. <br />
clientLibrary1.js is the second library developed that takes api urls as an input. (more functional)

server.js is the server created to mimic an actual production server<br />
serverTest.js is the test server used for the integration tests

test.js is the integration test testing client.js<br />
test2.js is the integration test testing clientLibrary.js<br />
test3.js is the integration test testing cleintLibrary1.js

## How the logic works. 
Essentially, the program initially uses a constant time to check on the server's status. Based on the results, the information is saved and used for the next attempts. By saving the data we can probe how long it takes on average for subsequent events. If the server time does change due to increased processing times or congestion the algorithm would increase the time it takes to look for the server. Likewise, if the subsequent probe is faster then the algorithm will ensure to save the findings for the next iterations. By using calculating minimum and optimal time values we are able to determine the expected range of time values for completion. Moreover, based on the range of values the api will be called accordingly. 

For instance if minTime = 11 seconds and optTime = 14 seconds, the program will call the API at 11, 12, 13, 14 & 15. After 15 seconds the Timer will "slow down" into a stable time of 2 seconds (any arbitrally set value). 17, 19, 21... Please note the api call at 15 seconds is intentional. If the algorithm is shown to be error or success at 21 then the new optTime will be 21 seconds with minTime becoming the old optTime which is 14 seconds. These values are saved for subsequent uses of the library. Depending on when the API call succeeds the minTime and optTime will be updated accordingly. 

The slow-down function is used to ensure that if the values for minTime and optTime get too close to each other and the server response is slower than expected then it will not trigger the API call as frequently compared to the first 5 calls. 

*Perhaps an exponential or cubic function could also be implemented to adjust the timings similar to the idea of TCP cubic congestion control. This method may be more robust.

## Usage of the files.
To run server.js you can do: node server.js<br />
To run client.js you can use: node client.js

To run test you can do: npm test<br />
to run test2 you can do: npm run test2<br />
To run test3 you can do: npm run test3

To use clientLibrary1: Sample usage is found in index.js<br />
To run index.js, you can do node: index.js<br />
To use client library: follow index.js but remove input URL's

state.json is the save file for the min and optimal times. *A maximum time was also saved for the intention of stopping the function if it takes more than max Time, (not implemented). 

