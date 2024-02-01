const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pubsub = new PubSub();

const User = require('./models/User');

const resolvers = {
  Query: {
    hello: () => {
      return 'Hello World!';
    },
    userCount: async () => {},
  },
};

module.exports = resolvers;
