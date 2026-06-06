// useState and useEffect are built-in React Hooks.
// useState stores values that can change; useEffect runs code after React renders.
import { useState, useEffect } from "react";
// useParams and useNavigate are built-in React Router Hooks.
// useParams reads URL values like :id; useNavigate sends the user to another route.
import { useParams, useNavigate } from "react-router-dom";

export default function AgentForm() {
  // useState returns two things: the current value and a function to update it.
  // form and setForm are the current state and the function to update it, respectively. form is an object that holds all the input values for the form. We initialize it with empty strings. 
  //.setForm comes from useState, but it is not a built-in function; we can name it whatever we want. By convention, we use "set" + the name of the state variable, whcih is form.
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    region: "",
    rating: "",
    fee: "",
  });
  // isNew tracks whether this form is creating a new agent or editing an existing one. We initialize it to true, assuming that we are creating a new agent until we check the URL parameters. If we find an id in the URL parameters, we will set isNew to false, indicating that we are editing an existing agent. This variable is important because it determines whether we will send a POST request to create a new agent or a PATCH request to update an existing agent when the form is submitted. isNew is a piece of state that we manage within the AgentForm component, and it helps us control the behavior of the form based on whether we are creating a new agent or editing an existing one. Its value is either true or false, and it is updated based on the presence of an id in the URL parameters when the component loads. The presence of an id in the URL is detected using the useParams hook in AgentForm.jsx, which reads the route parameters from the URL. If an id is found, we set isNew to false, indicating that we are editing an existing agent. If no id is found, we keep isNew as true, indicating that we are creating a new agent. This state variable is crucial for determining the correct API endpoint and HTTP method to use when submitting the form data to the server. setIsNew is the function that we use to update the value of isNew. We call setIsNew(false) when we detect that we are editing an existing agent, and we call setIsNew(true) when we are creating a new agent. By managing the isNew state variable, we can ensure that our form behaves correctly for both creating and editing agents, providing a seamless user experience.
  const [isNew, setIsNew] = useState(true);
  // useParams reads route parameters from the URL, such as /edit/:id.
  const params = useParams();
  // useNavigate gives us a function that can move the user to another page.
  const navigate = useNavigate();

  // useEffect runs after the component loads and again when params.id or navigate changes.
  useEffect(() => {
    async function fetchData() {
      // Optional chaining (?.) safely calls toString only if params.id exists.
      const id = params.id?.toString() || undefined;
      if(!id) return;
      setIsNew(false);
      // fetch is a built-in browser function for making HTTP requests.
      const response = await fetch(
        `http://localhost:5050/agents/${params.id.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const agent = await response.json();
      if (!agent) {
        console.warn(`Agent with id ${id} not found`);
        navigate("/");
        return;
      }
      // setForm updates React state, which causes the form inputs to re-render.
      setForm(agent);
    }
    fetchData();
    return;
  }, [params.id, navigate]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  // This function will handle the submission.
  async function onSubmit(e) {
    // preventDefault stops the browser from refreshing the page on form submit.
    e.preventDefault();
    const person = { ...form };
    try {
      let response;
      if (isNew) {
        // if we are adding a new agent we will POST to /agents.
        response = await fetch("http://localhost:5050/agents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          // JSON.stringify converts a JavaScript object into JSON text for the server.
          body: JSON.stringify(person),
        });
      } else {
        // if we are updating an agent we will PATCH to /agents/:id.
        response = await fetch(`http://localhost:5050/agents/${params.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          // JSON.stringify converts a JavaScript object into JSON text for the server.
          body: JSON.stringify(person),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('A problem occurred with your fetch operation: ', error);
    } finally {
      setForm({ first_name: "", last_name: "", email: "", region: "", rating: "", fee: "" });
      navigate("/");
    }
  }

  // This following section will display the form that takes the input from the user.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">Create/Update Agent</h3>
      <form
        onSubmit={onSubmit}
        className="border rounded-lg overflow-hidden p-4"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">
              Agent Info
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 ">
            <div className="sm:col-span-4">
              <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-slate-900">
                First Name
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="First name"
                    value={form.first_name}
                    onChange={(e) => updateForm({ first_name: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-slate-900">
                Last Name
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={(e) => updateForm({ last_name: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                Email
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="agent@rocket.elv"
                    value={form.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Region
              </label>
              <div className="mt-2 flex gap-6">
                {/* map loops over the region names and returns one radio button for each. */}
                {["North", "South", "East", "West"].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm text-slate-900 cursor-pointer">
                    <input
                      type="radio"
                      name="region"
                      value={r}
                      checked={form.region === r}
                      onChange={(e) => updateForm({ region: e.target.value })}
                      className="accent-indigo-600"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="rating" className="block text-sm font-medium leading-6 text-slate-900">
                Rating
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="number"
                    name="rating"
                    id="rating"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="0"
                    value={form.rating}
                    onChange={(e) => updateForm({ rating: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="fee" className="block text-sm font-medium leading-6 text-slate-900">
                Fee
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="number"
                    name="fee"
                    id="fee"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="0"
                    value={form.fee}
                    onChange={(e) => updateForm({ fee: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          type="submit"
          value="Save Agent"
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
        />
      </form>
    </>
  );
}
