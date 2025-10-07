import mongoose, { Schema, models, model } from "mongoose";

const VaultSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    username: { type: String },
    password: { type: String }, // encrypted
    url: { type: String },
    notes: { type: String },
    iv: { type: [Number] },
  },
  { timestamps: true }
);

export const Vault = models.Vault || model("Vault", VaultSchema);
