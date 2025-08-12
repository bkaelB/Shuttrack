import { useEffect, useState } from "react";
import axios from "axios";

const PaymentPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch done playing players
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/players/done")
      .then((res) => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Update payment info
  const handlePaymentUpdate = (id, isPaid, paymentMethod) => {
    axios
      .put(`http://localhost:3000/api/players/${id}/payment`, {
        paid_status: isPaid ? "paid" : "not_paid",
        payment_mode: paymentMethod,
      })
      .then(() => {
        // Update local state to reflect changes and highlight selected payment
        setPlayers((prev) =>
          prev.map((player) =>
            player.id === id
              ? {
                  ...player,
                  paid_status: isPaid ? "paid" : "not_paid",
                  payment_mode: paymentMethod,
                }
              : player
          )
        );
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <p>Loading players...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payment Page</h1>
      {players.length === 0 ? (
        <p>No players need payment.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Games Played</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Amount Due</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Paid Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Payment Method</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Update Payment</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{player.name}</td>
                <td className="border border-gray-300 px-4 py-2">{player.games_played}</td>
                <td className="border border-gray-300 px-4 py-2">
                  ₱{player.games_played * 30}
                </td>
                <td className="border border-gray-300 px-4 py-2 capitalize">
                  {player.paid_status || "not_paid"}
                </td>
                <td className="border border-gray-300 px-4 py-2 capitalize">
                  {player.payment_mode || "-"}
                </td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button
                    onClick={() => handlePaymentUpdate(player.id, true, "cash")}
                    className={`px-3 py-1 rounded ${
                      player.paid_status === "paid" && player.payment_mode === "cash"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Paid (Cash)
                  </button>
                  <button
                    onClick={() => handlePaymentUpdate(player.id, true, "gcash")}
                    className={`px-3 py-1 rounded ${
                      player.paid_status === "paid" && player.payment_mode === "gcash"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Paid (GCash)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentPage;
