const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const yup = require("yup");

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./db/data.sqlite", (err) => {
  if (err) throw err;
  console.log("Connected to the SQLite database.");

  db.run(
    "CREATE TABLE IF NOT EXISTS urls (slug VARCHAR(100) PRIMARY KEY, url VARCHAR(255), clicks INTEGER)",
    (res, err) => {
      if (err) next(err);
    }
  );
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static("./public"));
const schema = yup.object().shape({
  url: yup.string().url().required(),
  slug: yup.string(),
});

app.post("/new", async (req, res, next) => {
  let { url, slug } = req.body;
  console.log("req.body: ", req.body);

  try {
    await schema.validate({ url, slug });

    if (!slug) {
      const cryptoRandomString = require("crypto-random-string");
      slug = cryptoRandomString({ length: 10, type: "url-safe" }).toLowerCase();
    }

    db.exec(
      `INSERT INTO urls(url, slug , clicks) VALUES('${url}', '${slug}', 0)`,
      (err) => {
        console.log("err: ", err);
        if (err) next(err);

        res.json({
          shorturl: `http://${req.headers.host}/${slug}`,
          slug: slug,
          url: url,
        });
      }
    );
  } catch (e) {
    next(e);
  }
});

app.get("/list", (req, res) => {
  db.all(`SELECT * FROM urls`, (err, data) => {
    if (err) next(err);

    res.json({
      data: data,
    });
  });
});

app.get("/:id", (req, res) => {
  db.get(`SELECT * FROM urls where slug='${req.params.id}'`, (err, data) => {
    if (err) next(err);
    if (!data) res.redirect(`/?error=${req.params.id} not found!`);
    else res.redirect(data.url);

    // add clicks
    db.exec(
      `UPDATE urls SET clicks = clicks + 1 WHERE slug='${req.params.id}'`,
      (err) => {
        if (err) console.error(err);
      }
    );
  });
});

app.post("/error", (req, res) => {
  res;
});

app.post("/*", (req, res) => {
  res.json({ message: "It works" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
