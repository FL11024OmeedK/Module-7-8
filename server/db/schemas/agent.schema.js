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
