"use client";

import Navbar from "@/next-app/components/Navbar";
import FeaturedCourses from "@/next-app/components/FeaturedCourses";
import CourseList from "@/next-app/components/CourseList";
import Footer from "@/next-app/components/Footer";

const Courses = () => {
  return (
    <>
      <Navbar />
      <FeaturedCourses />
      <CourseList />
      <Footer />
    </>
  );
};

export default Courses;
