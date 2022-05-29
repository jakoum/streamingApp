var express = require('express');
const AWS = require('aws-sdk');
const cors=require('cors')
AWS.config.update( {
  region: 'us-east-1'
});
const registerRes=require('./services/register');
const loginRes=require('./services/login')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'users-auth';
var app = express();
app.use(express.json())
app.use(cors())
app.post('/login',async(req, res)=>{
    res.send(await loginRes.login(req.body))
  
  })
app.post('/register',async(req, res)=>{
    
      res.send(await registerRes.register(req.body))
    
  })
var port = process.env.port || 5001;
app.listen(port, function () { return console.log("server started on port ".concat(port)); });

