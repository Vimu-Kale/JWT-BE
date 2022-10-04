require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 3000;

const jwt = require("jsonwebtoken");

const cors = require("cors");
app.use(cors());

app.use(express.json());

const posts = [
  {
    username: "kyle",
    title: "post 1",
  },
  {
    username: "vimu",
    title: "post 2",
  },
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

app.get("/posts", authenticateToken, (req, res) => {
  console.log("hello");
  console.log(req.user);
  res.status(200).json(posts.filter((post) => post.username === req.user.name));
});

app.post("/login", (req, res) => {
  //Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken: accessToken });
});

app.listen(PORT, () => {
  console.log(`server listening on port : ${PORT}`);
});
