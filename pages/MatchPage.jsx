import { useEffect, useState } from "react"
import axios from "axios"

const MatchPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:3000/api/players")
      .then((res) => {
        setPlayers(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error fetching players", err));

  }, []);

  return (
    <>
      <div className="p-4 grid grid-cols-4 gap-4">
        <div className="col-span-1 space-y-4">
          <h2 className="text-xl font-bold mb-2">Players</h2>
          {isLoading ? (
            <p>Loading players...</p>
          ) : (
            players.map(player => (
              <div className="bg-white shadow p-4 rounded-lg" key={player.id}>
                <p className="font-semibold">{player.name}</p>
                <p>Level: {player.level}</p>
                <p>Games Played: {player.games_played}</p>
              </div>
            ))
          )}
        </div>

        <div className="col-span-3">
          <h2 className="text-xl font-bold mb-4"> sdfsd</h2>
        </div>
      </div>


    </>
  );
};

export default MatchPage