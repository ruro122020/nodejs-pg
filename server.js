const express = require("express");
const app = express();
const port = process.env.port || 3000;
const knex = require("knex");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const pgconfig = require("./config");

const db = knex(pgconfig);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/signup", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  db.transaction((trx) => {
    trx
      .insert({
        email: email,
        hash: hash,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => {
    res.status(400).json("user already exist");
  });
});

const server = app.listen(3000, () => {
  console.log("listening ...", port);
});
