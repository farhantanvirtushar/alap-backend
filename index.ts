import express from "express";
const app = express();
var multer = require("multer");
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import { removeUser, socketIdToUserMap, users } from "./socket-users"; 
import http from 'http';
import { Server } from "socket.io";
import { SocketUser } from "./models/SocketUser";

const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:"*",
    methods:["GET, POST, OPTIONS, PUT, PATCH, DELETE"],
    allowedHeaders:["X-Requested-With","Content-Type","X-CSRFToken","Authorization"]

  }
});

const authRouter = require("./routes/auth");
const messageRouter = require("./routes/message");

// import departmentRouter from "./routes/departments.js";
// import categoryRouter from "./routes/categories.js";
// import productRouter from "./routes/products.js";
// import orderRouter from "./routes/orders.js";
// import cateringRouter from "./routes/caterings";

// const createTables = require("./db/createTables.js");

dotenv.config();

// createTables();

app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json()); // for json

app.use(helmet());
app.use(morgan("common"));
// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type,X-CSRFToken,Authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Pass to next layer of middleware
  next();
});

io.on('connection', (socket) => {
  console.log('a user connected with id : '+socket.id);

  socket.on("add-user",(userId:number)=>{
    console.log("user id : "+ userId)
    console.log("socket id : "+ socket.id)
    users[userId] = socket.id;
    socketIdToUserMap[socket.id] = userId;
  })
  
  socket.on("disconnect",(reason)=>{
    console.log("user disconnected")
    console.log(reason)
    removeUser(socket.id)
  })
});

app.set('socketio',io);

app.use("/api/auth/", authRouter);
app.use("/api/message/", messageRouter);

server.listen(process.env.PORT || 5000);
