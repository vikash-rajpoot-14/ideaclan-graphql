module.exports = `#graphql
 type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
  }
  
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }


  input LoginInput {
    password: String!
    email: String!
  }

  type Query {
    getUsers:[User]
    getUser(userId: ID!): User
    getOwnPosts: [Post]
    getAllPosts: [Post]
    getPostOfFollowers: [Post]!
    getPost(postId: ID!): Post
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    followUser(username: String!): String
  }
 
`


