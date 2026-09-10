import app from "../src/app";

// Vercel serverless entry — exports the Express app directly.
// No app.listen() here; Vercel invokes this per-request.
export default app;
