const AWS = require('aws-sdk');
AWS.config.update( {
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'authen';

const bcrypt=require("bcryptjs")
async function register(userInfo) {
  
  const name=userInfo.name
  const email=userInfo.email
  const username=userInfo.username
  const password=userInfo.password
  const userId=userInfo.userId
  if(!name || !email || !username || !password){
    return buildResponse(401,{message:'all fiels are required'})
  }
  let dynamouser
  const list=await getUsers();
  const list1= JSON.parse(list.body)
  const list2=list1.users
for(const item of list2){
  if(item.userId==userId || item.username==username){
    dynamouser=item
  }
}
  
  if(dynamouser && dynamouser.username){
    return buildResponse(401,{message:'username already exists'});
  }
  const encryptedPW=bcrypt.hashSync(password.trim(),10);
  const user={
    userId:userId,
    name:name,
    username:username,
    email:email,
    password:encryptedPW
} 
const saveUserResponse=await saveUser(user);

if(!saveUserResponse){
  return buildResponse(503,{message:'server error try again later'})
}
else 
return buildResponse(200,'user registred')

}

async function saveUser(requestBody) {
const params = {
  TableName: dynamodbTableName,
  Item: requestBody
}
return await dynamodb.put(params).promise().then(() => {
  const body = {
    Operation: 'SAVE',
    Message: 'SUCCESS',
    Item: requestBody
  }
  return true
}, (error) =>{return false})
}

async function scanDynamoRecords(scanParams, itemArray) {
try {
  const dynamoData = await dynamodb.scan(scanParams).promise();
  itemArray = itemArray.concat(dynamoData.Items);
  if (dynamoData.LastEvaluatedKey) {
    scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
    return await scanDynamoRecords(scanParams, itemArray);
  }
  return itemArray;
} catch(error) {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
}
}
async function getUsers() {
const params = {
  TableName: dynamodbTableName
}
const allusers = await scanDynamoRecords(params, []);
const body = {
  users: allusers
}
return buildResponse(200, body);
}

function buildResponse(statusCode, body) {
return {
  statusCode: statusCode,
  headers: {
    'Content-Type': 'application/json',
    "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  },
  body: JSON.stringify(body)
}
}
module.exports.register=register