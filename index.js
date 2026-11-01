const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Messages API",
    version: "2.0.0"
  });
});

// Record a message
app.post("/message", async (req, res) => {
  if (
    req.headers["x-api-secret"] !==
    process.env.BOT_API_SECRET
  ) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized"
    });
  }
  const { userId, username, guildId } = req.body;

  if (!userId || !username || !guildId) {
    return res.status(400).json({
      status: "error",
      message: "Missing user information"
    });
  }

  const { data, error } = await supabase.rpc(
    "increment_message_count",
    {
      p_user_id: String(userId),
      p_username: String(username),
      p_guild_id: String(guildId)
    }
  );

  if (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }

  res.json({
    status: "success",
    user: username,
    messages: data
  });
});

// Get a user's messages
app.get("/messages/:guildId/:userId", async (req, res) => {
  const { guildId, userId } = req.params;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }

  res.json({
    status: "success",
    userId,
    username: data?.username || "Unknown",
    messages: data?.message_count || 0
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Messages API running on port ${PORT}`);
});
