import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import ProjectEditor from "../../components/CreateProject";
import { MdDelete, MdAdd } from "react-icons/md";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [addProject, setAddProject] = useState(false);

  useEffect(() => {
    // Fetch all projects when page loads
    const fetchProjects = async () => {
      const res = await axios.get("/api/v1/projects");
      setProjects(res.data.data);
    };
    fetchProjects();
  }, []);

  return (
    <div className="portfolio-container">
      <h1 className="text-4xl text-center my-8">Our Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {projects.map((project) => (
          <div
            key={project._id}
            className="project-card border rounded shadow-lg overflow-hidden"
          >
            {/* Show Cloudinary Cover Image */}
            <img
              src={project.coverImage || "/placeholder.jpg"}
              alt={project.title}
              className="w-full h-64 object-cover"
            />

            <div className="p-4">
              <span className="text-sm text-blue-500 font-bold">
                {project.projectType}
              </span>
              <h2 className="text-xl font-bold mt-2">{project.title}</h2>
              <p className="text-gray-600 truncate">{project.description}</p>

              {/* Show dynamic tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {project.plotSize && (
                  <span className="bg-gray-200 px-2 py-1 text-xs rounded">
                    Plot: {project.plotSize}
                  </span>
                )}
                {project.theme && (
                  <span className="bg-gray-200 px-2 py-1 text-xs rounded">
                    Theme: {project.theme}
                  </span>
                )}
              </div>

              {/* Link to detail page */}
              <a
                href={`/project/${project._id}`}
                className="block mt-4 text-center bg-black text-white py-2 rounded"
              >
                View Project Details
              </a>
            </div>
          </div>
        ))}
      </div>
      {/* Floating Add button */}
      <button
        onClick={() => setAddProject(true)}
        className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
      >
        <MdAdd className="text-2xl" />
      </button>
      <Modal
        isOpen={addProject}
        onClose={() => setAddProject(false)}
        head="Post a New Project"
      >
        <ProjectEditor onClose={() => setAddProject(false)} />
      </Modal>
    </div>
  );
};

export default Projects;
