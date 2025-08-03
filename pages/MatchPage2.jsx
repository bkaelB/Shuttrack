import { useEffect, useState } from "react";
import axios from "axios";

const MatchPage = () => {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3000/api/players")
            .then((res) => {
                setPlayers(res.data);
                setIsLoading(false);
            })
            .catch((err) => console.error("Error fetching players:", err));
    }, []);

const handleAddToQueue = (player) => {
    setQueue(prevQueue => {
        const alreadyInQueue = prevQueue.some(p => p.id === player.id);
        const isFull = prevQueue.length >= 4;
        if (!alreadyInQueue && !isFull) {
            return [...prevQueue, player];
        }
        return prevQueue;
    });
};


    const handleTogglePaid = (playerId) => {
        setPlayers(prev =>
            prev.map(p =>
                p.id === playerId ? { ...p, paid: !p.paid } : p
            )
        );
    };

    const renderTeamMatches = () => {
        const matches = [];
        for (let i = 0; i < queue.length; i += 4) {
            const match = queue.slice(i, i + 4);
            if (match.length === 4) {
                matches.push(match);
            }
        }
        return matches;
    };


    return (
        <div className="p-4 grid grid-cols-4 gap-4">
            {/* Left Column (1/4 width) */}
            <div className="col-span-1 space-y-4">
                <h2 className="text-xl font-bold mb-2">Players</h2>
                {isLoading ? (
                    <p>Loading players...</p>
                ) : (
                    players.map(player => (
                        <div
                            key={player.id}
                            className="bg-white shadow p-4 rounded-lg"
                        >
                            <p className="font-semibold">{player.name}</p>
                            <p>Level: {player.level}</p>
                            <p>Games Played: {player.games_played}</p>
                            <p>
                                Paid:{" "}
                                <button
                                    className={`ml-2 px-2 py-1 rounded ${player.paid ? "bg-green-400" : "bg-red-400"
                                        }`}
                                    onClick={() => handleTogglePaid(player.id)}
                                >
                                    {player.paid ? "Paid" : "Unpaid"}
                                </button>
                            </p>
                            <button
                                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                onClick={() => handleAddToQueue(player)}
                            >
                                Add to Queue
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Right Column (3/4 width) */}
            <div className="col-span-3">
                <h2 className="text-xl font-bold mb-4">Match Queue</h2>
                {renderTeamMatches().map((match, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-100 p-4 rounded-lg shadow mb-4"
                    >
                        <div className="text-center font-semibold mb-2">
                            Team 1: {match[0].name} & {match[1].name} vs Team 2: {match[2].name} & {match[3].name}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Team 1 */}
                            <div className="bg-white p-3 rounded shadow">
                                <p className="font-bold text-center">Team 1</p>
                                <p>{match[0].name} - Level {match[0].level}</p>
                                <p>{match[1].name} - Level {match[1].level}</p>
                            </div>

                            {/* Team 2 */}
                            <div className="bg-white p-3 rounded shadow">
                                <p className="font-bold text-center">Team 2</p>
                                <p>{match[2].name} - Level {match[2].level}</p>
                                <p>{match[3].name} - Level {match[3].level}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchPage;
