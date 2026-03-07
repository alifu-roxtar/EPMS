// controllers/user.controller.js
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const isExist = await userModel.findOne({ email });

        if (isExist) return res.status(401).json({
            success: false,
            msg: "User Already Exists"
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({ username, email, password: hashedPassword });
        if (user) {
            const token = generateToken(user._id);
            return res.status(201).json({
                success: true,
                msg: "User Created",
                token,
                user: {
                    username: user.username,
                    email: user.email,
                    id: user._id
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                msg: "Failed To Create User"
            })
        }
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ msg: "Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExist = await userModel.findOne({ email });
        if (!userExist) return res.status(401).json({
            success: false,
            msg: "User Not Found"
        })

        const isPasswordMatch = await bcrypt.compare(password, userExist.password);

        if (!isPasswordMatch) return res.status(401).json({
            success: false,
            msg: "Incorrect Password"
        });

        const token = generateToken(userExist._id);

        return res.status(200).json({
            success: true,
            msg: "Logged in successfully",
            token,
            user: {
                id: userExist._id,
                username: userExist.username,
                email: userExist.email
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Server Error" });
    }
}

export const editUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const updateUser = await userModel.findByIdAndUpdate({ _id: userId }, req.body, { new: true });
        if (updateUser) {
            const token = generateToken(userId);
            return res.status(200).json({ msg: "User Updated successfully", token, updateUser });
        }
        else return res.status(401).json({ msg: "Failed To Update User" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Server Error" });
    }
}

export const dashboard = async (req, res) => {
    try {
        // req.user should be set by the protect middleware
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Server Error" });
    }
}