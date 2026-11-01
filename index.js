const express = require("express");

const app = express();
app.use(express.json());

const messages = {};

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Messages API",
    version: "1.0.0"
  });
});

app.post("/message", (req, res) => {
  const { userId, username } = req.body;

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "Missing userId"
    });
  }

  if (!messages[userId]) {
    messages[userId] = {
      username: username || "Unknown",
      count: 0
    };
  }

  messages[userId].username = username || messages[userId].username;
  messages[userId].count++;

  res.json({
    status: "success",
    userId,
    username: messages[userId].username,
    messages: messages[userId].count
  });
});

app.get("/messages/:userId", (req, res) => {
  const user = messages[req.params.userId];

  res.json({
    status: "success",
    userId: req.params.userId,
    username: user?.username || "Unknown",
    messages: user?.count || 0
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Messages API running on port ${PORT}`);
});
