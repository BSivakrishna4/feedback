import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api";
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [facultyId, setFacultyId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("feedback");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultyCourses, setFacultyCourses] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) {
      navigate("/");
    } else {
      setCurrentUser(user);
      initializeSampleFeedback();
      loadCourses();
      loadFaculties();
    }
  }, [navigate]);

  const loadCourses = async () => {
    try {
      const response = await api.getCourses();
      console.log("All courses loaded:", response);
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
      console.log("Faculties loaded:", response);
      if (response.success) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error("Error loading faculties:", error);
    }
  };

  const loadFacultyCourses = async (fId) => {
    try {
      console.log("Loading courses for faculty ID:", fId);
      const response = await api.getCoursesByFaculty(fId);
      console.log("Faculty courses response:", response);
      if (response.success) {
        console.log("Courses loaded:", response.data);
        setFacultyCourses(response.data);
        setSelectedCourse(""); // Reset course selection
      } else {
        console.error("Failed to load courses:", response.message);
        setFacultyCourses([]);
      }
    } catch (error) {
      console.error("Error loading faculty courses:", error);
      setError("Error loading courses for this faculty");
      setFacultyCourses([]);
    }
  };

  const handleFacultyChange = (e) => {
    const fId = parseInt(e.target.value);
    setFacultyId(fId);
    
    // Find faculty from the current faculties state
    const selectedFacultyObj = faculties.find(f => f.id === fId);
    if (selectedFacultyObj) {
      setSelectedFaculty(selectedFacultyObj.name);
      if (fId) {
        loadFacultyCourses(fId);
      }
    } else {
      setSelectedFaculty("");
      setFacultyCourses([]);
    }
  };

  const initializeSampleFeedback = async () => {
    try {
      await api.initializeSampleData();
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Detailed validation with specific error messages
    if (!selectedFaculty) {
      setError("Please select a faculty!");
      return;
    }

    if (!selectedCourse) {
      setError("Please select a course!");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError("Please provide a rating between 1 and 5!");
      return;
    }

    setLoading(true);

    try {
      // Ensure the course is assigned to the faculty
      await api.assignCourseToFaculty(facultyId, courses.find(c => c.name === selectedCourse)?.id);
      
      // Ensure the course exists in the courses list
      await api.ensureCourseExists(selectedCourse);

      const feedbackData = {
        studentName: `${currentUser.firstName} ${currentUser.lastName}`,
        studentEmail: currentUser.email,
        facultyName: selectedFaculty,
        course: selectedCourse,
        rating: parseInt(rating),
        comments: comments.trim()
      };

      const response = await api.submitFeedback(feedbackData);

      if (response.success) {
        console.log("Feedback submitted successfully:", response.data);
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error.message || "Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const resetForm = () => {
    setSelectedFaculty("");
    setFacultyId(null);
    setSelectedCourse("");
    setFacultyCourses([]);
    setRating(0);
    setComments("");
    setSubmitted(false);
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value ? parseInt(e.target.value) : 0);
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="homepage-container">
      {/* Header */}
      <div className="header">
        <h1>College Feedback System</h1>
        <div className="user-info">
          <span>Welcome, {currentUser.firstName}!</span>
          {currentUser.email === "admin@college.edu" && (
            <button onClick={() => navigate("/admin")} className="admin-btn">Admin Dashboard</button>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={activeTab === "feedback" ? "tab active" : "tab"}
          onClick={() => setActiveTab("feedback")}
        >
          Submit Feedback
        </button>
        <button
          className={activeTab === "history" ? "tab active" : "tab"}
          onClick={() => setActiveTab("history")}
        >
          All Feedbacks
        </button>
      </div>

      {/* Content */}
      <div className="main-content">
        {activeTab === "feedback" && (
          <div className="feedback-layout">
            <div className="left-panel">
              <div className="feedback-form-container">
                {!submitted ? (
                  <form className="feedback-form" onSubmit={handleSubmit}>
                    <h2 className="feedback-title">Submit Feedback</h2>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                      <label htmlFor="facultySelect">Select Faculty</label>
                      <select
                        id="facultySelect"
                        value={facultyId || ""}
                        onChange={handleFacultyChange}
                        disabled={loading}
                        required
                      >
                        <option value="">--Choose a faculty--</option>
                        {faculties && faculties.length > 0 ? (
                          faculties.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No faculties available</option>
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="courseSelect">Select Course</label>
                      <select
                        id="courseSelect"
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        disabled={loading || !facultyId || facultyCourses.length === 0}
                        required
                      >
                        <option value="">
                          {!facultyId ? "--Select a faculty first--" : facultyCourses.length === 0 ? "--No courses available--" : "--Choose a course--"}
                        </option>
                        {facultyCourses && facultyCourses.length > 0 ? (
                          facultyCourses.map((course) => (
                            <option key={course.id} value={course.name}>
                              {course.name}
                            </option>
                          ))
                        ) : null}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="rating">Rate the Course (1 to 5)</label>
                      <select
                        id="rating"
                        value={rating || ""}
                        onChange={handleRatingChange}
                        disabled={loading}
                        required
                      >
                        <option value="">--Select Rating--</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="comments">Comments (Optional)</label>
                      <textarea
                        id="comments"
                        value={comments}
                        onChange={handleCommentsChange}
                        placeholder="Enter your comments about the course and faculty..."
                        maxLength="500"
                        rows="5"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <small className="char-count">{comments.length}/500 characters</small>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </form>
                ) : (
                  <div className="feedback-success">
                    <h2 className="feedback-title" style={{ color: "green" }}>Thank You!</h2>
                    <div className="success-details">
                      <p><strong>Faculty:</strong> {selectedFaculty}</p>
                      <p><strong>Course:</strong> {selectedCourse}</p>
                      <p><strong>Rating:</strong> {"⭐".repeat(rating)} ({rating}/5)</p>
                      {comments && <p><strong>Comments:</strong> {comments}</p>}
                    </div>
                    <button onClick={resetForm} className="submit-button">
                      Submit Another Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="right-panel">
              <FeedbackSummary currentUser={currentUser} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
        {activeTab === "history" && <MyFeedback currentUser={currentUser} onUpdate={() => setRefreshTrigger(prev => prev + 1)} />}
      </div>
    </div>
  );
}

// Separate components to prevent re-rendering issues
function FeedbackSummary({ currentUser, refreshTrigger }) {
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, [currentUser, refreshTrigger]);

  const loadFeedback = async () => {
    try {
      const response = await api.getFeedback(currentUser?.email);
      if (response.success) {
        setMyFeedback(response.data);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRating = myFeedback.reduce((sum, fb) => sum + (parseInt(fb.rating) || 0), 0);
  const averageRating = myFeedback.length > 0 ? (totalRating / myFeedback.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="feedback-summary-panel">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="feedback-summary-panel">
      <h3>My Feedback Summary</h3>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-number">{myFeedback.length}</span>
          <span className="stat-label">Total Feedback</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{averageRating}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
      </div>

      <div className="recent-feedback">
        <h4>Recent Feedback</h4>
        {myFeedback.length === 0 ? (
          <p className="no-feedback">No feedback submitted yet.</p>
        ) : (
          <div className="feedback-list-summary">
            {myFeedback.slice(-3).reverse().map((fb) => (
              <div key={fb.id} className="feedback-item-summary">
                <div className="feedback-header-summary">
                  <span className="course-name">{fb.course}</span>
                  <span className="rating-display">{"⭐".repeat(fb.rating)}</span>
                </div>
                <p className="faculty-name">{fb.facultyName}</p>
                {fb.comments && (
                  <p className="comment-preview">
                    "{fb.comments.length > 50 ? fb.comments.substring(0, 50) + "..." : fb.comments}"
                  </p>
                )}
                <span className="feedback-date">{fb.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyFeedback({ currentUser, onUpdate }) {
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadFeedback();
    loadCourses();
  }, [currentUser]);

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

  const loadFeedback = async () => {
    try {
      const response = await api.getFeedback(currentUser?.email);
      if (response.success) {
        setMyFeedback(response.data);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingId(feedback.id);
    setEditForm({
      facultyName: feedback.facultyName,
      course: feedback.course,
      rating: feedback.rating,
      comments: feedback.comments || ""
    });
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setError("");
  };

  const handleUpdateSubmit = async (feedbackId) => {
    if (!editForm.facultyName?.trim()) {
      setError("Faculty name is required");
      return;
    }
    if (!editForm.course) {
      setError("Course is required");
      return;
    }
    if (!editForm.rating || editForm.rating < 1 || editForm.rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }

    setUpdateLoading(true);
    setError("");

    try {
      const response = await api.updateFeedback(feedbackId, {
        facultyName: editForm.facultyName.trim(),
        course: editForm.course,
        rating: parseInt(editForm.rating),
        comments: editForm.comments.trim()
      });

      if (response.success) {
        // Update local state
        setMyFeedback(prev => prev.map(fb => 
          fb.id === feedbackId ? response.data : fb
        ));
        setEditingId(null);
        setEditForm({});
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      setError(error.message || "Failed to update feedback");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    setDeleteLoading(feedbackId);
    setError("");

    try {
      const response = await api.deleteFeedback(feedbackId);
      
      if (response.success) {
        // Update local state
        setMyFeedback(prev => prev.filter(fb => fb.id !== feedbackId));
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      setError(error.message || "Failed to delete feedback");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="feedback-history-container">
        <h2 className="feedback-title">My Feedback History</h2>
        <p className="loading-text">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="feedback-history-container">
      <h2 className="feedback-title">My Feedback History</h2>
      {error && <div className="error-message">{error}</div>}
      {myFeedback.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <div className="feedback-list">
          {myFeedback.map((fb) => (
            <div key={fb.id} className="feedback-card">
              {editingId === fb.id ? (
                // Edit Mode
                <div className="edit-form">
                  <h3>Edit Feedback</h3>
                  <div className="form-group">
                    <label>Faculty Name</label>
                    <input
                      type="text"
                      value={editForm.facultyName}
                      onChange={(e) => setEditForm({...editForm, facultyName: e.target.value})}
                      maxLength="100"
                      disabled={updateLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Course</label>
                    <select
                      value={editForm.course}
                      onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                      disabled={updateLoading}
                    >
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <select
                      value={editForm.rating}
                      onChange={(e) => setEditForm({...editForm, rating: parseInt(e.target.value)})}
                      disabled={updateLoading}
                    >
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Comments</label>
                    <textarea
                      value={editForm.comments}
                      onChange={(e) => setEditForm({...editForm, comments: e.target.value})}
                      maxLength="500"
                      rows="4"
                      disabled={updateLoading}
                    />
                  </div>
                  <div className="edit-actions">
                    <button 
                      onClick={() => handleUpdateSubmit(fb.id)} 
                      className="save-btn"
                      disabled={updateLoading}
                    >
                      {updateLoading ? "Saving..." : "Save"}
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="cancel-btn"
                      disabled={updateLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="feedback-card-header">
                    <h3>{fb.course}</h3>
                    <span className="rating-stars">{"⭐".repeat(fb.rating)} ({fb.rating}/5)</span>
                  </div>
                  <p><strong>Faculty:</strong> {fb.facultyName}</p>
                  <p><strong>Date:</strong> {fb.date}</p>
                  {fb.updatedAt && <p><strong>Updated:</strong> {fb.updatedAt}</p>}
                  {fb.comments && (
                    <div className="comments-section">
                      <strong>Comments:</strong>
                      <p className="comment-text">{fb.comments}</p>
                    </div>
                  )}
                  <div className="feedback-actions">
                    <button 
                      onClick={() => handleEdit(fb)} 
                      className="edit-btn"
                      disabled={deleteLoading === fb.id}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(fb.id)} 
                      className="delete-btn"
                      disabled={deleteLoading === fb.id}
                    >
                      {deleteLoading === fb.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;