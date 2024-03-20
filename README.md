below are graphql endpoints 

mutation loginUser {
    login(loginInput: {email:"aryan@gmail.com",password:"Minato@123"}){
      id
      username
      email
      token
    }
}

mutation createUser {
    register(registerInput: {username:"aryan",email:"aryan@gmail.com",    password:"Minato@123",confirmPassword:"Minato@123"}){
      id
      username
      email
      token
    }
}

mutation createPost {
    createPost(body:"this is third post"){
      id
      username
      body
      createdAt
    }
}

mutation deletepost{
      deletePost(postId: "65fa861ef096fd6fea64fd0a")
}

query getusers{
  getUsers{
   id
    username
    email
  }
}

query getUser{
  getUser(userId: "65fafc78208e259c5485d3a3"){
    username
    email
    id
  }
}

query getownpost{
  getOwnPosts {
    id
    body
  }
}

query getallpost{
  getAllPosts {
    id
    body
    username
  }
}
  
   query getPost{
  getPost(postId: "65faff601bda86b1ed7d3e1b"){
    username
    body
  }
}

mutation follow{
  followUser(username: "aryan")
}

query getfollowerUserpost{
getPostOfFollowers{
  body
  username
  createdAt
}
}
