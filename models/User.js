const { model, Schema } = require('mongoose');
const validator = require('validator');

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: {
        values: true,
        message: "please provide your name",
      },
    },
    email: {
      type: String,
      required: [true, "please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    ImageUrl: {
      type: String,
      default:
        "https://artscimedia.case.edu/wp-content/uploads/sites/79/2016/12/14205134/no-user-image.gif",
    },
    password: {
      type: String,
      required: [true, "please enter a secure password"],
      minLength : 5
    },
    confirmPassword:{
      type: String,
      required: true
    },
    follow : [{
      type: Schema.Types.ObjectId,
      ref: 'User' 
    }],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
