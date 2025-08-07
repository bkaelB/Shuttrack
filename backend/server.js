import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
  SELECT 
    match_queue.id,
    match_queue.match_group,
    match_queue.status,
    players.name AS player_name
  FROM match_queue
  JOIN players ON match_queue.player_id = players.id
`, (err, results) => {
    if (err) return res.status(500).json({error: err});

    res.status(200).json(results);
  })
})

app.post("/api/matches", (req, res) => {
  const { player_id, match_group, status } = req.body;

  const sql = "INSERT INTO match_queue (player_id, match_group, status) VALUES (?, ?, ?)";
  const values = [player_id, match_group, status];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Match added successfully", matchId: result.insertId });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});