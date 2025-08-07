import { useEffect, useState } from "react"
import AddQueueButton from "../components/AddQueueButton";

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


  const [queuedPlayers, setQueuedPlayers] = useState([]);

  const handleAddToQueue = (player) => {
    if (queuedPlayers.length >= 4) return;
    if (queuedPlayers.find(p => p.id === player.id)) return;

    setQueuedPlayers(prev => [...prev, player]);
  }

  return (
    <>
      <div className="p-4 flex gap-4">
        <div className=" space-y-4 w-1/4">
          <h2 className="text-xl font-bold mb-2">Players</h2>
          {isLoading ? (
            <p>Loading players...</p>
          ) : (
            players.map(player => (
              <div className="bg-white shadow p-4 rounded-lg" key={player.id}>
                <p className="font-semibold">{player.name}</p>
                <div className="flex space-x-2">
                  <p>Level: {player.level}</p>
                  <p>Games Played: {player.games_played}</p>
                  <AddQueueButton player={player} onAdd={handleAddToQueue} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="w-3/4 p-4 space-y-4">
          <div className="grid grid-cols-5 gap-4 items-center w-full">
            {/* Team A - Player 1 */}
            {queuedPlayers.slice(0, 2).map(player => (
              <div className="bg-white shadow p-4 rounded-lg text-center w-full" key={player.id}>
                <div className="font-semibold">{player.name}</div>
                <div className="flex flex-row justify-center space-x-2 text-sm text-gray-600">
                  <p>Level: {player.level}</p>
                  <p>Games Played: {player.games_played}</p>
                </div>
              </div>
            ))}

            {/* VS Divider */}
            {queuedPlayers.length === 4 && (<div className="text-center font-bold text-2xl p-0">VS</div> )}
            

            {/* Team B - Player 1 */}
              {queuedPlayers.slice(2, 4).map(player => (
                <div key={player.id} className="bg-white shadow p-4 rounded-lg text-center w-full">
                  <p className="font-semibold">{player.name}</p>
                  <div className="flex flex-row justify-center space-x-2 text-sm text-gray-600">
                    <p>Level: {player.level}</p>
                    <p>Games Played: {player.games_played}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchPage