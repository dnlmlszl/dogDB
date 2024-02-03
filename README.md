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
If you once ceate and update you .env variables you do not need to update config/config.js, nor any other setting files.

### Models

The models folder in the Dog Database Server project contains Sequelize model definitions for the entities used in the application, such as User, Dog, and DogBreed. These models define the structure of the corresponding database tables, including the fields, data types, and associations between tables.

#### User Model:

Represents user data, including properties like id, username, email, role, fullName, profilePicture, bio, and country. This model is utilized for user-related operations.

#### Dog Model:

Describes the characteristics of a dog, such as id, name, description, url, image, and associations like breedId (relates to DogBreed) and userId (relates to User). This model handles dog-related functionalities.

#### DogBreed Model:

Represents information about dog breeds, including id, name, group, section, provisional, country, url, and associations like dogId (relates to Dog). This model is used for managing dog breed data.

These Sequelize models define the structure of the database tables, and the associations between them help establish relationships in the database schema. The models are essential for database operations, ensuring data consistency and integrity as per the defined schema. The sequelize.js configuration guarantees, that later on there is no need update manually the models. Please note, that you need to comment out references before the first run of the server. Later on, when all the models are already created you need to uncomment the references.

## GraphQL Schema and Resolvers

The GraphQL schema and resolvers define the structure and behavior of the API. You can find them in the schema and resolvers directories.

### schema.js

```javascript
const typeDefs = `
  type Token {
    value: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String
    fullName: String!
    profilePicture: String
    bio: String
    country: String
    dogId: [Dog]
  }

  type DogBreed {
    id: ID!
    name: String!
    group: String!
    section: String!
    provisional: String
    country: String!
    url: String!
    image: String
    pdf: String
    dogId: [Dog]
  }

  type Dog {
    id: ID!
    name: String!
    description: String
    url: String!
    image: String
    breedId: DogBreed!
    userId: User!
  }

  type Query {
    hello: String
    userCount: Int!
    users: [User]
    singleUser(userId: ID!): User
    token(email: String!, password: String!): Token
    me: User
    dogs: [Dog]
    dogBreeds: [DogBreed]
  }

  type Mutation {
    createUser(
      email: String!, 
      password: String!, 
      username: String!, 
      fullName: String!, 
      role: String, 
      profilePicture: String, 
      bio: String): User
    
    login(email: String!, password: String!): Token
    
     createDog(
      name: String!, 
      description: String, 
      url: String!, 
      image: String, 
      breedId: ID!): Dog

    createDogBreed(
      name: String!, 
      group: String!, 
      section: String!, 
      provisional: String, 
      country: String!, 
      url: String!, 
      image: String, 
      pdf: String, 
      dogId: ID): DogBreed

    deleteDog(id: ID!): Boolean
  }

`;

module.exports = typeDefs;
```

The current schema defines the structure of the Dog Database Server API. It outlines the types of data available and the queries and mutations that can be performed. Types such as User, Dog, and DogBreed specify the fields and relationships accessible in GraphQL queries. Operations like createUser and createDog define the logic for queries and mutations. The schema serves as a blueprint for the GraphQL API, dictating how data is organized and interacted with.

### resolver.js

