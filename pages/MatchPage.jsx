import { useEffect, useState } from "react";
import AddQueueButton from "../components/AddQueueButton";
import axios from "axios";

const MatchPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queuedMatches, setQueuedMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState([]);

  const fetchPlayers = () => {
    axios
      .get("http://localhost:3000/api/players")
      .then((res) => {
        setPlayers(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error fetching players", err));
  };

  const fetchMatches = () => {
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
          match_group: row.match_group,
          status: row.status
        });
      });

      const allMatches = Object.values(grouped);
      setQueuedMatches(allMatches);
      console.log("Fetched matches:", allMatches);
    });
  };

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
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

      axios
        .post("http://localhost:3000/api/matches", formattedMatch)
        .then((res) => {
          console.log("Match saved to DB", res.data);
          fetchMatches();
          setCurrentMatch([]);
        })
        .catch((err) => console.error("Error saving match:", err));
    } else {
      setCurrentMatch(updatedCurrent);
    }
  };

  const handleStartMatch = async (matchGroup) => {
    try {
      await axios.patch(`http://localhost:3000/api/matches/group/${matchGroup}/start`);
      fetchMatches();
    } catch (error) {
      console.error("Error starting match:", error);
    }
  };

  const handleMatchAction = async (matchGroup, actionType) => {
    try {
      await axios.delete(`http://localhost:3000/api/matches/group/${matchGroup}`, {
        params: { type: actionType },
      });

      fetchMatches();
      fetchPlayers();
    } catch (error) {
      console.error("Error handling match action:", error);
    }
  };

  // ✅ Build a quick lookup for queued players
  const queuedPlayerIds = new Set(queuedMatches.flat().map((p) => p.id));

  return (
    <div className="p-4 flex gap-4">
      {/* Sidebar - Players List */}
      <div className="space-y-4 w-1/4 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Players</h2>
        {isLoading ? (
          <p>Loading players...</p>
        ) : (
          players.map((player) => {
            const isQueued = queuedPlayerIds.has(player.id);
            return (
              <div
                key={player.id}
                className={`bg-white shadow p-4 rounded-lg flex justify-between items-center ${
                  isQueued ? "bg-yellow-50" : ""
                }`}
              >
                <div>
                  <p className="font-semibold">{player.name}</p>
                  <div className="flex space-x-2 text-sm text-gray-600">
                    <p>Level: {player.level}</p>
                    <p>Games Played: {player.games_played}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {isQueued && (
                    <span className="text-xs text-yellow-600 font-semibold mb-1">
                      In Queue
                    </span>
                  )}
                  <AddQueueButton player={player} onAdd={handleAddToQueue} />
                </div>
              </div>
            );
          })
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
          <div key={index} className="space-y-2 border-t pt-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              {match.slice(0, 2).map((player) => (
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

              <div className="text-center font-bold text-2xl p-4">VS</div>

              {match.slice(2, 4).map((player) => (
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

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              {match[0].status === "queued" ? (
                <button
                  onClick={() => handleStartMatch(match[0].match_group)}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Start Match
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleMatchAction(match[0].match_group, "finish")
                    }
                    className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Finish Match
                  </button>
                  <button
                    onClick={() =>
                      handleMatchAction(match[0].match_group, "cancel")
                    }
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel Match
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchPage;
