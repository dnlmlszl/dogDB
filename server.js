require('dotenv').config();

const { Sequelize } = require('sequelize');

const { ApolloServer } = require('@apollo/server');

const { expressMiddleware } = require('@apollo/server/express4');
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const connectDB = require('./db/connect');
const { sequelize, initializeDatabase } = require('./db/sequelize');

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const User = require('./models/User');

const jwt = require('jsonwebtoken');

const app = express();

app.use(cookieParser());

const httpServer = http.createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

app.use(cors());

app.use(express.json());

(async () => {
  await initializeDatabase(sequelize);
  await server.start();
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ res, req }) => {
        let currentUser = null;
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7);
          try {
            const decodedToken = jwt.verify(token, process.env.SECRET);
            currentUser = await User.findByPk(decodedToken.id);
          } catch (error) {
            console.error('There was an error when authenticated', error);
          }
        }
        return { currentUser, res };
      },
    })
  );
})();

// app.use(express.static('dist'));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

const PORT = process.env.PORT || 8050;

const start = async () => {
  try {
    await connectDB(sequelize);
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
