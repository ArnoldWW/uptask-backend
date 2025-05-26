import jwt from "jsonwebtoken";
import { Types } from "mongoose";

type JwtPayload = {
  id: Types.ObjectId;
};

export const generateJWT = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h"
  });
};
