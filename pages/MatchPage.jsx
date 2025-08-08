import { useEffect, useState } from "react";
import AddQueueButton from "../components/AddQueueButton";
import axios from "axios";

const MatchPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queuedMatches, setQueuedMatches] = useState([]); // Array of matches
  const [currentMatch, setCurrentMatch] = useState([]); // Temp for forming a 4-player match

  // Fetch players on mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/players")
      .then((res) => {
        setPlayers(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error fetching players", err));
  }, []);

  // Fetch existing queued matches
  useEffect(() => {
    axios.get("http://localhost:3000/api/matches").then((res) => {
      const grouped = {};

      res.data.forEach((row) => {
        if (!grouped[row.match_group]) {
          grouped[row.match_group] = [];
        }
        grouped[row.match_group].push({
          id: row.player_id,
          name: row.name,
          level: row.level,
          games_played: row.games_played,
        });
      });

      const allMatches = Object.values(grouped);
      setQueuedMatches(allMatches);
    });
  }, []);

  const handleAddToQueue = (player) => {
    const isAlreadyQueued =
      currentMatch.find((p) => p.id === player.id) ||
      queuedMatches.some((match) => match.find((p) => p.id === player.id));

    if (isAlreadyQueued) return;

    const updatedCurrent = [...currentMatch, player];
    if (updatedCurrent.length === 4) {
      const matchGroup = Date.now().toString();

      const formattedMatch = updatedCurrent.map((p) => ({
        match_group: matchGroup,
        player_id: p.id,
        status: "queued",
      }));

      // Save to DB
      axios
        .post("http://localhost:3000/api/matches", formattedMatch)
        .then((res) => {
          console.log("Match saved to DB", res.data);
          setQueuedMatches((prev) => [...prev, updatedCurrent]);
          setCurrentMatch([]);
        })
        .catch((err) => console.error("Error saving match:", err));
    } else {
      setCurrentMatch(updatedCurrent);
    }
  };

  const handleStartMatch = () => {
    const playerIds = currentMatch.map((player) => player.id);

    axios
      .post("http://localhost:3000/api/match-status", {
        playerIds: playerIds,
        status: "ongoing",
      })
      .then((res) => {
        console.log("Status updated:", res.data);
      })
      .catch((err) => {
        console.error("Error updating status:", err);
      });
  };

  return (
    <div className="p-4 flex gap-4">
      {/* Sidebar - Players List */}
      <div className="space-y-4 w-1/4">
        <h2 className="text-xl font-bold mb-2">Players</h2>
        {isLoading ? (
          <p>Loading players...</p>
        ) : (
          players.map((player) => (
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

      {/* Matches Display */}
      <div className="w-3/4 space-y-4">
        {currentMatch.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <p className="font-semibold text-lg mb-2">Forming Match...</p>
            <div className="grid grid-cols-4 gap-4">
              {currentMatch.map((player) => (
                <div
                  key={player.id}
                  className="bg-yellow-100 p-4 rounded-lg text-center w-full shadow"
                >
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

        {queuedMatches.map((match, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 items-center pt-4"
          >
            {/* Team A - Player 1 & 2 */}
            {match.slice(0, 2).filter((p) => p.name).map((player) => (
              <div
                key={player.id}
                className="bg-white shadow p-4 rounded-lg text-center w-full"
              >
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
            {match.slice(2, 4).filter((p) => p.name).map((player) => (
              <div
                key={player.id}
                className="bg-white shadow p-4 rounded-lg text-center w-full"
              >
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
  );
};

export default MatchPage;
