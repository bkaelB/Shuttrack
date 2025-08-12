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

// Fetch queued matches (ORDERED by creation time)
app.get("/api/matches", (req, res) => {
  db.query(`
    SELECT 
      match_queue.match_group, 
      match_queue.player_id, 
      players.*,
      match_queue.status,
      match_queue.match_created_at
    FROM match_queue
    JOIN players ON match_queue.player_id = players.id
    ORDER BY match_created_at ASC, match_group ASC, player_id ASC
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

  // Get the latest match_group from the DB
  db.query("SELECT MAX(match_group) AS max_group FROM match_queue", (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const nextGroup = (results[0].max_group || 0) + 1; // start at 1 if null

    const now = new Date();
    const values = matchData.map(({ player_id }) => [
      nextGroup,
      player_id,
      "queued",
      now
    ]);

    const sql = `
      INSERT INTO match_queue (match_group, player_id, status, match_created_at)
      VALUES ?
    `;

    db.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ success: true, match_group: nextGroup });
    });
  });
});


// Start match (update status to 'ongoing')
app.patch("/api/matches/group/:matchGroup/start", (req, res) => {
  const { matchGroup } = req.params;

  db.query(
    "UPDATE match_queue SET status = 'ongoing' WHERE match_group = ?",
    [matchGroup],
    (err, result) => {
      if (err) {
        console.error("Error starting match:", err);
        return res.status(500).json({ error: "Database update failed" });
      }
      res.status(200).json({ success: true });
    }
  );
});

// Finish or cancel match
app.delete("/api/matches/group/:matchGroup", (req, res) => {
  const { matchGroup } = req.params;
  const { type } = req.query; // 'finish' or 'cancel'

  db.query(
    "SELECT player_id FROM match_queue WHERE match_group = ?",
    [matchGroup],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Fetch failed" });

      const playerIds = results.map(row => row.player_id);

      if (type === "finish" && playerIds.length === 4) {
        playerIds.forEach(id => {
          db.query(
            "UPDATE players SET games_played = games_played + 1 WHERE id = ?",
            [id]
          );
        });
      }

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
