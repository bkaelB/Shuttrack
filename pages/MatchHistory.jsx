import { useEffect, useState } from "react";
import axios from "axios";

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/match-history")
      .then((res) => {
        // Group players by match_group
        const grouped = res.data.reduce((acc, row) => {
          if (!acc[row.match_group]) acc[row.match_group] = [];
          acc[row.match_group].push(row.name);
          return acc;
        }, {});

        // Turn grouped into array of match objects
        const formatted = Object.keys(grouped).map((group) => ({
          match_group: group,
          players: grouped[group],
        }));

        setMatches(formatted);
      })
      .catch((err) => console.error("Error fetching match history:", err));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Match History
      </h1>

      {matches.length === 0 ? (
        <p className="text-gray-500 text-center">No finished matches yet.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition"
            >
              {/* Match Number */}
              <span className="text-sm font-semibold text-gray-500">
                Match {index + 1}
              </span>

              {/* Players */}
              <div className="flex-1 text-center text-gray-800 font-medium">
                <span className="text-gray-600 font-bold">
                  {match.players[0]}
                </span>{" "}
                &{" "}
                <span className="text-gray-600 font-bold">
                  {match.players[1]}
                </span>{" "}
                <span className="mx-3 text-gray-500">vs</span>
                <span className="text-gray-600 font-bold">
                  {match.players[2]}
                </span>{" "}
                &{" "}
                <span className="text-gray-600 font-bold">
                  {match.players[3]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
