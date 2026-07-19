// backend/src/models/Item.ts
import { Schema, model, Document } from "mongoose";

export interface IItem extends Document {
  title: string;
  type: "article" | "video" | "book";
  url?: string;
  status: "to-read" | "in-progress" | "completed";
  rawContent: string;
  summary?: string;
  isEmbedded: boolean;
  dateAdded: Date;
  dateCompleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["article", "video", "book"] },
    url: {
      type: String,
      trim: true,
      required: function (this: IItem) {
        return this.type !== "book";
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["to-read", "in-progress", "completed"],
      default: "to-read",
    },
    rawContent: { type: String, required: true },
    summary: { type: String, default: "" },
    isEmbedded: { type: Boolean, default: false },
    dateAdded: { type: Date, default: Date.now },
    dateCompleted: { type: Date },
  },
  { timestamps: true },
);

export default model<IItem>("Item", ItemSchema);
