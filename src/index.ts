import express from "express";

console.log(process.env.NODE_ENV);

// Here, we import our dotenv package and set up default configurations. This is
// what allows our .env file to be used in our project.
require("dotenv").config();

// instantiate our app with express
const app = express();

// initialize the server
app.listen({ port: process.env.SERVER_PORT }, () => {
  console.log(`Server ready on port ${process.env.SERVER_PORT}`);
});
