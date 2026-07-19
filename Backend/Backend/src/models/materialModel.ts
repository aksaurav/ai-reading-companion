// Backend/src/models/materialModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMaterial extends Document {
  title: string;
  url: string;
  contentType: "YouTube Video" | "Web Article";
  summary: string;
  createdAt: Date;
}

const MaterialSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  contentType: {
    type: String,
    enum: ["YouTube Video", "Web Article"],
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMaterial>("Material", MaterialSchema);
