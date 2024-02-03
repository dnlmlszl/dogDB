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
