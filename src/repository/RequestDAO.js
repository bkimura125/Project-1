const { DynamoDBClient, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);
const TableName = "RequestDatabase";
const logger = require("../util/Logger");

// READ
async function getRequestfromDB(key) {
    if(key.request_id === undefined) {
      console.log("Request without ID detected");
      return null;
    }
    const command = new GetCommand({
        TableName,
        Key: key
    });
    try {
        const request = await documentClient.send(command);
        if(request.Item !== undefined) return request.Item;
        else {
          //logger.log(`No request found`);
          return null;
        }
    } catch (err) {
        console.error(`Request retrieval failed. Error: ${err}`);
        return null;
    }
}

async function getRequestUsernamefromDB(key) {
    try {
        const request = await getRequestfromDB(key);
        return request.username;
    } catch (err) {
        console.error(`Username retrieval failed. Error: ${err}`);
        return null;
    }
}

async function getRequestStatusfromDB(key) {
    try {
        const request = await getRequestfromDB(key);
        return request.request_status;
    } catch (err) {
        console.error(`Status retrieval failed. Error: ${err}`);
        return null;
    }
}

async function getRequestDescriptionfromDB(key) {
    try {
        const request = await getRequestfromDB(key);
        return request.description;
    } catch (err) {
        console.error(`Description retrieval failed. Error: ${err}`);
        return null;
    }
}

async function getRequestAmountfromDB(key) {
    try {
        const request = await getRequestfromDB(key);
        return request.amount;
    } catch (err) {
        console.error(`Description retrieval failed. Error: ${err}`);
        return null;
    }
}

async function createRequestinDB(requestInfo) {
    const command = new PutCommand({
        TableName,
        Item: requestInfo
    });
    try {
        const request = await documentClient.send(command);
        return request;
    } catch (error) {
        logger.error("Unable to create Request. Error:", JSON.stringify(error, null, 1));
        return null;
    }
}

async function getProcessedStatus(requestKey){
    try {
        const request = await getRequestfromDB(requestKey);
        return request.process_status;
    } catch (err) {
        console.error(`Processed Status retrieval failed. Error: ${err}`);
        return null;
    }
}

async function setProcessedStatus(requestKey){
    const params = {
        TableName,
        Key: requestKey,
        UpdateExpression: "set process_status = :process_status",
        ExpressionAttributeValues: {":process_status": true}
    };
    const command = new UpdateCommand(params);
    try{
        const request = await documentClient.send(command);
        return request;
    }catch(error){
        console.error("Unable to set Request Processed Status. Error:", JSON.stringify(error, null, 1));
        return null;
  }
}

async function setRequestStatusApproved(key){
    const params = {
        TableName,
        Key: key,
        UpdateExpression: "set request_status = :request_status",
        ExpressionAttributeValues: {":request_status": "approved"}
    };
    const command = new UpdateCommand(params);
    try{
        const request = await documentClient.send(command);
        return request;
    }catch(error){
        console.error("Unable to set Request Approval Status. Error:", JSON.stringify(error, null, 1));
        return null;
    }
}

async function setRequestStatusDenied(key){
    const params = {
        TableName,
        Key: key,
        UpdateExpression: "set request_status = :request_status",
        ExpressionAttributeValues: {":request_status": "denied"}
    };
    const command = new UpdateCommand(params);
    try{
        const request = await documentClient.send(command);
        return request;
    }catch(error){
        console.error("Unable to set Request Denied Status. Error:", JSON.stringify(error, null, 1));
        return null;
    }
}

async function queryRequestByUsername(username) {
    const params = {
        TableName,
        IndexName: "UsernameIndex",
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: {
            "#username": "username",
        },
        ExpressionAttributeValues: {
            ":username": { S: username },
        },
    };

    const command = new QueryCommand(params);
    try {
        const {requests} = await documentClient.send(command);
        console.log("Requests");
        console.log(requests);
        console.log(`Type of Requests ${typeof requests}`);
        console.log("Items in requests");
        console.log(requests.Items);
        console.log(`Type of Requests ${typeof requests.Items}`);
        if(requests.Items.length >= 1){
            return requests.Items;
        }
        else{
            console.log(`${user} has not submitted any Requests`);
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function queryRequestByStatus(requestStatus) {
    const params = {
        TableName,
        IndexName: "StatusIndex",
        KeyConditionExpression: "#request_status  = :request_status ",
        ExpressionAttributeNames: {
            "#request_status ": "request_status ",
        },
        ExpressionAttributeValues: {
            ":request_status ": { S: requestStatus  },
        },
    };

    const command = new QueryCommand(params);
    try {
        const requests = await documentClient.send(command);
        if(requests.Items.length >= 1) return requests.Items;
        else{
            console.log(`There are no ${requestStatus} requests`);
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    getRequestfromDB,
    getRequestUsernamefromDB,
    getRequestDescriptionfromDB,
    getRequestAmountfromDB,
    getRequestStatusfromDB,
    getProcessedStatus,
    setProcessedStatus,
    createRequestinDB,
    setRequestStatusApproved,
    setRequestStatusDenied,
    queryRequestByUsername,
    queryRequestByStatus,
};