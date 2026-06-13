// Transactions.jsx
// Displays the last 10 transactions in a table and provides a form to add new ones.
// Each row has an Edit button that loads the transaction into the same form
// (submitting then PATCHes instead of POSTing) and a Delete button that
// removes the transaction after confirmation.
// Uses ConfirmationModal (Feature 3) and showAlert (Feature 2) from existing infrastructure.
// Calls useTokenValidation to protect this route — redirects to /login without a valid session.

import { useEffect, useRef, useState } from "react";
import { useAlert } from "../context/AlertContext";
import ConfirmationModal from "./ConfirmationModal";
import useTokenValidation from "../hooks/useTokenValidation";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [agents, setAgents] = useState([]);
  // agentMap lets us resolve agent_id → "First Last" without a backend join.
  const [agentMap, setAgentMap] = useState({});
  const [form, setForm] = useState({ amount: "", agent_id: "" });
  // editingId holds the _id of the transaction being edited, or null when creating a new one.
  // This mirrors the isNew pattern in AgentForm, but kept on the same page as the table.
  const [editingId, setEditingId] = useState(null);
  // pendingDeleteId holds the _id awaiting delete confirmation (same pattern as AgentList).
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { showAlert } = useAlert();
  // Points at the form card so startEdit can scroll it into view —
  // without this, clicking Edit changes a form that's below the fold and looks like nothing happened.
  const formRef = useRef(null);
  useTokenValidation();

  // Fetch agents and transactions on mount in parallel.
  useEffect(() => {
    fetchAgents();
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch("http://localhost:5050/transaction-data");
      const { data } = await res.json();
      setTransactions(data || []);
    } catch {
      showAlert("Failed to load transactions.", "danger");
    }
  }

  // GET /agents still requires the JWT Authorization header (known M7 leftover — not replaced in M8).
  async function fetchAgents() {
    try {
      const res = await fetch("http://localhost:5050/agents/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAgents(data);
      // Build a lookup map { [_id]: "First Last" } for resolving names in the table.
      const map = {};
      data.forEach((a) => { map[a._id] = `${a.first_name} ${a.last_name}`; });
      setAgentMap(map);
    } catch {
      // Silently fail — agent names will show the raw ID if unavailable.
    }
  }

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  // Loads an existing transaction into the form so it can be edited.
  function startEdit(t) {
    setEditingId(t._id);
    setForm({ amount: String(t.amount), agent_id: t.agent_id });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Leaves edit mode and resets the form back to "new transaction".
  function cancelEdit() {
    setEditingId(null);
    setForm({ amount: "", agent_id: "" });
  }

  // onSubmit validates the form then opens the confirmation modal.
  // Each check shows a toast explaining what to fix instead of failing silently.
  function onSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      showAlert("Amount must be a positive number.", "danger");
      return;
    }
    if (!form.agent_id) {
      showAlert("Please select an agent.", "danger");
      return;
    }
    setShowModal(true);
  }

  // handleDelete fires after the user confirms a delete in the modal.
  async function handleDelete() {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      const res = await fetch(`http://localhost:5050/transaction/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const { message } = await res.json();
        showAlert(message || "Failed to delete transaction.", "danger");
        return;
      }
      showAlert("Transaction deleted successfully.", "success");
      // If the deleted row was loaded in the edit form, reset the form too.
      if (editingId === id) cancelEdit();
      fetchTransactions();
    } catch {
      showAlert("Failed to delete transaction.", "danger");
    }
  }

  // handleConfirm fires after the user confirms in the modal.
  // POSTs a new transaction, or PATCHes the existing one when in edit mode.
  async function handleConfirm() {
    setShowModal(false);
    try {
      const url = editingId
        ? `http://localhost:5050/transaction/${editingId}`
        : "http://localhost:5050/transaction";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(form.amount), agent_id: form.agent_id }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        showAlert(message || "Failed to save transaction.", "danger");
        return;
      }
      showAlert(editingId ? "Transaction updated successfully." : "Transaction saved successfully.", "success");
      setEditingId(null);
      setForm({ amount: "", agent_id: "" });
      fetchTransactions();
    } catch {
      showAlert("Failed to save transaction.", "danger");
    }
  }

  return (
    <>
      {/* One modal, three flows: delete takes priority, otherwise update/create based on edit mode. */}
      <ConfirmationModal
        show={showModal || pendingDeleteId !== null}
        message={
          pendingDeleteId
            ? "Are you sure you want to delete this transaction?"
            : editingId
            ? "Are you sure you want to update this transaction?"
            : "Are you sure you want to submit this transaction?"
        }
        onConfirm={pendingDeleteId ? handleDelete : handleConfirm}
        onCancel={() => { setShowModal(false); setPendingDeleteId(null); }}
      />

      <div className="flex flex-col gap-8">

        {/* Transaction Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Agent
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        No transactions yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr
                        key={t._id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 align-middle">${t.amount}</td>
                        <td className="p-4 align-middle">
                          {agentMap[t.agent_id] || t.agent_id}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
                              type="button"
                              onClick={() => startEdit(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
                              type="button"
                              onClick={() => setPendingDeleteId(t._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* New Transaction Form */}
        <div ref={formRef} className="border rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Transaction" : "New Transaction"}
          </h3>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">

            {/* Amount field — positive numbers only */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium leading-6 text-slate-900">
                Amount
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    min="0.01"
                    step="any"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => updateForm({ amount: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agent dropdown */}
            <div>
              <label htmlFor="agent_id" className="block text-sm font-medium leading-6 text-slate-900">
                Agent
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    id="agent_id"
                    name="agent_id"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 focus:ring-0 sm:text-sm sm:leading-6"
                    value={form.agent_id}
                    onChange={(e) => updateForm({ agent_id: e.target.value })}
                    required
                  >
                    <option value="">Select an agent</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a._id} {a.first_name} {a.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="submit"
                value={editingId ? "Update Transaction" : "Submit Transaction"}
                className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
              />
              {/* Cancel only appears in edit mode — it returns the form to "new" without saving. */}
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </>
  );
}
