import express, {
  Application,
  Request,
  Response,
  NextFunction,
  Router,
} from "express";

import jwt, {
  Secret,
  SignCallback,
  VerifyCallback,
  VerifyErrors,
} from "jsonwebtoken";
import { User } from "../models/User";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    try {
      const user: User = await verifyToken(token);
      req.body.user = user;
      next();
    } catch (error) {
      res.status(403).json("invalid token");
    }
  } else {
    res.status(403).json("cannot authenticate");
  }
};

const verifyToken = async (token: string): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    var seccretKey: Secret = process.env.SECRET_KEY!;

    jwt.verify(token, seccretKey, <VerifyCallback>(
      function (err: VerifyErrors, decoded: User) {
        if (err) {
          reject(err);
        }

        resolve(decoded);
      }
    ));
  });
};

module.exports = authenticate;
