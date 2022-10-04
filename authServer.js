require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 4000;

const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(cors());
app.use(express.json());

let refreshTokens = [];

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

// ----------------------- //
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
// ----------------------- //

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  //Authenticate User

  console.log(req.body);

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "25s",
  });
  refreshTokens.push(refreshToken);

  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
};

app.listen(PORT, () => {
  console.log(`server listening on port : ${PORT}`);
});
