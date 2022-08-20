import { ErrorRes } from "./../models/ErrorRes";
import { LoginReq } from "../models/auth/AuthReq";
import { AuthRes } from "../models/auth/AuthRes";
import { NewUserReq } from "../models/auth/NewUserReq";
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

// import { db, runQuery } from "../db/db.js";

import jwt, { Secret, SignCallback } from "jsonwebtoken";
import { QueryResult } from "pg";

router.post("/register", async (req: Request, res: Response) => {
  try {
    var newUserReq: NewUserReq = req.body;

    if (newUserReq.password != newUserReq.rePassword) {
      return res
        .status(500)
        .json({ error: "password and confirm password cannot be different" });
    }
    const salt: string = await genSalt(10);
    const hashedPassword: string = await hash(newUserReq.password, salt);

    var query_text: string =
      "INSERT INTO users (first_name, last_name,email,password)\
      VALUES($1,$2,$3,$4) RETURNING *;";

    var values: string[] = [
      newUserReq.first_name,
      newUserReq.last_name,
      newUserReq.email,
      hashedPassword,
    ];

    var result: QueryResult<any> = await runQuery(query_text, values);
    var rows: User[] = result.rows;
    var newUser: User = rows[0];

    console.log("====================================");
    console.log(newUser);
    console.log("====================================");

    var secretKey: string = process.env.SECRET_KEY!;

    var accessToken: string = jwt.sign(newUser, secretKey);

    const authResponse: AuthRes = {
      user_id: newUser.user_id!,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      token: accessToken,
    };

    return res.status(200).json(authResponse);
  } catch (error: any) {
    if (error.constraint) {
      return res.status(500).json(error.constraint);
    }
    return res.status(500).json(error);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    var loginReq: LoginReq = req.body;

    var query_text: string =
      "select *\
      from users \
      where email = $1;";

    const errorRes: ErrorRes = {
      error_message: "",
    };
    var values: any[] = [loginReq.email];

    var result: QueryResult<any> = await runQuery(query_text, values);

    if (result.rowCount != 1) {
      errorRes.field = "email";
      errorRes.error_message = "Account does not exist";
      return res.status(404).json(errorRes);
    }

    var rows: User[] = result.rows;
    var user: User = rows[0];

    const validPassword: boolean = await compare(
      loginReq.password,
      user.password!
    );

    if (!validPassword) {
      errorRes.field = "password";
      errorRes.error_message = "wrong password";
      return res.status(403).json(errorRes);
    }

    var seccretKey: Secret = process.env.SECRET_KEY!;

    jwt.sign(user, seccretKey, <SignCallback>(
      function (err: Error, accessToken: string) {
        const authResponse: AuthRes = {
          user_id: user.user_id!,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          token: accessToken,
        };

        return res.status(201).json(authResponse);
      }
    ));
  } catch (error: any) {
    const errorRes: ErrorRes = {
      error_message: error.toString(),
    };
    return res.status(500).json(errorRes);
  }
});

// router.post("/admin/login", async (req, res) => {
//   try {
//     var query_text = "select *\
//       from admins \
//       where username = ?;";

//     var values = [req.body.username];

//     var admin = await runQuery(query_text, values);

//     if (admin.length != 1) {
//       return res.status(404).json("Admin Not found");
//     }

//     admin = admin[0];

//     const validPassword = await bcrypt.compare(
//       req.body.password,
//       admin.password
//     );

//     if (!validPassword) {
//       return res.status(403).json({ error: "wrong password" });
//     }

//     delete admin["password"];
//     jwt.sign({ admin: admin }, process.env.SECRET_KEY, function (err, token) {
//       admin.token = token;
//       res.status(201).json(admin);
//     });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });
module.exports = router;
