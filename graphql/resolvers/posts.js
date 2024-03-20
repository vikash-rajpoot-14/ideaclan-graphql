const { GraphQLError }= require('graphql');
const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const User = require('../../models/User');

module.exports = {
  Query: {

    //GET ALL POSTS
    async getAllPosts(){
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
    },

    //GET USER OWN POSTS
    async getOwnPosts(_,args,context) {
        const user = checkAuth(context);
         const username = user.username;
      try {
        const posts = await Post.find({ username }).sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new GraphQLError(`${Object.values(err).join(",")}`, {
          extensions: {
            code: err.message,
            statusCode: 400,
          },
        });
      }
    },

    // GET A POST
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new GraphQLError("Post Not Found", {
            extensions: {
              code: err.message,
              statusCode : 404,
            },
          });
        }
      } catch (err) {
        throw new GraphQLError(`${Object.values(err).join(",")}`, {
          extensions: {
            code: err.message,
            statusCode : 400,
          },
        });
      }
    },

    //POSTS OF THOSE USERS, USER FOLLOW
    async getPostOfFollowers(_,args,context){
        const user = checkAuth(context);
        const username = user.username;
        try{
        const followeduser = await User.findOne({username}).populate('follow').select('follow');
        let post = [];
        for(let userObj of followeduser.follow) {
            const UserPosts = await Post.find({username: userObj.username})
            post = post.concat(UserPosts)
        }
        const sortedPosts = post.sort((a, b) => {
            return b.createdAt - a.createdAt
          });

        return sortedPosts ;
        
      }catch(err){
        throw new GraphQLError(`${Object.values(err).join(",")}`, {
          extensions: {
            code: err.message,
            statusCode : 400,
          },
        });
      }
    }
  },

  //MUTATION
  Mutation: {

    //CREATE A NEW POST
    async createPost(_, { body }, context) {

      const user = checkAuth(context);

      if (body.trim() === '') {
        throw new GraphQLError(`Post body must not be empty`, {
          extensions: {
            code: err.message,
            statusCode : 400,
          },
        });
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      });

      const post = await newPost.save();

      return post;
    },

// DELETING POST
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if(!post){
          throw new GraphQLError(`Post does not exist anymore`, {
            extensions: {
              code: err.message,
              statusCode : 404
            },
          });
        }
        if (user.username === post.username) {
          await Post.findByIdAndDelete(postId);
          return 'Post deleted successfully';
        } else {
            throw new GraphQLError("Action not allowed", {
                extensions: {
                    code: 'USER_INPUT_ERROR',
                    statusCode : 400
                },
            });
        }
      } catch (err) {
        throw new GraphQLError(err, {
            extensions: {
                code: `error while deleting post ${err.message}`,
                statusCode : 400
            },
        });

      }
    },
 }
}