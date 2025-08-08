import express from "express";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "badminton_queue_system"
});

db.connect(err => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Fetch all players
app.get("/api/players", (req, res) => {
  db.query("SELECT * FROM players", (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// Fetch queued matches
app.get("/api/matches", (req, res) => {
  db.query(`
SELECT 
    match_queue.match_group, 
    match_queue.player_id, 
    players.*
FROM match_queue
JOIN players ON match_queue.player_id = players.id
WHERE match_queue.status = 'queued'
ORDER BY match_queue.match_group, match_queue.player_id;

  `, (err, results) => {
    if (err) {
      console.error("Error fetching matches:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.status(200).json(results);
  });
});

// Create new match (group of 4 players)
app.post("/api/matches", (req, res) => {
  const matchData = req.body;

  if (!Array.isArray(matchData) || matchData.length !== 4) {
    return res.status(400).json({ error: "Invalid match data" });
  }

  const matchGroup = uuidv4(); // ✅ Generate a new match_group for each match

  const values = matchData.map(({ player_id, status }) => [
    matchGroup,
    player_id,
    status
  ]);

  const sql = `
    INSERT INTO match_queue (match_group, player_id, status)
    VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ success: true, result });
  });
});


app.delete("/api/matches/group/:matchGroup", (req, res) => {
  const { matchGroup } = req.params;
  const { type } = req.query; // 'finish' or 'cancel'

  // Get all players in this match_group
  db.query(
    "SELECT player_id FROM match_queue WHERE match_group = ?",
    [matchGroup],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Fetch failed" });

      const playerIds = results.map(row => row.player_id);

      if (type === "finish" && playerIds.length === 4) {
        // Increment games_played for each player
        playerIds.forEach(id => {
          db.query(
            "UPDATE players SET games_played = games_played + 1 WHERE id = ?",
            [id]
          );
        });
      }

      // Now delete the match
      db.query(
        "DELETE FROM match_queue WHERE match_group = ?",
        [matchGroup],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Delete failed" });

          res.status(200).json({ success: true });
        }
      );
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
