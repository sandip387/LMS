import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import Loading from "../../components/student/Loading";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { currency, backendUrl, getToken } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await axios.get(backendUrl + "/api/educator/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = assets.profile_img;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading || !dashboardData) return <Loading />;

  const uniqueStudentsCount = dashboardData.enrolledStudentsData
    ? new Set(
        dashboardData.enrolledStudentsData.map((item) => item.student._id)
      ).size
    : 0;

  return (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="space-y-5 w-full">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-5 items-center">
          <div className="flex items-center gap-3 shadow-lg border border-blue-500 p-4 w-full sm:w-56 rounded-md bg-white hover:shadow-xl transition-shadow">
            <img
              src={assets.patients_icon}
              alt="students_icon"
              className="w-12 h-12"
            />
            <div>
              <p className="text-2xl font-medium text-gray-800">
                {uniqueStudentsCount}
              </p>
              <p className="text-sm text-gray-500">Unique Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shadow-lg border border-blue-500 p-4 w-full sm:w-56 rounded-md bg-white hover:shadow-xl transition-shadow">
            <img
              src={assets.appointments_icon}
              alt="courses_icon"
              className="w-12 h-12"
            />
            <div>
              <p className="text-2xl font-medium text-gray-800">
                {dashboardData.totalCourses || 0}
              </p>
              <p className="text-sm text-gray-500">Total Courses</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shadow-lg border border-blue-500 p-4 w-full sm:w-56 rounded-md bg-white hover:shadow-xl transition-shadow">
            <img
              src={assets.earning_icon}
              alt="earning_icon"
              className="w-12 h-12"
            />
            <div>
              <p className="text-2xl font-medium text-gray-800">
                {currency}
                {dashboardData.totalEarnings?.toFixed(2) || "0.00"}
              </p>
              <p className="text-sm text-gray-500">Total Earnings</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shadow-lg border border-green-500 p-4 w-full sm:w-56 rounded-md bg-white hover:shadow-xl transition-shadow">
            <img
              src={assets.appointments_icon}
              alt="enrollments_icon"
              className="w-12 h-12"
            />
            <div>
              <p className="text-2xl font-medium text-gray-800">
                {dashboardData.enrolledStudentsData?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Total Enrollments</p>
            </div>
          </div>
        </div>

        {/* Latest Enrollments Table */}
        <div className="w-full">
          <h2 className="pb-4 text-lg font-medium text-gray-800">
            Latest Enrollments
            {dashboardData.enrolledStudentsData?.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({/* Showing last{" "} */}
                {Math.min(10, dashboardData.enrolledStudentsData.length)})
              </span>
            )}
          </h2>

          {dashboardData.enrolledStudentsData?.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-md border border-gray-200">
              <p className="text-gray-500">
                No enrollments yet. Share your courses to get students!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-md bg-white border border-gray-200 shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.enrolledStudentsData
                        // .slice(-10) // Show only last 10 enrollments
                        // .reverse() // Show newest first
                        .map((item, index) => (
                          <tr
                            key={`${item.student._id}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-center hidden sm:table-cell text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <img
                                  src={item.student.imageUrl}
                                  alt={item.student.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={handleImageError}
                                />
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {item.student.name}
                                  </p>
                                  <p className="text-xs text-gray-500 md:hidden">
                                    {item.courseTitle}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <p className="text-sm text-gray-900 truncate max-w-xs">
                                {item.courseTitle}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {item.purchaseDate
                                ? new Date(
                                    item.purchaseDate
                                  ).toLocaleDateString()
                                : "N/A"}
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

        {/* Quick Stats Summary */}
        {dashboardData.enrolledStudentsData?.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Course Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">
                  Average Students per Course:{" "}
                </span>
                <span className="font-medium text-gray-800">
                  {dashboardData.totalCourses > 0
                    ? (
                        dashboardData.enrolledStudentsData.length /
                        dashboardData.totalCourses
                      ).toFixed(1)
                    : "0"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">
                  Average Earning per Student:{" "}
                </span>
                <span className="font-medium text-gray-800">
                  {currency}
                  {dashboardData.enrolledStudentsData.length > 0
                    ? (
                        dashboardData.totalEarnings /
                        dashboardData.enrolledStudentsData.length
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Average Course Price: </span>
                <span className="font-medium text-gray-800">
                  {currency}
                  {dashboardData.totalCourses > 0 &&
                  dashboardData.enrolledStudentsData.length > 0
                    ? (
                        dashboardData.totalEarnings /
                        dashboardData.enrolledStudentsData.length
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
