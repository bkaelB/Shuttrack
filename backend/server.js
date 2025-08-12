import express from "express";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";

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
  database: "badminton_queue_system",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Fetch all players ordered by level
app.get("/api/players", (req, res) => {
  const sql = `SELECT * FROM players ORDER BY level ASC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// Fetch players who are done playing (for Payment Page)
app.get("/api/players/done", (req, res) => {
  const sql = `
    SELECT id, name, level, done_playing, paid_status, payment_mode, games_played, total_due
    FROM players
    WHERE done_playing = 1
    ORDER BY name ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching done players:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// Update payment info for a player
app.put("/api/players/:id/payment", (req, res) => {
  const playerId = req.params.id;
  const { paid_status, payment_mode } = req.body;

  const sql = `
    UPDATE players 
    SET paid_status = ?, payment_mode = ?
    WHERE id = ?
  `;

  db.query(sql, [paid_status, payment_mode, playerId], (err, result) => {
    if (err) {
      console.error("Error updating payment info:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json({ message: "Payment info updated successfully" });
  });
});

// Mark player as done playing
app.put("/api/players/:id/status", (req, res) => {
  const playerId = req.params.id;
  const { status } = req.body;
  const donePlayingFlag = status.toLowerCase() === "done playing" ? 1 : 0;

  const sql = `
    UPDATE players 
    SET done_playing = ?
    WHERE id = ?
  `;

  db.query(sql, [donePlayingFlag, playerId], (err, result) => {
    if (err) {
      console.error("Error updating done_playing:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json({ message: "Player status updated successfully" });
  });
});

// Fetch queued matches (JOIN players info)
app.get("/api/matches", (req, res) => {
  const sql = `
    SELECT 
      match_queue.match_group, 
      match_queue.player_id, 
      players.*,
      match_queue.status,
      match_queue.match_created_at
    FROM match_queue
    JOIN players ON match_queue.player_id = players.id
    ORDER BY match_queue.match_created_at ASC, match_queue.match_group ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching matches:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.status(200).json(results);
  });
});

// Create new match (group of 4 players)
app.post("/api/matches", (req, res) => {
  const matchData = req.body; // expect array of { match_group, player_id, status }

  db.query("SELECT MAX(match_group) AS max_group FROM match_queue", (err, results) => {
    if (err) return res.status(500).json({ error: err });

    // Use max group + 1 or 1 if null
    const nextGroup = (results[0].max_group || 0) + 1;

    const now = new Date();
    const values = matchData.map(({ player_id }) => [
      nextGroup,
      player_id,
      "queued",
      now,
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

// Start match (update status to 'ongoing' for a match group)
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

// Finish or cancel match, update games played and total_due if finished
app.delete("/api/matches/group/:matchGroup", (req, res) => {
  const { matchGroup } = req.params;
  const { type } = req.query; // 'finish' or 'cancel'

  db.query(
    "SELECT player_id FROM match_queue WHERE match_group = ?",
    [matchGroup],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Fetch failed" });

      const playerIds = results.map((row) => row.player_id);

      if (type === "finish" && playerIds.length === 4) {
        db.query(
          `UPDATE players 
           SET games_played = games_played + 1, 
               total_due = total_due + 30 
           WHERE id IN (?)`,
          [playerIds],
          (err) => {
            if (err) {
              console.error("Error updating players after finishing match:", err);
              return res.status(500).json({ error: "Update players failed" });
            }
            deleteMatchQueue();
          }
        );
      } else {
        deleteMatchQueue();
      }

      function deleteMatchQueue() {
        db.query(
          "DELETE FROM match_queue WHERE match_group = ?",
          [matchGroup],
          (err2) => {
            if (err2) return res.status(500).json({ error: "Delete failed" });

            res.status(200).json({ success: true });
          }
        );
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
