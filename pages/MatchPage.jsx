import { useEffect, useState } from "react"
import AddQueueButton from "../components/AddQueueButton";

import axios from "axios"

const MatchPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    axios.get("http://localhost:3000/api/players")
      .then((res) => {
        setPlayers(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error fetching players", err));

  }, []);

  useEffect(() => {
    axios.get("http://localhost:3000/api/matches")
      .then((res) => {
        const rawMatches = res.data;

        // Group players by match_group
        const grouped = rawMatches.reduce((acc, player) => {
          const group = acc[player.match_group] || [];
          group.push(player);
          acc[player.match_group] = group;
          return acc;
        }, {});

        const matchesArray = Object.values(grouped);
        setQueuedMatches(matchesArray);
      })
      .catch((err) => console.error("Error fetching matches", err));
  }, []);
  

  const [queuedMatches, setQueuedMatches] = useState([]); //aray to ng matches
  const [currentMatch, setCurrentMatch] = useState([]); //temp to para sa 4 players

 const handleAddToQueue = (player) => {
  const isAlreadyQueued =
    currentMatch.find(p => p.id === player.id) ||
    queuedMatches.some(match => match.find(p => p.id === player.id));

  if (isAlreadyQueued) return;

  const updatedCurrent = [...currentMatch, player];
  if (updatedCurrent.length === 4) {
    // Save to DB
    axios.post("http://localhost:3000/api/matches", updatedCurrent)
      .then((res) => {
        console.log("Match saved to DB", res.data);
        setQueuedMatches(prev => [...prev, updatedCurrent]);
        setCurrentMatch([]);
      })
      .catch((err) => console.error("Error saving match:", err));
  } else {
    setCurrentMatch(updatedCurrent);
  }
}


  return (
    <>
      <div className="p-4 flex gap-4">
        {/* Sidebar - Players List */}
        <div className="space-y-4 w-1/4">
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

        {/* Matches Display */}.
        <div className="w-3/4 space-y-4">
          {currentMatch.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="font-semibold text-lg mb-2">Forming Match...</p>
              <div className="grid grid-cols-4 gap-4">
                {currentMatch.map(player => (
                  <div key={player.id} className="bg-yellow-100 p-4 rounded-lg text-center w-full shadow">
                    <p className="font-semibold">{player.name}</p>
                    <div className="flex flex-row justify-center space-x-2 text-sm text-gray-700">
                      <p>Level: {player.level}</p>
                      <p>Games Played: {player.games_played}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 🔼 END OF INSERTION */}

          {queuedMatches.map((match, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-center pt-4">
              {/* Team A - Player 1 & 2 */}
              {match.slice(0, 2).map(player => (
                <div key={player.id} className="bg-white shadow p-4 rounded-lg text-center w-full">
                  <p className="font-semibold">{player.name}</p>
                  <div className="flex flex-row justify-center space-x-2 text-sm text-gray-600">
                    <p>Level: {player.level}</p>
                    <p>Games Played: {player.games_played}</p>
                  </div>
                </div>
              ))}

              {/* VS Divider */}
              <div className="text-center font-bold text-2xl p-4">VS</div>

              {/* Team B - Player 3 & 4 */}
              {match.slice(2, 4).map(player => (
                <div key={player.id} className="bg-white shadow p-4 rounded-lg text-center w-full">
                  <p className="font-semibold">{player.name}</p>
                  <div className="flex flex-row justify-center space-x-2 text-sm text-gray-600">
                    <p>Level: {player.level}</p>
                    <p>Games Played: {player.games_played}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MatchPage