const AWS = require('aws-sdk');
AWS.config.update( {
  region: 'us-east-1'
});
const bcrypt=require("bcryptjs");
const { generateToken } = require('./auth');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'authen';
async function login(user){
  const username=user.username
  const email=user.email
  const password=user.password
  if(!user || !email || !password){
    return {message:"all fienlds are required"}
  }
    let dynamouser
  const list=await getUsers();
  console.log(list)
  const list1= JSON.parse(list.body)
 
  const list2=list1.users
   console.log(list2)
for(const item of list2){
  if(item.email==email){
    dynamouser=item
  }
}
  if(!dynamouser || !dynamouser.email){
    return {message:"user does not exist"}
  }
  if(!bcrypt.compareSync(password,dynamouser.password)){
    return {message:'password is incorrect'}
  }

  const userInfo={
  username:dynamouser.username,
  name:dynamouser.name,
  }
  const token=generateToken(userInfo)
  const response={
    user:userInfo,
    token:token
  }
console.log(response)
  return response

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

async function getUser(username){
    const params = {
        TableName: dynamodbTableName,
        key:{ username:username}
      }
      return await dynamodb.get(params).promise().then(res=>{
        return res.Item
      },error=>{
        console.error('there is an error',error)
      })
    
    }
    module.exports.login=login
    