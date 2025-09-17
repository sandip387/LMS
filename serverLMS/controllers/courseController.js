import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import User from './../models/User.js';
import Stripe from "stripe";

//Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).select(['-courseContent', '-enrolledStudents']).populate({ path: 'educator' })

        res.json({ success: true, courses })
    } catch (error) {
        res.json({ sucess: false, message: error.message })

    }
}

//Get Course by Id
export const getCourseId = async (req, res) => {
    const { id } = req.params;
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' })

        //Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            })
        })

        res.json({ success: true, courseData })
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

//Purchase Course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth.userId;
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        //Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

       
    } catch (error) {

    }
}