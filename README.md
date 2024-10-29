# heygen
HeyGen Takehome Assignment
## How to Use:
client.js is the initial file used for development and testing.
clientLibrary.js is the first library developed without any inputs
clientLibrary1.js is the second library developed that takes api urls as an input.
server.js is the server created to mimic an actual production server
serverTest.js is the test server used for the integration tests
test.js is the integration test testing client.js
test2.js is the integration test testing clientLibrary.js
test3.js is the integration test testing cleintLibrary.js

How the logic works. Essentially, the program initially uses a constant time to check on the server's status. Based on the results, the information is saved and used for the next attempts. By saving the data we can probe how long it takes on average for subsequent events. If the server time does change due to increased processing times or congestion the algorithm would increase the time it takes to look for the server. 
