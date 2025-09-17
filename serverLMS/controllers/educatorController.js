import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

//update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({ success: true, message: "You can public a course now" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Add New Course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail Not Attached" });
    }

    const parsedCourseData = await JSON.parse(courseData);
    if (!parsedCourseData.courseTitle || !parsedCourseData.coursePrice) {
      return res.json({
        success: false,
        message: "Course title and price are required",
      });
    }

    parsedCourseData.educator = educatorId;

    const newCourse = await Course.create(parsedCourseData);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: "Course Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Edit Educator Courses
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    if (course.educator !== educatorId) {
      return res.json({
        success: false,
        message: "Unauthorized to update this course",
      });
    }

    const parsedCourseData = JSON.parse(courseData);

    if (!parsedCourseData.courseTitle || !parsedCourseData.coursePrice) {
      return res.json({
        success: false,
        message: "Course title and price are required",
      });
    }

    course.courseTitle = parsedCourseData.courseTitle;
    course.courseDescription = parsedCourseData.courseDescription;
    course.coursePrice = parsedCourseData.coursePrice;
    course.discount = parsedCourseData.discount;
    course.courseContent = parsedCourseData.courseContent;
    course.isPublished = parsedCourseData.isPublished;

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      course.courseThumbnail = imageUpload.secure_url;
    }

    await course.save();

    res.json({ success: true, message: "Course updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Single Course for editing
export const getEducatorCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educatorId = req.auth.userId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    if (course.educator !== educatorId) {
      return res.json({
        success: false,
        message: "Unauthorized to access this course",
      });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete Educator courses
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educatorId = req.auth.userId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    if (course.educator !== educatorId) {
      return res.json({
        success: false,
        message: "Unauthorized to delete this course",
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
//Get Educator Courses
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator })
      .select("+enrolledStudents")
      .lean();

    const coursesWithStats = courses.map((course) => ({
      ...course,
      enrollmentCount: course.enrolledStudents?.length || 0,
    }));

    res.json({ success: true, courses: coursesWithStats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    //Collect unique enrolled student IDs with their course titles
    const enrolledStudentsData = purchases.map((purchase) => ({
      courseTitle: purchase.courseId.courseTitle,
      student: {
        _id: purchase.userId._id,
        name: purchase.userId.name,
        imageUrl: purchase.userId.imageUrl,
      },
      purchaseDate: purchase.createdAt,
    }));

    res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
