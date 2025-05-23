import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id;
  email: string;
  password: string;
  name: string;
  confirmed: boolean;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model<IUser>("User", UserSchema);
