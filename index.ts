let createApi = require('./api/createCase');
let readApi = require('./api/readCase');
let updateApi = require('./api/updateCase');
let deleteApi = require('./api/deleteCase');
let getCasesApi = require('./api/getCases');


let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let bodyParser= require('body-parser');
 
function sucessCallback(response:any){
  if(response){
    response.end();
  }
}


io.on('connection', (socket:any) => {
 
  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.username, event: 'left'});   
  });
 
  socket.on('set-name', (name:any) => {
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined'});    
  });
  
  socket.on('send-message', (message:any) => {
    io.emit('message', {msg: message.text, user: socket.username, createdAt: new Date()});    
  });
});
 
var port = process.env.PORT || 3001;
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ inflate: true }));

server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});

app.get('/getCases', (req:any, res:any) => {
  readApi( req, res).then(sucessCallback);
} )

app.get('/readCase', (req:any, res:any) => {
  readApi( req, res).then(sucessCallback);
} )

app.post('/createCase', (req:any, res:any) => {
  createApi( req, res).then(sucessCallback);
} )

app.post('/updateCase', (req:any, res:any) => {
  updateApi( req, res).then(sucessCallback);
} )

app.post('/deleteCase', (req:any, res:any) => {
  deleteApi( req, res).then(sucessCallback);
} )

