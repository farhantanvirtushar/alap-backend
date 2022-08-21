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

router.get("/user/:id", authenticate, async (req: Request, res: Response) => {
  try {
    var reqUser: User = req.body.user;

    const user_id: string = req.params.id;
    console.log(user_id);
    var query_text: string =
      "SELECT first_name,last_name,profile_photo,phone_no,email,date_of_birth\
      FROM users\
      WHERE user_id = $1;";

    var values: string[] = [user_id];

    var result: QueryResult<User> = await runQuery(query_text, values);
    if (result.rowCount == 0) {
      const errorRes: ErrorRes = {
        error_message: "User does not exist",
      };
      return res.status(404).json(errorRes);
    }
    var user: User = result.rows[0];

    console.log(user);
    // const chatListRes: User[] = users;

    return res.status(200).json(user);
  } catch (error: any) {
    var errorRes: ErrorRes = {
      error_message: "Something went wrong",
    };
    if (error.constraint) {
      errorRes.error_message = error.constraint;
      return res.status(500).json(errorRes);
    }
    errorRes.error = error;
    return res.status(500).json(errorRes);
  }
});

router.get("/message-list/:id", authenticate, async (req: Request, res: Response) => {
  try {
    var reqUser: User = req.body.user;

    var query_text: string = "SELECT *\
      FROM messages\
      WHERE (sender_id = $1 and receiver_id = $2)\
      OR (sender_id = $2 and receiver_id = $1)\
      ORDER BY created_at DESC;";

    var values: string[] = [reqUser.user_id!.toString(),req.params.id];

    var result: QueryResult<Message> = await runQuery(query_text, values);
    var messageList: Message[] = result.rows;

    // const chatListRes: User[] = users;

    return res.status(200).json(messageList);
  } catch (error: any) {
    var errorRes: ErrorRes = {
      error_message: "Something went wrong",
    };
    if (error.constraint) {
      errorRes.error_message = error.constraint;
      return res.status(500).json(errorRes);
    }
    errorRes.error = error;
    return res.status(500).json(errorRes);
  }
});

router.get("/inbox", authenticate, async (req: Request, res: Response) => {
  try {
    var reqUser: User = req.body.user;

    var query_text: string =
      "SELECT last_message_time, contact_id, first_name, last_name,profile_photo\
      FROM users inner join \
      (SELECT max(created_at) as last_message_time, \
      CASE \
          WHEN sender_id != $1 THEN sender_id\
          WHEN receiver_id != $1 THEN receiver_id\
      END AS contact_id\
      FROM messages \
      WHERE sender_id = $1 or receiver_id = $1\
      GROUP BY contact_id) inbox on user_id = contact_id\
      ORDER BY last_message_time desc;";

    var values: any[] = [reqUser.user_id];

    var result: QueryResult<InboxItem> = await runQuery(query_text, values);
    var inboxItemList: InboxItem[] = result.rows;

    // const chatListRes: User[] = users;

    return res.status(200).json(inboxItemList);
  } catch (error: any) {
    var errorRes: ErrorRes = {
      error_message: "Something went wrong",
    };
    if (error.constraint) {
      errorRes.error_message = error.constraint;
      return res.status(500).json(errorRes);
    }
    errorRes.error = error;
    return res.status(500).json(errorRes);
  }
});

router.post("/send", authenticate, async (req: Request, res: Response) => {
  try {
    var reqUser: User = req.body.user;
    var message: Message = req.body;

    const errorRes: ErrorRes = {
      error_message: "",
    };

    if (message.sender_id != reqUser.user_id) {
      errorRes.error_message = "Authentication failed";
      return res.status(500).json(errorRes);
    }

    var query_text: string =
      "INSERT INTO messages (sender_id, receiver_id,text,image_url,video_url)\
      VALUES($1,$2,$3,$4,$5) RETURNING *;";

    var values: any[] = [
      message.sender_id,
      message.receiver_id,
      message.text,
      message.image_url,
      message.video_url,
    ];

    var result: QueryResult<any> = await runQuery(query_text, values);
    var message: Message = result.rows[0];

    return res.status(200).json(message);
  } catch (error: any) {
    if (error.constraint) {
      res.status(500).json(error.constraint);
    }
    return res.status(500).json(error);
  }
});

module.exports = router;
