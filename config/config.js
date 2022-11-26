var dotenv = require("dotenv");

dotenv.config();

module.exports =
{
    "development": {
        "username": process.env.PGUSER,
        "password": process.env.PGPASSWORD,
        "database": process.env.PGDATABASE,
        "host": process.env.PGHOST,
        "port": 5432,
        "dialect": "postgres",
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            }
        }
    },
    "test": {
        "username": process.env.PGUSER,
        "password": process.env.PGPASSWORD,
        "database": process.env.PGDATABASE,
        "host": process.env.PGHOST,
        "port": 5432,
        "dialect": "postgres",
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            }
        }
    },
    "production": {
        "username": process.env.PGUSER,
        "password": process.env.PGPASSWORD,
        "database": process.env.PGDATABASE,
        "host": process.env.PGHOST,
        "port": 5432,
        "dialect": "postgres",
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            }
        }
    }
}