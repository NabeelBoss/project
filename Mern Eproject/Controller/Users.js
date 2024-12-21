const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../Modal/user');
const { StaffRole } = require('../Modal/staffrole');
const { UserRole } = require('../Modal/userrole');
const { sendVerificationEmail, senWelcomeEmail, VerificationEmailforget } = require("../middleware/Email");
const mongoose = require('mongoose');

// image packages
const multer = require("multer");
const cloud = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary");







// @METHOD GET
// API: http://localhost:5000/user
async function getUsers(req, res) {
    try {
        const users = await User.find()
            .populate('userRole')  // Correct field name here
            .populate('staffRole'); // Correct field name here
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error fetching users' });
    }
}


// @METHOD POST
// API: http://localhost:5000/user

cloud.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_API_KEY,
});

const storage = new CloudinaryStorage({
    cloudinary: cloud,
    params: {
        folder: "User Avatar",  
        allowed_formats: ["png", "jpg", "jpeg"], 
    },
});
const upload = multer({ storage: storage });



async function addUser(req, res) {
    const { Username, useremail, userpassword, phoneNumber, userRole, staffRole, userImage } = req.body;
  
    if (!Username || !useremail || !userpassword || !phoneNumber || !userRole) {
      return res.status(400).send({ error: "All fields are required" });
    }
  
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(useremail)) {
      return res.status(400).send({ error: "Invalid email format" });
    }
  
    try {
      // Check for duplicate email
      const existingUser = await User.findOne({ useremail: useremail });
      if (existingUser) {
        return res.status(400).send({ error: "Email already exists" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(userpassword, 10);
  
      // Validate user role
      const role = await UserRole.findById(userRole);
      if (!role) {
        return res.status(400).send({ error: "Invalid user role" });
      }
  
      let staff = null;
      if (staffRole) {
        staff = await StaffRole.findById(staffRole);
        if (!staff) {
          return res.status(400).send({ error: "Invalid staff role" });
        }
      }
  
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
      let imageUrl = null;
      if (userImage) {
        const base64Data = userImage.split(',')[1];
        const uploadedImage = await cloud.uploader.upload(`data:image/png;base64,${base64Data}`, {
          folder: "User Avatar", 
        });
        imageUrl = uploadedImage.secure_url; 
      }
  
      let status = "active";  
      if (staffRole) {
        status = "pending"; 
      }
  
      const newUser = new User({
        username: Username,
        useremail: useremail.toLowerCase(),
        userpassword: hashedPassword,
        phoneNumber: phoneNumber,
        userImage: imageUrl,  
        userRole: role._id,
        staffRole: staff ? staff._id : null,
        verificationCode,
        verificationCodeExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        status: status,  
      });
  
      const savedUser = await newUser.save();
      await sendVerificationEmail(newUser.useremail, verificationCode);
  
      return res.status(201).json({
        message: "User created successfully. Verification email sent.",
        user: savedUser,
      });
    } catch (error) {
        console.error('Error details:', error);
        return res.status(500).send({ error: "Error adding user", details: error.message });
    }
}



  // @METHOD VERIFY
// API: http://localhost:5000/verifyEmail


async function VerifyEmail(req, res) {
    const { useremail, otp } = req.body;

    try {
        const user = await User.findOne({ useremail: useremail.toLowerCase() });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        if (user.verificationCode !== otp || user.verificationCodeExpiresAt < Date.now()) {
            return res.status(400).send({ error: "Invalid or expired OTP" });
        }

        await senWelcomeEmail(user.useremail, user.username);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. Welcome to our website.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}



// @METHOD PUT
// API: http://localhost:5000/user/:id
async function updateUser(req, res) {
    const { id } = req.params;
    const { Username, useremail, userpassword, phoneNumber, userImage, userRole, staffRole } = req.body;

    try {
        // Find the user to update
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Update user fields
        if (Username) user.username = Username;
        if (useremail) user.useremail = useremail.toLowerCase();
        if (userpassword) user.userpassword = userpassword.toLowerCase();
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (userImage) user.userImage = userImage;

        // Update the userRole
        if (userRole) {
            const role = await UserRole.findById(userRole);
            if (!role) {
                return res.status(400).send({ error: 'Invalid user role' });
            }
            user.userRole = role._id;
        }

        // Update the staffRole
        if (staffRole) {
            const staff = await StaffRole.findById(staffRole);
            if (!staff) {
                return res.status(400).send({ error: 'Invalid staff role' });
            }
            user.staffRole = staff._id;
        }

        const updatedUser = await user.save();
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error updating user' });
    }
}

// @METHOD DELETE
// API: http://localhost:5000/user/:id
async function deleteUser(req, res) {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        return res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error deleting user' });
    }
}















// @METHOD GET
// API: http://localhost:5000/staffrole
async function getStaff(req, res) {
    try {
        const allStaff = await StaffRole.find();
        return res.status(200).json(allStaff);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error fetching staff roles' });
    }
}


async function generateStaffId() {
    try {
        const latestStaff = await StaffRole.findOne().sort({ staffroleid: -1 });
        if (latestStaff) {
            return latestStaff.staffroleid + 1;
        } else {
            return 1;
        }
    } catch (error) {
        console.log('Error generating staffroleid:', error);
        throw error;
    }
}


// @METHOD POST
// API: http://localhost:5000/staffrole
async function addStaff(req, res) {
    const { staffrole, staffroledescription, status } = req.body;

    try {
        const existingStaffRole = await StaffRole.findOne({ staffrole: staffrole.toLowerCase() });

        if (existingStaffRole) {
            return res.status(400).send({ error: 'Staff role already exists' });
        }

        const staffroleid = await generateStaffId();

        const newStaff = new StaffRole({
            staffroleid: staffroleid,
            staffrole: staffrole.toLowerCase(),
            staffroledescription: staffroledescription.toLowerCase(),
            status: status.toLowerCase(),
        });

        const savedStaff = await newStaff.save();

        return res.status(201).json(savedStaff);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error adding staff' });
    }
}


// @METHOD PUT
// API: http://localhost:5000/staffrole/:id
async function updateStaff(req, res) {
    const { id } = req.params;
    const { staffrole, staffroledescription, status } = req.body;

    try {
        const staff = await StaffRole.findOne({ staffroleid: id });
        if (!staff) {
            return res.status(404).send({ error: 'Staff role not found' });
        }


        if (staffrole) staff.staffrole = staffrole.toLowerCase();
        if (staffroledescription) staff.staffroledescription = staffroledescription.toLowerCase();
        if (status) staff.status = status.toLowerCase();

        const updatedStaff = await staff.save();
        return res.status(200).json(updatedStaff);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error updating staff' });
    }
}


// @METHOD DELETE
// API: http://localhost:5000/staffrole/:id
async function deleteStaff(req, res) {
    const staffId = req.params.id;

    try {
        const deletedStaff = await StaffRole.findOneAndDelete({ staffroleid: staffId });

        if (!deletedStaff) {
            return res.status(404).send({ error: 'Staff role not found' });
        }

        return res.status(200).send({ message: 'Staff role deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error deleting staff' });
    }
}


















// @METHOD GET
// API: http://localhost:5000/userrole
async function getUserRoles(req, res) {
    try {
        const userRoles = await UserRole.find();
        return res.status(200).json(userRoles);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error fetching user roles' });
    }
}


async function generateUserRoleId() {
    try {
        const latestUserRole = await UserRole.findOne().sort({ userroleid: -1 });

        if (latestUserRole) {
            return latestUserRole.userroleid + 1;
        } else {
            return 1;
        }
    } catch (error) {
        console.log('Error generating userroleid:', error);
        throw error;
    }
}



// @METHOD POST
// API: http://localhost:5000/userrole
async function addUserRole(req, res) {
    const { userrole, userroledescription, status } = req.body;

    try {
        const existingRole = await UserRole.findOne({ userrole: userrole.toLowerCase() });

        if (existingRole) {
            return res.status(400).json({ error: 'User role already exists' });
        }

        const userroleid = await generateUserRoleId();

        const newUserRole = new UserRole({
            userroleid: userroleid,
            userrole: userrole.toLowerCase(),
            userroledescription: userroledescription.toLowerCase(),
            status: status.toLowerCase(),
        });

        const savedUserRole = await newUserRole.save();

        return res.status(201).json(savedUserRole);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error adding user role' });
    }
}



// @METHOD PUT
// API: http://localhost:5000/userrole/:id
async function updateUserRole(req, res) {
    const { id } = req.params;
    const { userrole, userroledescription, status } = req.body;

    try {
        // Find the user role by userroleid
        const userRole = await UserRole.findOne({ userroleid: id });

        if (!userRole) {
            return res.status(404).send({ error: 'User role not found' });
        }

        if (userrole) userRole.userrole = userrole.toLowerCase();
        if (userroledescription) userRole.userroledescription = userroledescription.toLowerCase();
        if (status) userRole.status = status.toLowerCase();

        const updatedUserRole = await userRole.save();
        return res.status(200).json(updatedUserRole);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error updating user role' });
    }
}



// @METHOD DELETE
// API: http://localhost:5000/userrole/:id
async function deleteUserRole(req, res) {
    const userroleId = req.params.id;

    try {
        const deletedUserRole = await UserRole.findOneAndDelete({ userroleid: userroleId });

        if (!deletedUserRole) {
            return res.status(404).send({ error: 'User role not found' });
        }

        return res.status(200).send({ message: 'User role deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error deleting user role' });
    }
}

























// --- LOGIN API ----
// METHOD ---  POST
// API    -- http://localhost:5000/user/loginuser

const LoginUser = async (req, res) => {
    try {
        const { useremail, userpassword } = req.body;

        if (!useremail || !userpassword) {
            return res.status(400).send({ error: 'Email and Password are required' });
        }

        const userAvailblity = await User.findOne({ useremail: useremail.toLowerCase() }).populate('userRole');

        if (!userAvailblity) {
            return res.status(404).send({ error: 'User not found' });
        }

        const credientialSuccess = await bcrypt.compare(userpassword, userAvailblity.userpassword);
        console.log('Credential Success:', credientialSuccess); 
        if (!credientialSuccess) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }


        if (!process.env.JWT_TOKEN) {
            return res.status(500).send({ error: 'JWT secret key is missing' });
        }

        const token = jwt.sign(
            {
                useremail: userAvailblity.useremail,
                username: userAvailblity.username,
                userrole: userAvailblity.userRole.userrole,
            },
            process.env.JWT_TOKEN,  
            { expiresIn: '1h' }
        );

        return res.status(200).send({ data: token, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).send({ error: 'Internal server error' });
    }
};
















// METHOD ---  POST
// API    -- http://localhost:5000/user/forgotPassword

async function forgotPassword(req, res) {
    const { useremail } = req.body;

    try {
        const user = await User.findOne({ useremail: useremail.toLowerCase() });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpExpiresAt = Date.now() + 10 * 60 * 1000;

        user.passwordResetOtp = otp;
        user.passwordResetOtpExpiresAt = otpExpiresAt;
        await user.save();

        await VerificationEmailforget(user.useremail, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email. Please check your inbox."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}



// METHOD ---  POST
// API    -- http://localhost:5000/user/verifyOtp

async function verifyOtp(req, res) {
    const { useremail, otp } = req.body;

    try {
        const user = await User.findOne({ useremail: useremail.toLowerCase() });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        if (user.passwordResetOtp !== otp || user.passwordResetOtpExpiresAt < Date.now()) {
            return res.status(400).send({ error: "Invalid or expired OTP" });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}




// METHOD ---  POST
// API    -- http://localhost:5000/user/resetPassword

async function resetPassword(req, res) {
    const { useremail, newPassword } = req.body;

    try {
        const user = await User.findOne({ useremail: useremail.toLowerCase() });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.userpassword = hashedPassword;
        user.passwordResetOtp = undefined;
        user.passwordResetOtpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}





module.exports = {
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

};