"use client";

import Navbar from "@/app/components/Navbar";
import FeaturedCourses from "@/app/components/FeaturedCourses";
import CourseList from "@/app/components/CourseList";
import Footer from "@/app/components/Footer";

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
