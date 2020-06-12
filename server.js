const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const md5 = require("md5");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./db/data.sqlite", (err) => {
  if (err) throw err;
  console.log("Connected to the SQLite database.");
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static("./public"));

app.get("/:id", (req, res) => {
  res.json("redirecting now");
  console.log("redirecting");
});

app.post("/new", (req, res) => {
  console.log("creating new");
});

app.post("/list", (req, res) => {
  console.log("get list");
});

app.post("/*", (req, res) => {
  res.json({ message: "It works" });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
