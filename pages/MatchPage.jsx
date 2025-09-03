import { useEffect, useState } from "react";
import AddQueueButton from "../components/AddQueueButton";
import axios from "axios";

const MatchPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queuedMatches, setQueuedMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("A");

  // Fetch players
  const fetchPlayers = () => {
    axios
      .get("http://localhost:3000/api/players")
      .then((res) => {
        setPlayers(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error fetching players", err));
  };

  // Fetch matches
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
          status: row.status,
          done_playing: row.done_playing,
          team: row.team,
        });
      });
      setQueuedMatches(Object.values(grouped));
    });
  };

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  // Add player (via modal form)
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/players", {
        name: newName,
        level: newLevel,
        games_played: 0,
        done_playing: 0,
      });
      setPlayers((prev) => [...prev, res.data]);

      // Reset form + close modal
      setNewName("");
      setNewLevel("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };


  // Add player to current match queue
  const handleAddToQueue = (player) => {
    const isAlreadyQueued =
      currentMatch.find((p) => p.id === player.id) ||
      queuedMatches.some((match) => match.find((p) => p.id === player.id));

    if (isAlreadyQueued) return;

    const updatedCurrent = [...currentMatch, player];
    if (updatedCurrent.length === 4) {
      const matchGroup = Date.now().toString();

      // Assign team A or B based on index
      const formattedMatch = updatedCurrent.map((p, idx) => ({
        match_group: matchGroup,
        player_id: p.id,
        status: "queued",
        team: idx < 2 ? "A" : "B",
      }));

      axios
        .post("http://localhost:3000/api/matches", formattedMatch)
        .then(() => {
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
      await axios.patch(
        `http://localhost:3000/api/matches/group/${matchGroup}/start`
      );
      fetchMatches();
    } catch (error) {
      console.error("Error starting match:", error);
    }
  };

  const handleMatchAction = async (matchGroup, actionType) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/matches/group/${matchGroup}`,
        { params: { type: actionType } }
      );
      fetchMatches();
      fetchPlayers();
    } catch (error) {
      console.error("Error handling match action:", error);
    }
  };

  const handleMarkDone = (playerId) => {
    axios
      .put(`http://localhost:3000/api/players/${playerId}/status`, {
        status: "Done Playing",
      })
      .then(() => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === playerId ? { ...player, done_playing: 1 } : player
          )
        );
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  const queuedPlayerIds = new Set(queuedMatches.flat().map((p) => p.id));

  if (isLoading) return <p>Loading players...</p>;

  return (
    <div className="p-4 flex gap-4">
      {/* Player List Sidebar */}
      <div className="space-y-4 w-1/4 h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Players</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            + Add Player
          </button>
        </div>

        {players.map((player) => {
          const isQueued = queuedPlayerIds.has(player.id);
          const isDone = player.done_playing === 1;
          const statusText = isDone ? "Done Playing" : "Playing";

          return (
            <div
              key={player.id}
              className={`shadow p-4 rounded-lg flex justify-between items-center ${isDone ? "bg-red-100" : isQueued ? "bg-yellow-50" : "bg-white"
                }`}
            >
              <div>
                <p className="font-semibold">{player.name}</p>
                <div className="flex space-x-2 text-sm text-gray-600">
                  <p>Level: {player.level}</p>
                  <p>Games Played: {player.games_played}</p>
                  <p>Status: {statusText}</p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                {isQueued && (
                  <span className="text-xs text-yellow-600 font-semibold mb-1">
                    In Queue
                  </span>
                )}

                {!isDone && (
                  <AddQueueButton player={player} onAdd={handleAddToQueue} />
                )}

                {!isDone ? (
                  <button
                    onClick={() => handleMarkDone(player.id)}
                    className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded hover:bg-green-300 cursor-pointer"
                  >
                    Mark Done Playing
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 italic">
                    Done Playing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Matches Area */}
      <div className="w-3/4 space-y-4 overflow-y-auto max-h-screen">
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
              {/* Team A */}
              {match.filter(p => p.team === "A").map(player => (
                <div key={player.id} className="bg-white shadow p-4 rounded-lg text-center w-full">
                  <p className="font-semibold">{player.name}</p>
                  <div className="flex flex-row justify-center space-x-2 text-sm text-gray-600">
                    <p>Level: {player.level}</p>
                    <p>Games Played: {player.games_played}</p>
                  </div>
                </div>
              ))}

              <div className="text-center font-bold text-2xl p-4">VS</div>

              {/* Team B */}
              {match.filter(p => p.team === "B").map(player => (
                <div key={player.id} className="bg-white shadow p-4 rounded-lg text-center w-full">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h2 className="text-xl font-bold mb-4 ">Add Player</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Level</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchPage;
