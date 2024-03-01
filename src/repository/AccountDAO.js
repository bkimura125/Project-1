const { DynamoDBClient, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);
const TableName = "EmployeeDatabase";
const logger = require("../util/Logger");

// READ
async function getAccountfromDB(accountInfo) {
    const command = new GetCommand({
      TableName,
      Key: accountInfo
    });
    try {
      const account = await documentClient.send(command);
      if(account.Item !== undefined) return account.Item;
    } catch (error) {
      console.error(`Account retrieval failed. Error: ${error}`);
      return null;
    }
  }

async function getRolefromDB(accountInfo) {
  try {
    const account = await getAccountfromDB(accountInfo);
    return account.role;
  } catch (error) {
    console.error(`Role retrieval failed. Error: ${error}`);
    return null;
  }
}

async function getUsernamefromDB(accountInfo) {
    try {
        const account = await getAccountfromDB(accountInfo);
        return account.username;
    } catch (error) {
        console.error(`Username retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getPasswordByUsername(accountInfo) {
    try {
        const account = await getAccountfromDB(accountInfo);
        return account.password;
    } catch (error) {
        console.error(`Password retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getLoginStatusfromDB(accountInfo) {
    try {
      const account = await getAccountfromDB(accountInfo);
      return account.isloggedin;
    } catch (error) {
      console.error(`Login Status retrieval failed. Error: ${error}`);
      return null;
    }
}

async function createAccountinDB(accountInfo) {
  const command = new PutCommand({
    TableName,
    Item: accountInfo
  });
  try {
    const account = await documentClient.send(command);
    return account;
  } catch (error) {
    logger.error("Unable to create Account. Error:", JSON.stringify(error, null, 1));
    return null;
  }
}

async function setLoginStatus(accountInfo){
    let status = await getLoginStatusfromDB(accountInfo);
    if(status === false){    //If not already logged in
        const params = {
            TableName,
            Key: accountInfo,
            UpdateExpression: "set isloggedin = :isloggedin",
            ExpressionAttributeValues: {":isloggedin": true}
        };
        const command = new UpdateCommand(params);
        try{
            const account = await documentClient.send(command);
            return account;
        }catch(error){
            console.error("Unable to set Login Status. Error:", JSON.stringify(error, null, 1));
            return null;
        }
    } else {
        console.log(`Already logged in as user: ${accountInfo.username}`);
        return null;
    }
}

async function setLogoutStatus(accountInfo){
    let status = await getLoginStatusfromDB(accountInfo);
    if(status === true){    //If already logged in
        const params = {
            TableName,
            Key: accountInfo,
            UpdateExpression: "set isloggedin = :isloggedin",
            ExpressionAttributeValues: {":isloggedin": false}
        };
        const command = new UpdateCommand(params);
        try{
            const account = await documentClient.send(command);
            return account;
        }catch(error){
            console.error("Unable to set Login Status. Error:", JSON.stringify(error, null, 1));
            return null;
        }
    } else {
        console.log(`Already logged out`);
        return null;
    }
}

async function queryEmployeesByRole(role) {

    // A GSI is created using role as the partition key and join_date as the sort key
    // The GSI does not need unique keys
  const params = {
    TableName: "EmployeeDatabase",
    IndexName: "RoleJoinIndex",
    KeyConditionExpression: "#role = :role",
    ExpressionAttributeNames: {
      "#role": "role",
    },
    ExpressionAttributeValues: {
      ":role": { S: role },
    },
  };

  const command = new QueryCommand(params);
  try {
    const employees = await documentClient.send(command);
    if(employees.Items.length >= 1) return employees.Items;
    else{
      console.log(`No ${role}s found`);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
    getAccountfromDB,
    getRolefromDB,
    getUsernamefromDB,
    getLoginStatusfromDB,
    getPasswordByUsername,
    createAccountinDB,
    setLoginStatus,
    setLogoutStatus,
    queryEmployeesByRole,
};