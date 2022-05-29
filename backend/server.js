const AWS = require('aws-sdk');
const cors=require('cors')
AWS.config.update( {
  region: 'us-east-1'
});
AWS.config.apiVersions = {
  ivs: '2020-07-14',
  // other service API versions
}; 

var ivs = new AWS.IVS();
var express = require('express');
const item = require('../mearn-app/client/models/item');
var app = express();
app.use(express.json())
let response
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.post('/',async(req, res)=> {
  console.log(req)
  let recordingConfigurationArn= "arn:aws:ivs:us-east-1:334424422278:recording-configuration/FlSJ3iWmkpZd"
  var params = {
    latencyMode: "NORMAL",
    recordingConfigurationArn: recordingConfigurationArn,
    name:req.body.username,
    type: "BASIC"
  };
  ivs.createChannel(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      console.log(data)
      let IngestServerUrl = "rtmps://"+data.channel.ingestEndpoint+":443/app/"
           response={
            IngestServerUrl : IngestServerUrl,
            streamKey : data.streamKey.value
          }
      res.send(response)};           // successful response
  });
  
})
app.post('/stream',async(req,res)=>{
  var params = {
    channelArn: 'arn:aws:ivs:us-east-1:334424422278:channel/Cm9zns7c8C4P' /* required */
  };
  ivs.getStream(params, function(err, data) {
    if (err) {
      
      console.log(err)
    }; // an error occurred
    res.send(data);           // successful response
  });
})
app.get('/channels',async(req, res)=>{
  var params = {};
  ivs.listChannels(params,async function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      let channels=data.channels
      let array=[]
      // var params = {
      //     arn:channels[item].arn
      //   };
      for(const item in channels){
        var arn=channels[item].arn
        array.push(arn)
      }
      
      res.send(array)
    }           // successful response
  });
})
app.post('/plays',async(req, res)=>{
  var params = {arn:req.body.arn};
  ivs.getChannel(params,async function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      let response={
        playURL:data.channel.playbackUrl,
        name:data.channel.name
      }
      res.send(response)
    }           // successful response
  });
})
app.post('/deletechannel',async(req, res)=>{
  var params = {arn:req.body.arn};
  ivs.deleteChannel(params,async function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      res.send(data)
    }           // successful response
  });
})


var port = process.env.port || 5000;
app.listen(port, function () { return console.log("server started on port ".concat(port)); });

