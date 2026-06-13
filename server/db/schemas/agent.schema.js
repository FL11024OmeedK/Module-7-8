// Defines the shape of an Agent document in the `agents` MongoDB collection.
// Import createAgent and call it before any insertOne() or updateOne() operation.

export function createAgent({ first_name, last_name, email, region, rating, fee }) {
  return {
    first_name,
    last_name,
    email,
    region,
    rating: Number(rating),
    fee: Number(fee),
    sales: 0,
  };
}

export function updateAgent({ first_name, last_name, email, region, rating, fee }) {
  return {
    first_name,
    last_name,
    email,
    region,
    rating: Number(rating),
    fee: Number(fee),
  };
}

// Validates raw agent input before createAgent/updateAgent shape it for the database.
// Returns an error message string for the first invalid field, or null if all fields pass.
export function validateAgent({ first_name, last_name, email, region, rating, fee }) {
  if (typeof first_name !== "string" || !first_name.trim())
    return "first_name is required and must be text";
  if (typeof last_name !== "string" || !last_name.trim())
    return "last_name is required and must be text";
  // Simple email shape check: something@something.something
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email))
    return "email must be a valid email address";
  if (!["North", "South", "East", "West"].includes(region))
    return "region must be one of North, South, East, West";
  if (rating === "" || rating === undefined || Number.isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 100)
    return "rating must be a number between 0 and 100";
  if (fee === "" || fee === undefined || Number.isNaN(Number(fee)) || Number(fee) < 0)
    return "fee must be a number of 0 or more";
  return null;
}
