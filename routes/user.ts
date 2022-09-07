import { InboxItem } from "./../models/message/InboxItem";
import { User } from "./../models/User";

import { compare, genSalt, hash } from "bcrypt";

const { runQuery } = require("./../db");

import express, {
  Application,
  Request,
  Response,
  NextFunction,
  Router,
} from "express";
const router: Router = express.Router();

var multer = require("multer");
const upload = multer({ dest: "uploads/" });

const authenticate = require("../middlewires/jwt");
// import { db, runQuery } from "../db/db.js";

import jwt, { Secret, SignCallback } from "jsonwebtoken";
import { QueryResult } from "pg";
import { Message } from "../models/message/Message";
import { ErrorRes } from "../models/ErrorRes";
import { Server } from "socket.io";
import { users } from "../socket-users";
import { SocketUser } from "../models/SocketUser";

router.get("/search", authenticate, async (req: Request, res: Response) => {
  try {
    var reqUser: User = req.body.user;
    var searchText: string = req.query.name?.toString()!;
    if(searchText == ""){
        return res.status(200).json([]);
    }
    searchText = "%"+searchText.toLowerCase().replace(' ','%')+"%"
    console.log(searchText)
    var query_text: string = "SELECT first_name, last_name,user_id,email,profile_photo \
      FROM users\
      WHERE LOWER(CONCAT(first_name,' ',last_name)) LIKE $1;";

    var values: string[] = [searchText];

    var result: QueryResult<any> = await runQuery(query_text, values);
    var users: User[] = result.rows;

    // const chatListRes: User[] = users;

    return res.status(200).json(users);
  } catch (error: any) {
    if (error.constraint) {
      res.status(500).json(error.constraint);
    }
    return res.status(500).json(error);
  }
});



module.exports = router;
