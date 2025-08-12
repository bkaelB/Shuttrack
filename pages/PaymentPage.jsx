import { useEffect, useState } from "react";
import axios from "axios";

const PaymentPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    cash: 0,
    gcash: 0,
    overall: 0,
  });

  // Expenses states
  const [expenses, setExpenses] = useState([]);
  const [expenseType, setExpenseType] = useState("shuttlecock");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseSummary, setExpenseSummary] = useState({
    shuttlecock: 0,
    court: 0,
  });

  // New state to track how expense is deducted
  const [deductFrom, setDeductFrom] = useState("cash"); // cash, gcash, or both

  useEffect(() => {
    fetchPlayers();
    fetchExpenses();
    fetchExpenseSummary();
  }, []);

  const fetchPlayers = () => {
    axios
      .get("http://localhost:3000/api/players/done")
      .then((res) => {
        setPlayers(res.data);
        setLoading(false);
        calculateTotals(res.data);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchExpenses = () => {
    axios
      .get("http://localhost:3000/api/expenses")
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error("Failed to fetch expenses", err));
  };

  const fetchExpenseSummary = () => {
    axios
      .get("http://localhost:3000/api/expenses/summary")
      .then((res) => setExpenseSummary(res.data))
      .catch((err) => console.error("Failed to fetch expense summary", err));
  };

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

    // Deduct expenses from cash and gcash based on the deductions recorded in expenses
    // For that, we'll calculate deductions now:

    let cashDeducted = 0;
    let gcashDeducted = 0;

    expenses.forEach((exp) => {
      // Assuming each expense has 'deduct_from' property that can be 'cash', 'gcash', or 'both'
      if (exp.deduct_from === "cash") {
        cashDeducted += exp.amount;
      } else if (exp.deduct_from === "gcash") {
        gcashDeducted += exp.amount;
      } else if (exp.deduct_from === "both") {
        cashDeducted += exp.amount / 2;
        gcashDeducted += exp.amount / 2;
      }
    });

    setTotals({
      cash: Math.max(0, cashTotal - cashDeducted),
      gcash: Math.max(0, gcashTotal - gcashDeducted),
      overall: Math.max(0, cashTotal + gcashTotal - (cashDeducted + gcashDeducted)),
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

  // Add new expense
  const handleAddExpense = () => {
    if (!expenseAmount || isNaN(expenseAmount) || Number(expenseAmount) <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    setExpenseLoading(true);

    axios
      .post("http://localhost:3000/api/expenses", {
        type: expenseType,
        amount: Number(expenseAmount),
        deduct_from: deductFrom, // sending deduction info
      })
      .then(() => {
        setExpenseAmount("");
        fetchExpenses();
        fetchExpenseSummary();
      })
      .catch((err) => {
        console.error("Failed to add expense", err);
        alert("Failed to add expense, try again.");
      })
      .finally(() => setExpenseLoading(false));
  };

  // Recalculate totals whenever players or expenses change
  useEffect(() => {
    calculateTotals(players);
  }, [expenses]);

  if (loading) return <p>Loading players...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payment Page</h1>

      {/* Totals Summary */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Total Payments Received (After Expenses Deduction)</h2>
        <div className="flex gap-6">
          <div className="flex-1 p-4 bg-green-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">Cash</h3>
            <p className="text-2xl font-bold">₱{totals.cash.toFixed(2)}</p>
            <div
              className="h-2 bg-green-600 rounded mt-2"
              style={{
                width: `${totals.overall ? (totals.cash / totals.overall) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex-1 p-4 bg-blue-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">GCash</h3>
            <p className="text-2xl font-bold">₱{totals.gcash.toFixed(2)}</p>
            <div
              className="h-2 bg-blue-600 rounded mt-2"
              style={{
                width: `${totals.overall ? (totals.gcash / totals.overall) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex-1 p-4 bg-gray-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">Overall</h3>
            <p className="text-2xl font-bold">₱{totals.overall.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Players Payment Table */}
      {players.length === 0 ? (
        <p>No players need payment.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300 mb-12">
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
                <td className="border border-gray-300 px-4 py-2">₱{player.games_played * 30}</td>
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

      {/* Expenses Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Expenses</h2>

        {/* Add Expense Form */}
        <div className="flex items-center space-x-4 mb-6 max-w-md">
          <select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="shuttlecock">Shuttlecock</option>
            <option value="court">Court</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-32"
            min="0"
            step="0.01"
          />
          {/* Deduct from selector */}
          <select
            value={deductFrom}
            onChange={(e) => setDeductFrom(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="cash">Deduct from Cash</option>
            <option value="gcash">Deduct from GCash</option>
            <option value="both">Split Between Cash & GCash</option>
          </select>

          <button
            onClick={handleAddExpense}
            disabled={expenseLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {expenseLoading ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Expenses Table */}
        {expenses.length === 0 ? (
          <p>No expenses recorded yet.</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Deducted From</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 capitalize">{expense.type}</td>
                  <td className="border border-gray-300 px-4 py-2">₱{expense.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 capitalize">{expense.deduct_from}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Expense Summary Bars */}
        <div className="flex gap-6 max-w-md">
          <div className="flex-1 p-4 bg-red-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">Shuttlecock Expenses</h3>
            <p className="text-2xl font-bold">₱{expenseSummary.shuttlecock || 0}</p>
            <div
              className="h-2 bg-red-600 rounded mt-2"
              style={{
                width: `${
                  expenseSummary.shuttlecock + expenseSummary.court
                    ? (expenseSummary.shuttlecock /
                        (expenseSummary.shuttlecock + expenseSummary.court)) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="flex-1 p-4 bg-purple-100 rounded shadow text-center">
            <h3 className="text-lg font-medium mb-1">Court Expenses</h3>
            <p className="text-2xl font-bold">₱{expenseSummary.court || 0}</p>
            <div
              className="h-2 bg-purple-600 rounded mt-2"
              style={{
                width: `${
                  expenseSummary.shuttlecock + expenseSummary.court
                    ? (expenseSummary.court /
                        (expenseSummary.shuttlecock + expenseSummary.court)) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
