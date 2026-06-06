import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log(
   "Pinged your deployment. You successfully connected to MongoDB!"
  );
} catch(err) {
  console.error(err);
}

// agents database — stores real estate agent documents
// this is exported to routes/agents.js, where it is used to perform CRUD operations on agents. It is also exported to server.js, where it is imported by routes/agents.js and used indirectly by the route handlers.
export const agentsDb = client.db("agents");

// this is exported to routes/users.js, where it is used to perform login operations on user accounts. It is also exported to server.js, where it is imported by routes/users.js and used indirectly by the route handlers.
// users database — stores Rocket Elevators staff login accounts
export const usersDb = client.db("users");