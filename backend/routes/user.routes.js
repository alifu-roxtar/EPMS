// routes/user.routes.js
import express from "express";
import { register, login, editUser, dashboard } from "../controllers/user.controller.js";
import { protect } from "../middleware/authMiddleware.js"; // Use protect, not authMiddleWare

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.put('/edit/:id', editUser);
userRouter.get('/getme', protect, dashboard); // Use protect middleware here

export default userRouter;