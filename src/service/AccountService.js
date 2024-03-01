const { getAccountfromDB,
    getRolefromDB,
    getUsernamefromDB,
    getLoginStatusfromDB,
    getPasswordByUsername,
    createAccountinDB,
    setLoginStatus,
    setLogoutStatus,
    queryEmployeesByRole} = require("../repository/AccountDAO");


async function getAccountInfo(key){
    try{
        let account = await getAccountfromDB(key);
        return account;
    }catch(error){
        console.error(`Account Retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getUsername(key){
    try{
        let username = await getUsernamefromDB(key);
        return username;
    }catch(error){
        console.error(`Username Retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getRole(key){
    try{
        let role = await getRolefromDB(key);
        return role;
    }catch(error){
        console.error(`Role Retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getPassword(key){
    try{
        let password = await getPasswordByUsername(key);
        return password;
    }catch(error){
        console.error(`Password Retrieval failed. Error: ${error}`);
        return null;
    }
}

async function getLoginStatus(key){
    try{
        let status = await getLoginStatusfromDB(key);
        return status;
    }catch(error){
        console.error(`Login Status Retrieval failed. Error: ${error}`);
        return null;
    }
}

async function createAccount(accountInfo) {
    let user = await getAccountfromDB({username: accountInfo.username});
    let new_user = accountInfo;
    try{
        if(!user){
            if(accountInfo.role === undefined){
                new_user = {
                    username: accountInfo.username,
                    password: accountInfo.password,
                    isloggedin: false,
                    role: "employee"
                }
            } else {
                new_user = {
                    username: accountInfo.username,
                    password: accountInfo.password,
                    isloggedin: false,
                    role: accountInfo.role
                }
            }
            let account = await createAccountinDB(new_user);
            return true;
        } else{
            console.log(`Username ${user.username} is already taken`);
            return null;
        }
    }catch(error){
        console.error(`Account Creation failed. Error: ${error}`);
        return null;
    }
}

async function login(accountInfo){
    let user = await getAccountfromDB({username: accountInfo.username,});
    try{
        if(user){
            if(user.password === accountInfo.password){
                let account = await setLoginStatus({username: accountInfo.username});
                if(account !== null) return accountInfo.username;
                else return null;
            } else {
                return null;
            }
        } else return null;
    }catch(error){
        console.error(`Account Login failed. Error: ${error}`);
        return null;
    }
}

async function logout(key){
    const username = key.username;
    const status = await getLoginStatusfromDB({username});
    try{
        if(status){
            setLogoutStatus({username});
            console.log(`Logging out: ${username}`);
            return true;
        } else {
            console.log(`User ${username} is already logged out`);
            return null;
        }
    }catch(error){
        console.error(`Account Logout failed. Error: ${error}`);
        return null;
    }
}

module.exports = {
    getRole,
    getUsername,
    getPassword,
    getAccountInfo,
    getLoginStatus,
    createAccount,
    login,
    logout
}