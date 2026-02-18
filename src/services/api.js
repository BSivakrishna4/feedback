// Mock API service to simulate backend calls
// This simulates network delays and potential errors

const API_DELAY = 800; // Simulate network delay

// Simulate network request
const simulateRequest = (data, shouldFail = false) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error("Network error occurred"));
            } else {
                resolve(data);
            }
        }, API_DELAY);
    });
};

// Get data from localStorage (simulating database)
const getStorageData = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return defaultValue;
    }
};

// Save data to localStorage (simulating database)
const setStorageData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        throw new Error("Failed to save data");
    }
};

// API Methods
export const api = {
    // Auth APIs
    login: async (email, password) => {
        try {
            const users = getStorageData("users", [
                { id: 1, firstName: "Admin", lastName: "User", email: "admin@college.edu", password: "admin123", role: "admin" }
            ]);

            const user = users.find(u =>
                u.email.toLowerCase() === email.toLowerCase().trim() &&
                u.password === password
            );

            await simulateRequest(user);

            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                return { success: true, user: userWithoutPassword, token: `token_${user.id}_${Date.now()}` };
            } else {
                const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
                return {
                    success: false,
                    message: userExists ? "Incorrect password" : "No account found"
                };
            }
        } catch (error) {
            throw new Error("Login failed. Please try again.");
        }
    },

    signup: async (userData) => {
        try {
            const users = getStorageData("users", [
                { id: 1, firstName: "Admin", lastName: "User", email: "admin@college.edu", password: "admin123", role: "admin" }
            ]);

            // Check if email exists
            if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                await simulateRequest(null);
                return { success: false, message: "Email already registered" };
            }

            const newUser = {
                id: Date.now(),
                ...userData,
                role: "student"
            };

            users.push(newUser);
            setStorageData("users", users);

            await simulateRequest(newUser);

            return { success: true, message: "Account created successfully" };
        } catch (error) {
            throw new Error("Signup failed. Please try again.");
        }
    },

    // Feedback APIs
    submitFeedback: async (feedbackData) => {
        try {
            const allFeedback = getStorageData("feedbackData", []);

            const newFeedback = {
                id: Date.now(),
                ...feedbackData,
                date: new Date().toLocaleDateString()
            };

            allFeedback.push(newFeedback);
            setStorageData("feedbackData", allFeedback);

            await simulateRequest(newFeedback);

            return { success: true, data: newFeedback, message: "Feedback submitted successfully" };
        } catch (error) {
            throw new Error("Failed to submit feedback. Please try again.");
        }
    },

    getFeedback: async (userEmail = null) => {
        try {
            const allFeedback = getStorageData("feedbackData", []);

            await simulateRequest(allFeedback);

            if (userEmail) {
                const userFeedback = allFeedback.filter(fb => fb.studentEmail === userEmail);
                return { success: true, data: userFeedback };
            }

            return { success: true, data: allFeedback };
        } catch (error) {
            throw new Error("Failed to load feedback. Please try again.");
        }
    },

    initializeSampleData: async () => {
        try {
            const existingFeedback = getStorageData("feedbackData", null);

            if (!existingFeedback) {
                const sampleFeedback = [
                    {
                        id: 1,
                        studentName: "John Doe",
                        studentEmail: "john@student.edu",
                        facultyName: "Dr. Sarah Wilson",
                        course: "AI Basics",
                        rating: 5,
                        comments: "Excellent course! Dr. Wilson explains complex concepts very clearly.",
                        date: new Date().toLocaleDateString()
                    },
                    {
                        id: 2,
                        studentName: "Jane Smith",
                        studentEmail: "jane@student.edu",
                        facultyName: "Prof. Michael Brown",
                        course: "Machine Learning",
                        rating: 4,
                        comments: "Good course content, but could use more practical examples.",
                        date: new Date().toLocaleDateString()
                    },
                    {
                        id: 3,
                        studentName: "Mike Johnson",
                        studentEmail: "mike@student.edu",
                        facultyName: "Dr. Emily Davis",
                        course: "Deep Learning",
                        rating: 5,
                        comments: "Amazing course! The hands-on projects were very helpful.",
                        date: new Date().toLocaleDateString()
                    }
                ];

                setStorageData("feedbackData", sampleFeedback);
                await simulateRequest(sampleFeedback);

                return { success: true, data: sampleFeedback };
            }

            return { success: true, data: existingFeedback };
        } catch (error) {
            throw new Error("Failed to initialize data");
        }
    },

    // Update feedback
    updateFeedback: async (feedbackId, updatedData) => {
        try {
            const allFeedback = getStorageData("feedbackData", []);
            const feedbackIndex = allFeedback.findIndex(fb => fb.id === feedbackId);

            if (feedbackIndex === -1) {
                throw new Error("Feedback not found");
            }

            // Update the feedback while preserving original date and student info
            allFeedback[feedbackIndex] = {
                ...allFeedback[feedbackIndex],
                ...updatedData,
                updatedAt: new Date().toLocaleDateString()
            };

            setStorageData("feedbackData", allFeedback);
            await simulateRequest(allFeedback[feedbackIndex]);

            return { success: true, data: allFeedback[feedbackIndex], message: "Feedback updated successfully" };
        } catch (error) {
            throw new Error(error.message || "Failed to update feedback. Please try again.");
        }
    },

    // Delete feedback
    deleteFeedback: async (feedbackId) => {
        try {
            const allFeedback = getStorageData("feedbackData", []);
            const feedbackIndex = allFeedback.findIndex(fb => fb.id === feedbackId);

            if (feedbackIndex === -1) {
                throw new Error("Feedback not found");
            }

            const deletedFeedback = allFeedback[feedbackIndex];
            allFeedback.splice(feedbackIndex, 1);
            setStorageData("feedbackData", allFeedback);

            await simulateRequest(deletedFeedback);

            return { success: true, message: "Feedback deleted successfully" };
        } catch (error) {
            throw new Error(error.message || "Failed to delete feedback. Please try again.");
        }
    },

    // Get courses
    getCourses: async () => {
        try {
            const defaultCourses = [
                { id: 1, name: "Data Structures" },
                { id: 2, name: "Web Development" },
                { id: 3, name: "AI Basics" },
                { id: 4, name: "Machine Learning" },
                { id: 5, name: "Deep Learning" },
                { id: 6, name: "Database Management" }
            ];

            const courses = getStorageData("courses", defaultCourses);
            await simulateRequest(courses);
            return { success: true, data: courses };
        } catch (error) {
            throw new Error("Failed to load courses. Please try again.");
        }
    },

    // Get faculties
    getFaculties: async () => {
        try {
            const defaultFaculties = [
                { id: 1, name: "Dr. Sarah Wilson", assignedCourses: [3, 1] },
                { id: 2, name: "Prof. Michael Brown", assignedCourses: [4, 2] },
                { id: 3, name: "Dr. Emily Davis", assignedCourses: [5, 4] },
                { id: 4, name: "Dr. John Smith", assignedCourses: [2, 6] },
                { id: 5, name: "Dr. Lisa Anderson", assignedCourses: [1, 3] }
            ];

            const faculties = getStorageData("faculties", defaultFaculties);
            await simulateRequest(faculties);
            return { success: true, data: faculties };
        } catch (error) {
            throw new Error("Failed to load faculties. Please try again.");
        }
    },

    // Add course
    addCourse: async (courseName) => {
        try {
            const defaultCourses = [
                { id: 1, name: "Data Structures" },
                { id: 2, name: "Web Development" },
                { id: 3, name: "AI Basics" },
                { id: 4, name: "Machine Learning" },
                { id: 5, name: "Deep Learning" },
                { id: 6, name: "Database Management" }
            ];
            const courses = getStorageData("courses", defaultCourses);
            const newCourse = {
                id: Date.now(),
                name: courseName.trim()
            };
            courses.push(newCourse);
            setStorageData("courses", courses);
            await simulateRequest(newCourse);
            return { success: true, data: newCourse, message: "Course added successfully" };
        } catch (error) {
            throw new Error("Failed to add course. Please try again.");
        }
    },

    // Add faculty
    addFaculty: async (facultyName) => {
        try {
            const defaultFaculties = [
                { id: 1, name: "Dr. Sarah Wilson", assignedCourses: [3, 1] },
                { id: 2, name: "Prof. Michael Brown", assignedCourses: [4, 2] },
                { id: 3, name: "Dr. Emily Davis", assignedCourses: [5, 4] },
                { id: 4, name: "Dr. John Smith", assignedCourses: [2, 6] },
                { id: 5, name: "Dr. Lisa Anderson", assignedCourses: [1, 3] }
            ];
            const faculties = getStorageData("faculties", defaultFaculties);
            const newFaculty = {
                id: Date.now(),
                name: facultyName.trim(),
                assignedCourses: []
            };
            faculties.push(newFaculty);
            setStorageData("faculties", faculties);
            await simulateRequest(newFaculty);
            return { success: true, data: newFaculty, message: "Faculty added successfully" };
        } catch (error) {
            throw new Error("Failed to add faculty. Please try again.");
        }
    },

    // Delete course
    deleteCourse: async (courseId) => {
        try {
            const courses = getStorageData("courses", []);
            const index = courses.findIndex(c => c.id === courseId);
            if (index === -1) {
                throw new Error("Course not found");
            }
            courses.splice(index, 1);
            setStorageData("courses", courses);
            await simulateRequest(null);
            return { success: true, message: "Course deleted successfully" };
        } catch (error) {
            throw new Error(error.message || "Failed to delete course. Please try again.");
        }
    },

    // Delete faculty
    deleteFaculty: async (facultyId) => {
        try {
            const faculties = getStorageData("faculties", []);
            const index = faculties.findIndex(f => f.id === facultyId);
            if (index === -1) {
                throw new Error("Faculty not found");
            }
            faculties.splice(index, 1);
            setStorageData("faculties", faculties);
            await simulateRequest(null);
            return { success: true, message: "Faculty deleted successfully" };
        } catch (error) {
            throw new Error(error.message || "Failed to delete faculty. Please try again.");
        }
    },

    // Check and add course if it doesn't exist
    ensureCourseExists: async (courseName) => {
        try {
            const defaultCourses = [
                { id: 1, name: "Data Structures" },
                { id: 2, name: "Web Development" },
                { id: 3, name: "AI Basics" },
                { id: 4, name: "Machine Learning" },
                { id: 5, name: "Deep Learning" },
                { id: 6, name: "Database Management" }
            ];
            const courses = getStorageData("courses", defaultCourses);
            const existingCourse = courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
            
            if (existingCourse) {
                return { success: true, data: existingCourse, message: "Course already exists" };
            }
            
            // If course doesn't exist, add it
            const response = await api.addCourse(courseName);
            return response;
        } catch (error) {
            throw new Error("Failed to ensure course exists. Please try again.");
        }
    },

    // Get courses for a specific faculty
    getCoursesByFaculty: async (facultyId) => {
        try {
            const defaultFaculties = [
                { id: 1, name: "Dr. Sarah Wilson", assignedCourses: [3, 1] },
                { id: 2, name: "Prof. Michael Brown", assignedCourses: [4, 2] },
                { id: 3, name: "Dr. Emily Davis", assignedCourses: [5, 4] },
                { id: 4, name: "Dr. John Smith", assignedCourses: [2, 6] },
                { id: 5, name: "Dr. Lisa Anderson", assignedCourses: [1, 3] }
            ];

            const defaultCourses = [
                { id: 1, name: "Data Structures" },
                { id: 2, name: "Web Development" },
                { id: 3, name: "AI Basics" },
                { id: 4, name: "Machine Learning" },
                { id: 5, name: "Deep Learning" },
                { id: 6, name: "Database Management" }
            ];

            const faculties = getStorageData("faculties", defaultFaculties);
            const faculty = faculties.find(f => f.id === facultyId);
            
            if (!faculty) {
                console.error(`Faculty with ID ${facultyId} not found`);
                throw new Error("Faculty not found");
            }

            console.log(`Found faculty:`, faculty);
            console.log(`Assigned courses for faculty:`, faculty.assignedCourses);

            const courses = getStorageData("courses", defaultCourses);
            console.log(`All courses:`, courses);
            
            const facultyCourses = courses.filter(c => {
                const isAssigned = faculty.assignedCourses && faculty.assignedCourses.includes(c.id);
                console.log(`Checking course ${c.id} (${c.name}): assigned=${isAssigned}`);
                return isAssigned;
            });
            
            console.log(`Final faculty courses:`, facultyCourses);
            
            await simulateRequest(facultyCourses);
            return { success: true, data: facultyCourses };
        } catch (error) {
            console.error("Error in getCoursesByFaculty:", error);
            throw new Error("Failed to load faculty courses. Please try again.");
        }
    },

    // Assign course to faculty
    assignCourseToFaculty: async (facultyId, courseId) => {
        try {
            const defaultFaculties = [
                { id: 1, name: "Dr. Sarah Wilson", assignedCourses: [3, 1] },
                { id: 2, name: "Prof. Michael Brown", assignedCourses: [4, 2] },
                { id: 3, name: "Dr. Emily Davis", assignedCourses: [5, 4] },
                { id: 4, name: "Dr. John Smith", assignedCourses: [2, 6] },
                { id: 5, name: "Dr. Lisa Anderson", assignedCourses: [1, 3] }
            ];
            const faculties = getStorageData("faculties", defaultFaculties);
            const faculty = faculties.find(f => f.id === facultyId);
            
            if (!faculty) {
                throw new Error("Faculty not found");
            }

            if (!faculty.assignedCourses) {
                faculty.assignedCourses = [];
            }

            if (!faculty.assignedCourses.includes(courseId)) {
                faculty.assignedCourses.push(courseId);
                setStorageData("faculties", faculties);
            }

            await simulateRequest(faculty);
            return { success: true, data: faculty, message: "Course assigned successfully" };
        } catch (error) {
            throw new Error("Failed to assign course. Please try again.");
        }
    },
    
    // Unassign course from faculty
    unassignCourseFromFaculty: async (facultyId, courseId) => {
        try {
            const defaultFaculties = [
                { id: 1, name: "Dr. Sarah Wilson", assignedCourses: [3, 1] },
                { id: 2, name: "Prof. Michael Brown", assignedCourses: [4, 2] },
                { id: 3, name: "Dr. Emily Davis", assignedCourses: [5, 4] },
                { id: 4, name: "Dr. John Smith", assignedCourses: [2, 6] },
                { id: 5, name: "Dr. Lisa Anderson", assignedCourses: [1, 3] }
            ];
            const faculties = getStorageData("faculties", defaultFaculties);
            const faculty = faculties.find(f => f.id === facultyId);
            if (!faculty) {
                throw new Error("Faculty not found");
            }
            if (!faculty.assignedCourses) {
                faculty.assignedCourses = [];
            }
            const idx = faculty.assignedCourses.indexOf(courseId);
            if (idx !== -1) {
                faculty.assignedCourses.splice(idx, 1);
                setStorageData("faculties", faculties);
            }
            await simulateRequest(faculty);
            return { success: true, data: faculty, message: "Course unassigned successfully" };
        } catch (error) {
            throw new Error("Failed to unassign course. Please try again.");
        }
    }
};
