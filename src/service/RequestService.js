const { getRequestfromDB,
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
    queryRequestByStatus,} = require("../repository/RequestDAO");
const accountDAO = require('../repository/AccountDAO');
const RequestQueue = require('../util/RequestQueue');
const uuid = require("uuid");

const requestQueue = new RequestQueue();

async function getRequest(requestInfo){
    try{
        let request = await getRequestfromDB(requestInfo);
        return request;
    } catch(error){
        console.error(`Request retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getStatus(requestInfo){
    try{
        let reqStatus = await getRequestStatusfromDB(requestInfo);
        return reqStatus;
    } catch(error){
        console.error(`Status retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getUsername(requestInfo){
    try{
        let username = await getRequestUsernamefromDB(requestInfo);
        return username;
    } catch(error){
        console.error(`Username retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getAmount(requestInfo){
    try{
        let amount = await getRequestAmountfromDB(requestInfo);
        return amount;
    } catch(error){
        console.error(`Amount retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getDescription(requestInfo){
    try{
        let description = await getRequestDescriptionfromDB(requestInfo);
        return description;
    } catch(error){
        console.error(`Description retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getRequestByAccount(requestInfo){
    try{
        let username = requestInfo.username;
        let {requests} = await queryRequestByUsername(username);
        return requests;
    } catch(error){
        console.error(`Requests retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getRequestsByProcessed(requestInfo){
    try{
        let processed_status = requestInfo.process_status;
        let requests = await queryRequestByUsername(processed_status);
        return requests;
    } catch(error){
        console.error(`Requests retrieval failed. Error: ${error}`);
        return null;
    }
}

async function createRequest(requestInfo) {
    //existingRequest is null if there is no account with that info
    let existingRequest = await getRequestfromDB({request_id: requestInfo.request_id});
    if(existingRequest === null){
        let request = requestInfo;
        try{
            if(requestInfo.description === undefined){
                throw ReferenceError;
            }
        } catch(error){
            console.error(`No Description detected. Error: ${error}`);
            return false;
        }
        try{
            if(requestInfo.amount === undefined){
                throw ReferenceError;
            }
        } catch(error){
            console.error(`No Amount detected. Error: ${error}`);
            return false;
        }
        if(requestInfo && requestInfo.request_id === undefined){
            let requestId = uuid.v4();
            request = {
                request_id: requestId,
                username: requestInfo.username,
                description: requestInfo.description,
                amount: requestInfo.amount,
                process_status: false,
                request_status: "pending"
            }
            console.log(`No request_id detected. Generating request with id: ${requestId}`);
        } else{
            request = {
                request_id: requestInfo.request_id,
                username: requestInfo.username,
                description: requestInfo.description,
                amount: requestInfo.amount,
                process_status: false,
                request_status: "pending"
            }
            console.log(`Request_id detected. Creating request: ${request.request_id}`);
        }
        let form = await createRequestinDB(request);
        return request;
    } else {
        console.log(`Request id: ${existingRequest.request_id} is already taken`);
        return false;
    }
}

async function processRequest(processData){
    let requestId = processData.request_id;
    let outcome = processData.outcome;
    let process_status = await getProcessedStatus({request_id: requestId});
    if(process_status){
        console.log("Request has already been processed");
        return false;
    }
    if(outcome === "approved"){
        setRequestStatusApproved({request_id: requestId});
        setProcessedStatus({request_id: requestId});
        console.log("Approving Request");
         return true;
    } else if(outcome === "denied"){
        setRequestStatusDenied({request_id: requestId});
        setProcessedStatus({request_id: requestId});
        console.log("Denying Request");
        return true;
    } else{
        console.log("Invalid Outcome");
        return false;
    }
}

async function viewRequestQueue(){
    let username = await accountDAO.getLoggedInUsername();
    let credentials = await accountDAO.getRolefromDB({username});
    if(credentials === "manager"){
        let requests = await requestQueue.getAllRequests();
        return requests;
    } else{
        console.log("Invalid Credentials to view Request Queue");
        return [];
    }
}

module.exports = {
    getRequest,
    getStatus,
    getUsername,
    getAmount,
    getDescription,
    getRequestByAccount,
    getRequestsByProcessed,
    createRequest,
    processRequest,
    viewRequestQueue,
}