import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);

  //fetch all courses
  const fetchAllCourse = async () => {
    setAllCourses(dummyCourses);
  };

  //function to calculate avg rating of course
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
  };

  useEffect(() => {
    fetchAllCourse();
  }, []);

  const value = {
    currency,
    allCourses,
    navigate,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