```javascript
const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pubsub = new PubSub();
const { v4: uuidv4 } = require('uuid');

const User = require('./models/User');
const Dog = require('./models/Dog');
const DogBreed = require('./models/DogBreed');

const resolvers = {
  Query: {
    hello: () => {
      return "Hello Guys, I'm proud of You all!";
    },
    userCount: async () => {
      try {
        const count = await User.count();
        return count;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    users: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    singleUser: async (_, { userId }) => {
      try {
        const user = await User.findOne({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'USER_NOT_FOUND',
              invalidArgs: userId,
            },
          });
        }

        return user;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    dogs: async () => {
      try {
        const dogs = await Dog.findAll();
        return dogs;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    dogBreeds: async () => {
      try {
        const dogBreeds = await DogBreed.findAll();
        return dogBreeds;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
  },
  Mutation: {
    createUser: async (_, args) => {
      try {
        if (
          !args ||
          !args.email ||
          !args.password ||
          !args.username ||
          !args.fullName
        ) {
          throw new GraphQLError('Invalid input arguments', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(args.password, saltRounds);

        const existingUser = await User.findOne({
          where: {
            email: args.email,
          },
        });

        if (existingUser) {
          throw new GraphQLError('User already exists', {
            extensions: {
              code: 'USER_ALREADY_EXISTS',
              invalidArgs: args.email,
            },
          });
        }

        const role = (await User.count()) === 0 ? 'ADMIN' : 'EDITOR';

        const user = await User.create({
          ...args,
          passwordHash,
          role,
        });

        const savedUser = await user.save();

        return savedUser;
      } catch (error) {
        console.error(error);

        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            errorMessage: error.message,
          },
        });
      }
    },
    login: async (_, args, { res }) => {
      try {
        if (!args || !args.email || !args.password) {
          throw new GraphQLError('Invalid input arguments', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const user = await User.findOne({
          where: {
            email: args.email,
          },
        });

        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'USER_NOT_FOUND',
              invalidArgs: args.email,
            },
          });
        }

        const passwordCorrect =
          user === null
            ? false
            : await bcrypt.compare(args.password, user.passwordHash);

        if (!passwordCorrect) {
          throw new GraphQLError('wrong credentials', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        const userForToken = {
          email: user.email,
          role: user.role,
          id: user.id,
          username: user.username,
          fullName: user.fullName,
        };

        const accessToken = jwt.sign(userForToken, process.env.SECRET, {
          expiresIn: '15m',
        });

        const refreshToken = jwt.sign(
          userForToken,
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: '7d',
          }
        );

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
        });

        return {
          value: accessToken,
        };
      } catch (error) {
        throw new GraphQLError('Login failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            errorMessage: error.message,
          },
        });
      }
    },
    createDog: async (_, args, { currentUser }) => {
      try {
        if (!currentUser) {
          throw new GraphQLError('User not authenticated', {
            extensions: {
              code: 'UNAUTHORIZED',
            },
          });
        }

        if (!args || !args.name || !args.url || !args.breedId) {
          throw new GraphQLError('Invalid input arguments', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const dog = await Dog.create({
          ...args,
          userId: currentUser.id,
        });

        const savedDog = await dog.save();

        return savedDog;
      } catch (error) {
        throw new GraphQLError('Creating the dog failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            errorMessage: error.message,
          },
        });
      }
    },
    createDogBreed: async (_, args, { currentUser }) => {
      try {
        if (!currentUser || currentUser.role !== 'ADMIN') {
          throw new GraphQLError('User not authenticated', {
            extensions: {
              code: 'UNAUTHORIZED',
            },
          });
        }

        if (
          !args ||
          !args.name ||
          !args.group ||
          !args.section ||
          !args.country ||
          !args.url
        ) {
          throw new GraphQLError('Invalid input arguments', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const dogBreed = await DogBreed.create({
          ...args,
        });

        const savedDogBreed = await dogBreed.save();

        return savedDogBreed;
      } catch (error) {
        console.error(error);

        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            errorMessage: error.message,
          },
        });
      }
    },
    deleteDog: async (_, args, { currentUser }) => {
      try {
        if (!currentUser || currentUser.role !== 'ADMIN') {
          throw new GraphQLError('User not authenticated', {
            extensions: {
              code: 'UNAUTHORIZED',
            },
          });
        }

        if (!args || !args.id) {
          throw new GraphQLError('Invalid input arguments', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const deletedDog = await Dog.destroy({
          where: {
            id: args.id,
          },
        });

        return deletedDog > 0;
      } catch (error) {
        throw new GraphQLError('Deleting the dog failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            errorMessage: error.message,
          },
        });
      }
    },
  },
};

module.exports = resolvers;
```

The resolver file (resolvers.js) contains the implementation of the GraphQL schema defined in the server. It includes various functions for handling queries and mutations specified in the schema. For instance, the createUser function manages the creation of a user, login handles user authentication, and createDog takes care of adding a new dog entry. These resolver functions interact with the underlying database using Sequelize and incorporate business logic, error handling, and authorization checks. The resolvers bridge the gap between the GraphQL schema and the database, ensuring the proper execution of GraphQL operations.

## Contributors

### Daniel Laszlo

daniel.mlaszlo@yahoo.com

Feel free to contribute by opening issues or creating pull requests.
