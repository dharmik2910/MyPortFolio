import React from "react";
import SkillsData from "../data/skills";

const Skills = () => {
  return (
    <section className="text-gray-600 body-font">
      {/* <div className="p-4 pt-0 mt-5 mx-auto md:p-5 md:mx-20 lg:mx-32 xl:mx-56"> */}
      <div className="p-4 pt-0 mt-5 mx-auto md:p-5 max-w-7xl">
        <div
          id="skills"
          className="flex flex-wrap w-full mb-4 flex-col justify-center text-center md:mb-7"
        >
          <h1 className="sm:text-4xl text-3xl font-medium mb-2 text-gray-900">
            Skills
          </h1>
          <p
            data-aos="zoom-in"
            data-aos-duration="1000"
            data-aos-once="false"
            className="text-lg font-medium leading-relaxed text-dark-orange "
          >
            My Technical Expertise
          </p>
        </div>
        <div
          data-aos="zoom-in"
          data-aos-duration="1500"
          data-aos-once="false"
          className="px-2 py-6 grid justify-center items-center grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-5 md:py-5 lg:grid-cols-5 xl:grid-cols-9 border-t-gray-200 border-2 rounded-md md:shadow-md"
        >
          {SkillsData.map((skill, index) => {
            const Icon = skill.icon;

            return (
              <div
                key={index}
                data-aos="zoom-in-up"
                data-aos-duration="1500"
                data-aos-once="false"
                className="flex flex-col w-20 h-20 items-center justify-center md:w-24 md:h-24 lg:m-3 xl:m-5 mx-auto"
              >
                {/* <Icon className="m-2 text-5xl md:text-6xl transition duration-700 hover:scale-110 text-dark-orange" /> */}
                <Icon
                  size={60}
                  style={{ color: skill.color }}
                  className="m-2 transition duration-700 hover:scale-110"
                />

                <p className="font-medium text-center">{skill.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
