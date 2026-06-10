import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

// AgentRow renders a single agent as a table row.
const AgentRow = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.agent.first_name} {props.agent.last_name}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.agent.region}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.agent.rating}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.agent.fee}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.agent.sales}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to={`/edit/${props.agent._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            props.deleteAgent(props.agent._id);
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

// AgentList is the main component that fetches agent data, stores it in a variable called agents, and displays it in a table using the AgentRow component for each agent. It is called in the App component, which is the main layout for the app. The AgentList component also has a deleteAgent function that is passed down to each AgentRow component, allowing users to delete agents from the list. The useEffect hook is used to fetch the agent data from the server when the component mounts and whenever the length of the agents array changes, ensuring that the list stays up-to-date with any additions or deletions. Mounting refers to the process of rendering a component for the first time and adding it to the DOM. In this case, when the AgentList component is rendered for the first time, the useEffect hook will run and fetch the agent data from the server, populating the agents state variable with the fetched data. This allows the component to display the list of agents in a table format using the AgentRow component for each agent.

export default function AgentList() {
  const [agents, setAgents] = useState([]);
  const { showAlert } = useAlert();
  console.log(localStorage.getItem("token"));
  // This method fetches the agents from the database.
  useEffect(() => {
    async function getAgents() {
      const response = await fetch(`http://localhost:5050/agents/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const agents = await response.json();
      setAgents(agents);
    }
    getAgents();
    return;
  }, [agents.length]); // agents.length is a dependency of the useEffect hook, which means that the effect will run whenever the length of the agents array changes. This is important because we want to refetch the agents from the server whenever we add or delete an agent, which will change the length of the agents array. By including agents.length as a dependency, we ensure that our component stays up-to-date with the latest data from the server without causing an infinite loop of fetches. If we left out agents.length, the effect would only run once when the component mounts, and we would not see updates to the agent list after adding or deleting agents.

  // This method will delete an agent
  async function deleteAgent(id) {
    try {
      const response = await fetch(`http://localhost:5050/agents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error(response.statusText);
      const updatedAgents = agents.filter((el) => el._id !== id);
      setAgents(updatedAgents);
      showAlert("Agent deleted successfully.", "success");
    } catch {
      showAlert("Failed to delete agent.", "danger");
    }
  }

  // This method will map out the agents on the table
  function agentList() {
    return agents.map((agent) => {
      return (
        <AgentRow
          agent={agent}
          deleteAgent={() => deleteAgent(agent._id)}
          key={agent._id}
        />
      );
    });
  }

  // This following section will display the table with the agents.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">Agents</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Full Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Region
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Rating
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Fee
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Sales
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {agentList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
