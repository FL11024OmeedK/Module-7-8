// Seed script — populates the agents collection with data from previous modules.
// Run from the server/ directory:  node --env-file=config.env seed.js

import { MongoClient, ServerApiVersion } from "mongodb";

const AGENTS = [
  // North Region
  { first_name: "Orlando",  last_name: "Perez",          email: "perez@rocket.elv",    region: "North", rating: 95,  fee: 10000 },
  { first_name: "Brutus",   last_name: "Konway",          email: "brutus@rocket.elv",   region: "North", rating: 92,  fee: 9000  },
  { first_name: "Jeff",     last_name: "Lebow",           email: "carpet@rocket.elv",   region: "North", rating: 92,  fee: 10000 },
  { first_name: "Zed",      last_name: "Roles",           email: "zebra@rocket.elv",    region: "North", rating: 100, fee: 4321  },
  // South Region
  { first_name: "Roger",    last_name: "Babbel",          email: "loons@rocket.elv",    region: "South", rating: 60,  fee: 5000  },
  { first_name: "Zach",     last_name: "Van Den Zilch",   email: "zach@rocket.elv",     region: "South", rating: 70,  fee: 6000  },
  { first_name: "Bob",      last_name: "Boberson",        email: "bob@rocket.elv",      region: "South", rating: 85,  fee: 10000 },
  { first_name: "Dee",      last_name: "Omega",           email: "omega@rocket.elv",    region: "South", rating: 78,  fee: 7000  },
  // East Region
  { first_name: "Aaron",    last_name: "De Silva",        email: "aaron@rocket.elv",    region: "East",  rating: 89,  fee: 8900  },
  { first_name: "Bob",      last_name: "Robertson",       email: "bob2@rocket.elv",     region: "East",  rating: 85,  fee: 10000 },
  { first_name: "John",     last_name: "Johnson",         email: "john@rocket.elv",     region: "East",  rating: 75,  fee: 8000  },
  { first_name: "Elmar",    last_name: "Fade",            email: "elmar@rocket.elv",    region: "East",  rating: 95,  fee: 10000 },
  // West Region
  { first_name: "Brian",    last_name: "Bossman",         email: "papi@rocket.elv",     region: "West",  rating: 100, fee: 10001 },
  { first_name: "George",   last_name: "Cleese",          email: "monty@rocket.elv",    region: "West",  rating: 85,  fee: 5000  },
  { first_name: "Tanim",    last_name: "Homaini",         email: "tanim@rocket.elv",    region: "West",  rating: 96,  fee: 10000 },
  { first_name: "Al",       last_name: "Stein",           email: "relative@rocket.elv", region: "West",  rating: 54,  fee: 4000  },
];

const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

try {
  await client.connect();
  const collection = client.db("agents").collection("agents");

  let inserted = 0;
  let skipped = 0;

  for (const agent of AGENTS) {
    const exists = await collection.findOne({ email: agent.email });
    if (exists) {
      console.log(`Skipped (already exists): ${agent.email}`);
      skipped++;
    } else {
      await collection.insertOne({ ...agent, sales: 0 });
      console.log(`Inserted: ${agent.first_name} ${agent.last_name}`);
      inserted++;
    }
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped`);
} finally {
  await client.close();
}
