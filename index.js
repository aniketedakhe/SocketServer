let createApi = require('./api/createCase');
let readApi = require('./api/readCase');
let updateApi = require('./api/updateCase');
let deleteApi = require('./api/deleteCase');
let getCasesApi = require('./api/getCases');


let app = require('express')();
let bodyParser= require('body-parser');
let cors = require('cors')
let server = require('http').createServer(app); 
let io = require('socket.io')(server,{ cors: {origin: '*', methods: ['GET','POST','PUT'] }});

 
function sucessCallback(response){
  if(response){
    response.end();
  }
}


io.on('connection', (socket) => {
 
  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.username, event: 'left'});   
  });
 
  socket.on('set-name', (name) => {
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined'});    
  });
  
  socket.on('send-message', (message) => {
    createApi(null, null, message).then( 
            ( data ) => { 
              io.emit('work-item-created', data)
              console.log('after-work-item-created') 
          }).catch( (err) => {
             io.emit('work-item-created', 'error while creating case!');
            console.log(err); 
          });
        });

  // socket.on('work-item-created', (message) => {
  //   console.log('work-item-created-fired')
  // });

});
 
var port = process.env.PORT || 3001;
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ inflate: true }));
app.use(cors());

server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});

app.get('/getCases', (req, res) => {
  getCasesApi( req, res).then(sucessCallback);
} )

app.post('/getCases', (req, res) => {
  getCasesApi( req, res).then(sucessCallback);
} )

app.get('/readCase', (req, res) => {
  readApi( req, res).then(sucessCallback);
} )

app.post('/createCase', (req, res) => {
  createApi( req, res).then(sucessCallback);
} )

app.post('/updateCase', (req, res) => {
  updateApi( req, res, io).then(sucessCallback);
} )

app.post('/deleteCase', (req, res) => {
  deleteApi( req, res).then(sucessCallback);
} )

