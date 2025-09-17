import React from "react";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "./../../context/AppContext";
import Loading from "./../../components/student/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const MyCourses = () => {
  const { currency, backendUrl, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchEducatorCourses = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await axios.get(backendUrl + "/api/educator/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const uniqueCourses = data.courses.filter(
          (course, index, self) =>
            index === self.findIndex((c) => c._id === course._id)
        );
        setCourses(uniqueCourses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Course deleted successfully");
        fetchEducatorCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculateEarnings = (course) => {
    const studentsCount = course.enrolledStudents?.length || 0;
    const priceAfterDiscount =
      course.coursePrice - (course.discount * course.coursePrice) / 100;
    return (studentsCount * priceAfterDiscount).toFixed(2);
  };

  const handleImageError = (e) => {
    e.target.src = assets.course_1_thumbnail;
  };

  useEffect(() => {
    fetchEducatorCourses();
  }, []);

  if (isLoading || !courses) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 md:p-8 p-4">
        <h2 className="pb-4 text-lg font-medium">
          My Courses ({courses.length})
        </h2>

        {courses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No courses found. Create your first course!
            </p>
            <button
              onClick={() => navigate("/educator/add-course")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-md bg-white border border-gray-500/20">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Earnings
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Students
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Published On
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={course.courseThumbnail}
                              alt={course.courseTitle}
                              className="h-10 w-10 sm:h-16 sm:w-16 rounded object-cover"
                              onError={handleImageError}
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {course.courseTitle}
                              </p>
                              <p className="text-sm text-gray-500 sm:hidden">
                                {course.enrolledStudents?.length || 0} students
                                • {currency}
                                {calculateEarnings(course)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {currency}
                          {calculateEarnings(course)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {course.enrolledStudents?.length || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(`/educator/edit-course/${course._id}`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCourse(course._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
