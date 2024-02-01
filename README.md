# Dog Database Server

This is a Node.js server application that connects to a PostgreSQL database and provides a GraphQL API for a dog database.

## Installation

1. Clone the project from GitHub:

   ```bash
   git clone https://github.com/dnlmlszl/dogDB.git

   ```

2. Set up your environment variables:

Create a .env file in the root of the project and add the following:

```env
PSQL_EXTERNAL_URL=your_postgres_database_url
SECRET=your_jwt_secret
PORT=8050
```

Replace your_postgres_database_url with the actual URL of your PostgreSQL database, and choose a secret for JWT.

## Usage

1. Start the server

```bash
npm dev
or
yarn dev
```

The server will run on port 8050 by default.

2. Access the GraphQL playground:

Open your browser and go to http://localhost:8050 to explore the GraphQL API using the playground.

## Database Initialization

The database will be synchronized automatically when the server starts. If you want to force synchronization (e.g., for testing), you can modify the force option in db/sequelize.js.

## Contributors

### Daniel Laszlo

daniel.mlaszlo@yahoo.com

Feel free to contribute by opening issues or creating pull requests.
