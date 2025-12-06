import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Config prevents opening too many connections
const client = postgres(connectionString, {
  max: process.env.ENV === 'production' ? 10 : 1, // Use 1 connection in dev
  idle_timeout: 20, // Close idle connections quickly
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
