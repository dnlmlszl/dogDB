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
      breedId: ID!, 
      userId: ID!): Dog

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
  }

`;

module.exports = typeDefs;
