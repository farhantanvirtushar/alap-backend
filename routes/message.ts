import { LoginReq } from "./../models/LoginReq";
import { AuthRes } from "./../models/AuthRes";
import { NewUserReq } from "./../models/NewUserReq";
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

router.get("/all", authenticate, async (req: Request, res: Response) => {
  try {
    var reqUser: User = req.body.user;

    var query_text: string = "SELECT *\
      FROM users;";

    var values: string[] = [];

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
