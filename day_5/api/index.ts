
import { prisma } from "./lib/prisma";

import express from "express";
const app = express();

import cors from "cors";
app.use(cors());

app.get("/posts", async (req, res) => {
  const posts = await prisma.post.findMany();
  res.json(posts);
});

app.listen(8800, () => {
  console.log("API running at port 8800...");
});
