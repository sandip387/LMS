import express from "express";
import {
  addCourse,
  deleteCourse,
  educatorDashboardData,
  getEducatorCourseById,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateCourse,
  updateRoleToEducator,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

//Add Educator Role
educatorRouter.get("/update-role", updateRoleToEducator);
educatorRouter.post(
  "/add-course",
  upload.single("image"),
  protectEducator,
  addCourse
);
educatorRouter.get("/courses", protectEducator, getEducatorCourses);
educatorRouter.delete("/course/:courseId", protectEducator, deleteCourse);
educatorRouter.get("/course/:courseId", protectEducator, getEducatorCourseById);
educatorRouter.put(
  "/course/:courseId",
  upload.single("image"),
  protectEducator,
  updateCourse
);
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
