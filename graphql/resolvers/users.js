const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators.js");

const User = require("../../models/User");
const checkAuth = require("../../util/check-auth.js");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Query: {
    getUsers: async function (_, args) {
      const users = await User.find();
      return users;
    },
    getUser: async function (_, args) {
      const user = await User.findById(args.userId);
      return user;
    },
  },
  Mutation: {
    //user login functionality
    async login(_, { loginInput: { email, password } }) {
      try {
        // Validate login input
        const { errors, valid } = validateLoginInput(email, password);
        if (!valid) {
          throw new GraphQLError(Object.values(errors).join(", "), {
            extensions: {
              code: "USER_INPUT_ERROR",
            },
          });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: {
              code: "USER_INPUT_ERROR",
            },
          });
        }

        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new GraphQLError("Wrong credentials", {
            extensions: {
              code: "USER_INPUT_ERROR",
            },
          });
        }

        // Generate and return token
        const token = generateToken(user);
        console.log(token, user);
        return {
          ...user._doc,
          id: user._id,
          token,
        };
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: error.extensions.code || "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    ////user signup functionality
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new GraphQLError(`${Object.values(errors)}`, {
          extensions: {
            code: "USER_INPUT_ERROR",
            statusCode: 409,
          },
        });
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new GraphQLError("Username is taken", {
          extensions: {
            code: "USER_INPUT_ERROR",
          },
        });
      }
      const exist = await User.findOne({ email });
      if (exist) {
        throw new GraphQLError("User already exist", {
          extensions: {
            code: "USER_INPUT_ERROR",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password,
        confirmPassword,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    //FOLLOW A USER
    async followUser(_, { username }, context) {
      const user = checkAuth(context);
      try {
        if(user.username === username) {
            throw new GraphQLError("Action not Allowed", {
                extensions: {
                  code: "USER_INPUT_ERROR",
                  statusCode: 409,
                },
              });
        }
        const currUser = await User.findById(user.id);
        const fuser = await User.findOne({ username });
        if (!fuser) {
            throw new GraphQLError("User does not exist anymore", {
                extensions: {
                  code: "USER_INPUT_ERROR",
                  statusCode: 409,
                },
              });
        }
        if (currUser.follow.includes(fuser.id)) {
            currUser.follow = currUser.follow.filter(id => id === fuser.id)
            await currUser.save();
            return `Unfollow user ${username}`;
        }else{
            currUser.follow.push(fuser.id)
            await currUser.save();
            return `start following ${username}`;
        }
      } catch (err) {
        throw new GraphQLError(`${Object.values(err).join(",")}`, {
            extensions: {
              code: "USER_INPUT_ERROR",
              statusCode: 409,
            },
          });
      }
    },
  },
};
