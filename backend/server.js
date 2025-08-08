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
  database: "badminton_queue_system"
});

db.connect(err => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

app.get("/api/players", (req, res) => {
  db.query("SELECT * FROM players", (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

app.get("/api/matches", (req, res) => {
  db.query(`
 SELECT match_queue.match_group, match_queue.player_id, players.name
    FROM match_queue
    JOIN players ON match_queue.player_id = players.id
    WHERE match_queue.status = 'queued'
    ORDER BY match_queue.match_group, match_queue.player_id
`, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    res.status(200).json(results);
  })
})

app.post("/api/matches", (req, res) => {
  const matchData = req.body;

  if (!Array.isArray(matchData) || matchData.length !== 4) {
    return res.status(400).json({ error: "Invalid match data" });
  }

  const values = matchData.map(({ match_group, player_id, status }) => [
    match_group,
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







app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});