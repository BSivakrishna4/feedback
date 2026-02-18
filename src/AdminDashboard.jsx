import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [allFeedback, setAllFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("feedback");
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [newFaculty, setNewFaculty] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState(null);
  const [selectedFacultiesForAssign, setSelectedFacultiesForAssign] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) {
      navigate("/");
      return;
    }
    
    // Simple admin check - you can enhance this
    if (user.email !== "admin@college.edu") {
      navigate("/home");
      return;
    }
    
    loadFeedback();
    loadCourses();
    loadFaculties();
  }, [navigate]);

  const loadCourses = async () => {
    try {
      const response = await api.getCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadFaculties = async () => {
    try {
      const response = await api.getFaculties();
      if (response.success) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error("Error loading faculties:", error);
    }
  };

  const loadFeedback = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await api.getFeedback();
      if (response.success) {
        setAllFeedback(response.data);
        setFilteredFeedback(response.data);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
      setError(error.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await api.deleteFeedback(feedbackId);
      
      if (response.success) {
        // Update local state
        setAllFeedback(prev => prev.filter(fb => fb.id !== feedbackId));
        setFilteredFeedback(prev => prev.filter(fb => fb.id !== feedbackId));
      }
    } catch (error) {
      setError(error.message || "Failed to delete feedback");
    }
  };

  useEffect(() => {
    let filtered = allFeedback;
    
    if (filterCourse) {
      filtered = filtered.filter(fb => fb.course === filterCourse);
    }
    
    if (filterRating) {
      filtered = filtered.filter(fb => fb.rating === parseInt(filterRating));
    }
    
    setFilteredFeedback(filtered);
  }, [filterCourse, filterRating, allFeedback]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleAddCourse = async () => {
    if (!newCourse.trim()) {
      setError("Course name cannot be empty");
      return;
    }
    
    try {
      const response = await api.addCourse(newCourse.trim());
      if (response.success) {
        setCourses([...courses, response.data]);
        setNewCourse("");
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!window.confirm(`Are you sure you want to delete "${course.name}"?`)) {
      return;
    }
    
    try {
      const response = await api.deleteCourse(courseId);
      if (response.success) {
        setCourses(courses.filter(c => c.id !== courseId));
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to delete course");
    }
  };

  const handleUpdateCourse = async (courseId, newName) => {
    if (!newName.trim()) {
      setError("Course name cannot be empty");
      return;
    }
    
    try {
      await api.deleteCourse(courseId);
      const response = await api.addCourse(newName.trim());
      if (response.success) {
        setCourses(prev => [...prev.filter(c => c.id !== courseId), response.data]);
        setEditingCourse(null);
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to update course");
    }
  };

  const handleAddFaculty = async () => {
    if (!newFaculty.trim()) {
      setError("Faculty name cannot be empty");
      return;
    }
    
    try {
      const response = await api.addFaculty(newFaculty.trim());
      if (response.success) {
        setFaculties([...faculties, response.data]);
        setNewFaculty("");
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to add faculty");
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    if (!window.confirm(`Are you sure you want to delete "${faculty.name}"?`)) {
      return;
    }
    
    try {
      const response = await api.deleteFaculty(facultyId);
      if (response.success) {
        setFaculties(faculties.filter(f => f.id !== facultyId));
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to delete faculty");
    }
  };

  const handleUpdateFaculty = async (facultyId, newName) => {
    if (!newName.trim()) {
      setError("Faculty name cannot be empty");
      return;
    }
    
    try {
      await api.deleteFaculty(facultyId);
      const response = await api.addFaculty(newName.trim());
      if (response.success) {
        setFaculties(prev => [...prev.filter(f => f.id !== facultyId), response.data]);
        setEditingFaculty(null);
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to update faculty");
    }
  };

  const handleAssignCourseToFaculties = async () => {
    if (!selectedCourseForAssign) {
      setError("Please select a course to assign");
      return;
    }
    if (!selectedFacultiesForAssign || selectedFacultiesForAssign.length === 0) {
      setError("Please select at least one faculty to assign the course to");
      return;
    }

    setError("");
    try {
      // Assign the selected course to each selected faculty
      for (const facId of selectedFacultiesForAssign) {
        // skip if already assigned locally
        const faculty = faculties.find(f => f.id === facId);
        if (faculty && faculty.assignedCourses && faculty.assignedCourses.includes(selectedCourseForAssign)) {
          continue;
        }
        const response = await api.assignCourseToFaculty(facId, selectedCourseForAssign);
        if (response.success) {
          // update local faculties state for immediate UI feedback
          setFaculties(prev => prev.map(f => f.id === facId ? response.data : f));
        }
      }
      // clear selection after assign
      setSelectedCourseForAssign(null);
      setSelectedFacultiesForAssign([]);
    } catch (error) {
      setError(error.message || "Failed to assign course(s)");
    }
  };

  const handleUnassignCourse = async (facultyId, courseId) => {
    try {
      const response = await api.unassignCourseFromFaculty(facultyId, courseId);
      if (response.success) {
        setFaculties(prev => prev.map(f => f.id === facultyId ? response.data : f));
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to remove course from faculty");
    }
  };

  const getAverageRating = (course = null) => {
    const relevantFeedback = course 
      ? allFeedback.filter(fb => fb.course === course)
      : allFeedback;
    
    if (relevantFeedback.length === 0) return 0;
    
    const sum = relevantFeedback.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / relevantFeedback.length).toFixed(1);
  };

  const getCourseStats = () => {
    const stats = {};
    courses.forEach(course => {
      const courseFeedback = allFeedback.filter(fb => fb.course === course.name);
      stats[course.name] = {
        count: courseFeedback.length,
        avgRating: getAverageRating(course.name)
      };
    });
    return stats;
  };

  const courseStats = getCourseStats();

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>Welcome, Admin!</span>
          <button onClick={handleBackToHome} className="home-btn">Back to Home</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button
          className={activeTab === "feedback" ? "tab active" : "tab"}
          onClick={() => setActiveTab("feedback")}
        >
          All Feedbacks
        </button>
        <button
          className={activeTab === "courses" ? "tab active" : "tab"}
          onClick={() => setActiveTab("courses")}
        >
          Manage Courses
        </button>
        <button
          className={activeTab === "faculties" ? "tab active" : "tab"}
          onClick={() => setActiveTab("faculties")}
        >
          Manage Faculties
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === "feedback" && (
        <>
          {/* Statistics */}
          <div className="stats-section">
            <div className="stat-card">
              <h3>Total Feedback</h3>
              <p className="stat-number">{allFeedback.length}</p>
            </div>
            <div className="stat-card">
              <h3>Average Rating</h3>
              <p className="stat-number">{getAverageRating()}/5</p>
            </div>
            <div className="stat-card">
              <h3>Courses</h3>
              <p className="stat-number">{courses.length}</p>
            </div>
          </div>

          {/* Course Statistics */}
          <div className="course-stats">
            <h2>Course Statistics</h2>
            <div className="course-grid">
              {courses.map(course => (
                <div key={course.id} className="course-stat-card">
                  <h4>{course.name}</h4>
                  <p>Feedback: {courseStats[course.name]?.count || 0}</p>
                  <p>Avg Rating: {courseStats[course.name]?.avgRating || 0}/5</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="filters">
            <h2>Filter Feedback</h2>
            <div className="filter-controls">
              <select 
                value={filterCourse} 
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
              
              <select 
                value={filterRating} 
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Feedback List */}
          <div className="feedback-section">
            <h2>All Feedback ({filteredFeedback.length})</h2>
            {loading ? (
              <p className="loading-text">Loading feedback...</p>
            ) : filteredFeedback.length === 0 ? (
              <p>No feedback found.</p>
            ) : (
              <div className="admin-feedback-list">
                {filteredFeedback.map((fb) => (
                  <div key={fb.id} className="admin-feedback-card">
                    <div className="feedback-header">
                      <h3>{fb.course}</h3>
                      <div className="header-right">
                        <span className="rating">{"⭐".repeat(fb.rating)}</span>
                        <button 
                          onClick={() => handleDeleteFeedback(fb.id)} 
                          className="admin-delete-btn"
                          title="Delete feedback"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <p><strong>Student:</strong> {fb.studentName}</p>
                    <p><strong>Faculty:</strong> {fb.facultyName}</p>
                    <p><strong>Date:</strong> {fb.date}</p>
                    {fb.updatedAt && <p><strong>Updated:</strong> {fb.updatedAt}</p>}
                    {fb.comments && (
                      <div className="comments">
                        <strong>Comments:</strong>
                        <p>{fb.comments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "courses" && (
        <div className="manage-section">
          <h2>Manage Courses</h2>
          
          <div className="add-form">
            <h3>Add New Course</h3>
            <div className="input-group">
              <input
                type="text"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="Enter course name"
                maxLength="100"
              />
              <button onClick={handleAddCourse} className="add-btn">Add Course</button>
            </div>
          </div>

          <div className="items-list">
            <h3>Existing Courses ({courses.length})</h3>
            {courses.length === 0 ? (
              <p>No courses available.</p>
            ) : (
              <div className="items-grid">
                {courses.map((course) => (
                  <div key={course.id} className="item-card">
                    {editingCourse === course.id ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          defaultValue={course.name}
                          onBlur={(e) => {
                            if (e.target.value !== course.name) {
                              handleUpdateCourse(course.id, e.target.value);
                            } else {
                              setEditingCourse(null);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateCourse(course.id, e.target.value);
                            }
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <span className="item-name">{course.name}</span>
                        <div className="item-actions">
                          <button onClick={() => setEditingCourse(course.id)} className="edit-btn">✏️</button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="delete-btn">🗑️</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "faculties" && (
        <div className="manage-section">
          <h2>Manage Faculties</h2>
          
          <div className="add-form">
            <h3>Add New Faculty</h3>
            <div className="input-group">
              <input
                type="text"
                value={newFaculty}
                onChange={(e) => setNewFaculty(e.target.value)}
                placeholder="Enter faculty name"
                maxLength="100"
              />
              <button onClick={handleAddFaculty} className="add-btn">Add Faculty</button>
            </div>
          </div>

          <div className="add-form">
            <h3>Assign Course To Faculties</h3>
            <div className="input-group">
              <select 
                value={selectedCourseForAssign || ""}
                onChange={(e) => setSelectedCourseForAssign(Number(e.target.value) || null)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            {selectedCourseForAssign && (
              <div className="input-group" style={{ marginTop: '10px' }}>
                <select
                  multiple
                  value={selectedFacultiesForAssign}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setSelectedFacultiesForAssign(selected);
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
                >
                  {faculties
                    .filter(f => !f.assignedCourses || !f.assignedCourses.includes(selectedCourseForAssign))
                    .map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                </select>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Hold Ctrl/Cmd to select multiple faculties</small>
              </div>
            )}
            {selectedFacultiesForAssign.length > 0 && (
              <button
                onClick={handleAssignCourseToFaculties}
                className="add-btn"
                style={{ marginTop: '10px' }}
              >
                Assign Course To Selected Faculties
              </button>
            )}
          </div>

          <div className="items-list">
            <h3>Existing Faculties ({faculties.length})</h3>
            {faculties.length === 0 ? (
              <p>No faculties available.</p>
            ) : (
              <div className="items-grid">
                {faculties.map((faculty) => (
                  <div key={faculty.id} className="item-card">
                    {editingFaculty === faculty.id ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          defaultValue={faculty.name}
                          onBlur={(e) => {
                            if (e.target.value !== faculty.name) {
                              handleUpdateFaculty(faculty.id, e.target.value);
                            } else {
                              setEditingFaculty(null);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateFaculty(faculty.id, e.target.value);
                            }
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <span className="item-name">{faculty.name}</span>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                          Courses: {faculty.assignedCourses && faculty.assignedCourses.length > 0 
                            ? courses.filter(c => faculty.assignedCourses.includes(c.id)).map(c => c.name).join(', ')
                            : 'None assigned'}
                        </div>
                        {faculty.assignedCourses && faculty.assignedCourses.length > 0 && (
                          <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            {courses.filter(c => faculty.assignedCourses.includes(c.id)).map(course => (
                              <button
                                key={course.id}
                                onClick={() => handleUnassignCourse(faculty.id, course.id)}
                                style={{
                                  background: '#ff6b6b',
                                  color: 'white',
                                  border: 'none',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  marginRight: '4px',
                                  marginBottom: '4px',
                                  fontSize: '0.75rem'
                                }}
                                title="Click to remove course"
                              >
                                {course.name} ✕
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="item-actions">
                          <button onClick={() => setEditingFaculty(faculty.id)} className="edit-btn">✏️</button>
                          <button onClick={() => handleDeleteFaculty(faculty.id)} className="delete-btn">🗑️</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;