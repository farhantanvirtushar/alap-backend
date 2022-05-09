import { Pool, PoolConfig, QueryResult } from "pg";

const config: any = {
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

const pool = new Pool(config);

const runQuery = (query_text: string, params: []) => {
  return new Promise((resolve, reject) => {
    pool.query(query_text, params, (error: Error, res: QueryResult<any>) => {
      if (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
        reject(error);
      }
      resolve(res);
    });
  });
};

module.exports = { runQuery };
