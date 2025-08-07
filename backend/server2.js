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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});