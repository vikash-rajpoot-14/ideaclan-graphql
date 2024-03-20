const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const http = require('http')

dotenv.config({ path: "./config.env" });
const app = express();

const typeDefs = require("./graphql/typeDefs.js");
const resolvers = require("./graphql/resolvers");

const port = process.env.PORT || 5000;

const httpServer = http.createServer(app);

async function startServer() {

const server = new ApolloServer({
  typeDefs,
  resolvers,
  
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  
});

await server.start();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send(`api is running to test endpoint use graphql as endpoint`);
})

app.use(
  '/',
  expressMiddleware(server, {
    context: async ({ req }) => ({  req }),
  }),
);

  app.use("/graphql", expressMiddleware(server));

  mongoose
    .connect(process.env.MONGO_URI)
    .then(async() => {
      console.log("connected to database");
      await new Promise((resolve) => httpServer.listen({ port }, resolve));
      console.log(`Server ready at http://localhost:${port}/`);
    })
    .catch((err) => {
      console.log("error while connecting to DB" + err);
    });
}

startServer();



