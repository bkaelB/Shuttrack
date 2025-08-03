import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//sql connection

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"badmin"
});

db.connect (err => {
    if (err) {
        console.error("sfsfds", err);
        return;
    }

    console.log("connected to MysQL database")
});

app.get("/api/players", (req,res) => {
    db.query("SELECT * FROM players", (err, results)=> {
        if (err) {
            console.error ("sdfdsfsdfs", err);
            return res.status(500).json({error:"d bfsdfsdfs"})
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`server is running on localhostasfdasfs:${PORT}`)
})