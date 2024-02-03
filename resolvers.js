const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pubsub = new PubSub();
const { v4: uuidv4 } = require('uuid');

const User = require('./models/User');

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
  },
};

module.exports = resolvers;
