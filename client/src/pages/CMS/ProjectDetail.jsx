import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project details from your Node backend
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching project", err);
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Helper to convert standard YouTube URL to Embed URL for preview
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading project details...</div>;
  if (!project) return <div className="p-10 text-center text-xl text-red-500">Project not found.</div>;

  const isInterior = project.projectType === 'Interior';

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {project.projectType}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Published on: {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate(`/edit/${project._id}`)} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            Edit Project
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Media & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="bg-white p-4 shadow rounded-lg border">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Cover Image</h2>
            <img 
              src={project.coverImage || 'https://via.placeholder.com/800x400?text=No+Image'} 
              alt="Cover" 
              className="w-full h-80 object-cover rounded"
            />
          </div>

          {/* Description */}
          <div className="bg-white p-4 shadow rounded-lg border">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Project Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* YouTube Preview */}
          {project.youtubeUrl && (
            <div className="bg-white p-4 shadow rounded-lg border">
              <h2 className="text-lg font-bold mb-3 border-b pb-2">YouTube Video Preview</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  className="w-full h-96 rounded" 
                  src={getYouTubeEmbedUrl(project.youtubeUrl)} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Specs & Details */}
        <div className="space-y-6">
          
          {/* Common Details Card */}
          <div className="bg-white p-4 shadow rounded-lg border">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Overview</h2>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-500">Purpose:</span>
                <span className="font-medium text-gray-800">{project.purpose || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Budget:</span>
                <span className="font-medium text-gray-800">{project.budget || 'N/A'}</span>
              </li>
            </ul>
          </div>

          {/* Conditional Specs Card */}
          <div className="bg-white p-4 shadow rounded-lg border">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">
              {isInterior ? 'Interior Specifications' : 'Architectural Specifications'}
            </h2>
            <ul className="space-y-3">
              {!isInterior ? (
                <>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Plot Size:</span>
                    <span className="font-medium text-gray-800">{project.plotSize || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Direction:</span>
                    <span className="font-medium text-gray-800">{project.direction || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">No. of Floors:</span>
                    <span className="font-medium text-gray-800">{project.numberOfFloors || 'N/A'}</span>
                  </li>
                  <li className="flex flex-col mt-2">
                    <span className="text-gray-500 mb-1">Design/Construction Rate:</span>
                    <span className="p-2 bg-gray-50 border rounded text-sm text-gray-700">
                      {project.designRateList || 'No rates specified'}
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Area (sq ft):</span>
                    <span className="font-medium text-gray-800">{project.area || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Theme:</span>
                    <span className="font-medium text-gray-800">{project.theme || 'N/A'}</span>
                  </li>
                  <li className="flex flex-col mt-2">
                    <span className="text-gray-500 mb-1">Interior Rate List:</span>
                    <span className="p-2 bg-gray-50 border rounded text-sm text-gray-700">
                      {project.interiorRateList || 'No rates specified'}
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Documents & CAD Card */}
          <div className="bg-white p-4 shadow rounded-lg border">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Attached Documents</h2>
            {project.documentUrl ? (
              <a 
                href={project.documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                View PDF / CAD File
              </a>
            ) : (
              <p className="text-gray-500 text-sm">No documents attached.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;