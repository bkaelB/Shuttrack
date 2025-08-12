import { useEffect, useState } from "react";
import axios from "axios";

const PaymentPage = () => {
  const [players, setPlayers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    cash: 0,
    gcash: 0,
    overall: 0,
  });

  // Fetch done playing players and expenses on load
  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:3000/api/players/done"),
      axios.get("http://localhost:3000/api/expenses"),
    ])
      .then(([playersRes, expensesRes]) => {
        setPlayers(playersRes.data);
        setExpenses(expensesRes.data);
        setLoading(false);
        calculateTotals(playersRes.data);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Calculate totals from players list
  const calculateTotals = (playersList) => {
    let cashTotal = 0;
    let gcashTotal = 0;

    playersList.forEach((player) => {
      if (player.paid_status === "paid") {
        const amount = player.games_played * 30;
        if (player.payment_mode === "cash") {
          cashTotal += amount;
        } else if (player.payment_mode === "gcash") {
          gcashTotal += amount;
        }
      }
    });

    setTotals({
      cash: cashTotal,
      gcash: gcashTotal,
      overall: cashTotal + gcashTotal,
    });
  };

  // Update payment info
  const handlePaymentUpdate = (id, isPaid, paymentMethod) => {
    axios
      .put(`http://localhost:3000/api/players/${id}/payment`, {
        paid_status: isPaid ? "paid" : "not_paid",
        payment_mode: paymentMethod,
      })
      .then(() => {
        setPlayers((prev) => {
          const updatedPlayers = prev.map((player) =>
            player.id === id
              ? {
                  ...player,
                  paid_status: isPaid ? "paid" : "not_paid",
                  payment_mode: paymentMethod,
                }
              : player
          );
          calculateTotals(updatedPlayers);
          return updatedPlayers;
        });
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold mb-6">Payment & Expense Page</h1>

      {/* Totals Summary */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Total Payments Received</h2>
        <div className="flex gap-6">
          <div className="flex-1 p-4 bg-green-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">Cash</h3>
            <p className="text-2xl font-bold">₱{totals.cash}</p>
            <div
              className="h-2 bg-green-600 rounded mt-2"
              style={{ width: `${totals.overall ? (totals.cash / totals.overall) * 100 : 0}%` }}
            />
          </div>
          <div className="flex-1 p-4 bg-blue-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">GCash</h3>
            <p className="text-2xl font-bold">₱{totals.gcash}</p>
            <div
              className="h-2 bg-blue-600 rounded mt-2"
              style={{ width: `${totals.overall ? (totals.gcash / totals.overall) * 100 : 0}%` }}
            />
          </div>
          <div className="flex-1 p-4 bg-gray-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">Overall</h3>
            <p className="text-2xl font-bold">₱{totals.overall}</p>
          </div>
        </div>
      </div>

      {/* Players Payment Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Players Payment Details</h2>
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

      {/* Expenses Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses recorded.</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{expense.type}</td>
                  <td className="border border-gray-300 px-4 py-2">₱{parseFloat(expense.amount).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
