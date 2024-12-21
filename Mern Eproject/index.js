const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const {dbConn} = require('./Config/db');

const corss = {
  origin: "http://localhost:3000",
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corss));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  getUsers,
  addUser,
  updateUser,
  deleteUser,

  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,

  getUserRoles,
  addUserRole,
  updateUserRole,
  deleteUserRole,

  VerifyEmail,
  LoginUser,
  forgotPassword,
  verifyOtp,
  resetPassword

} = require("./Controller/Users");

app.route("/user").get(getUsers).post(addUser);
app.route("/user/:id").delete(deleteUser).put(updateUser);

app.route("/staffrole").get(getStaff).post(addStaff);
app.route("/staffrole/:id").delete(deleteStaff).put(updateStaff);

app.route("/userrole").get(getUserRoles).post(addUserRole);
app.route("/userrole/:id").delete(deleteUserRole).put(updateUserRole);

app.route('/verifyEmail').post(VerifyEmail);
app.route('/user/loginuser').post(LoginUser);
app.route('/user/forgotPassword').post(forgotPassword);
app.route('/user/verifyOtp').post(verifyOtp);
app.route('/user/resetPassword').post(resetPassword);



app.listen(process.env.PORT, function () {
  console.log(`Server is running at: http://localhost:${process.env.PORT}/`);
  dbConn();
});
