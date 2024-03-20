const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY);
        return user;
      } catch (err) {
        throw new GraphQLError("Invalid/Expired token", {
          extensions: {
            code: err.message,
            statusCode: 401,
          },
        });
      }
    }
    throw new GraphQLError(
      "Authentication token must be 'Bearer [token] with single space",
      {
        extensions: {
          code: err.message,
          statusCode: 401,
        },
      }
    );
  }
  throw new GraphQLError("Authorization header must be provided", {
    extensions: {
      code: err.message,
      statusCode: 401,
    },
  });
};
