import React from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import ProjectsData from "../data/projects";

const Projects = () => {
  return (
    <section className="text-gray-600 body-font">
      <div className="px-3 py-5 mx-auto text-center sm:mx-6 md:mx-12 md:pt-5 md:mt-5 xl:mx-40">
        <div
          id="projects"
          className="flex flex-wrap w-full flex-col items-center text-center mb-8 md:mb-12"
        >
          <h1 className="sm:text-4xl text-3xl font-medium title-font mb-3 text-gray-900">
            Projects
          </h1>
          <p
            data-aos="zoom-in"
            data-aos-duration="1000"
            data-aos-once="false"
            className="text-lg font-medium leading-relaxed text-dark-orange"
          >
            My Works
          </p>
        </div>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 md:gap-10 lg:gap-8 xl:gap-10 mt-8 md:mt-12">
          {ProjectsData.map((project) => (
            <div
              data-aos="zoom-in-up"
              data-aos-duration="1000"
              data-aos-once="false"
              key={project.id}
              className="group relative flex flex-col w-full mx-auto shadow-lg md:shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white"
            >
              <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  style={{ imageRendering: "high-quality" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Always visible project info */}
              <div className="bg-white p-5 md:p-6 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center">
                  {project.name}
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed mb-4 min-h-[3rem]">
                  {project.description}
                </p>
                
                {/* Tech Stack Icons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4 py-2">
                  {project?.icons?.map((Icon, index) => (
                    <div 
                      className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors" 
                      key={index}
                      title={Icon.name || "Technology"}
                    >
                      <Icon className="text-gray-700 text-2xl md:text-3xl" />
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 justify-center items-center mt-2 pt-2 border-t border-gray-200">
                  <a
                    className="flex items-center gap-2 text-sm md:text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-all hover:shadow-md"
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.name} on GitHub`}
                  >
                    <FaGithub className="text-lg" />
                    <span>Code</span>
                  </a>
                  <a
                    className="flex items-center gap-2 text-sm md:text-base font-medium text-white bg-darkblue hover:bg-blue-700 rounded-lg px-4 py-2 transition-all hover:shadow-md"
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.name} demo`}
                  >
                    <FaExternalLinkAlt className="text-base" />
                    <span>Live Demo</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
