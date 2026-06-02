// Defines the shape of a User document in the `users` MongoDB collection.
// Users are created manually in MongoDB Atlas — no API endpoint for user creation.

export function createUser({ first_name, last_name, email, password }) {
  return {
    first_name,
    last_name,
    email,
    password,
  };
}
