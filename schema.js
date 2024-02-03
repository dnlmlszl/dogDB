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
  }

  type Query {
    hello: String
    userCount: Int!
    users: [User]
    singleUser(userId: ID!): User
    token(email: String!, password: String!): Token
    me: User
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
  }

`;

module.exports = typeDefs;
