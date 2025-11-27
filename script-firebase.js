// Show/Hide auth tabs
function showTab(tabName) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabBtns = document.querySelectorAll('.auth-tabs .tab-btn');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    if (tabName === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    }
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message') || {};
    
    const user = appData.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user session
        localStorage.setItem('currentUserEmail', email);
        
        if (messageDiv.innerHTML !== undefined) {
            messageDiv.innerHTML = '<div class="alert alert-success">✓ Login successful! Redirecting...</div>';
        }
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'student') {
                window.location.href = 'student-dashboard.html';
            } else if (user.role === 'job-provider') {
                window.location.href = 'job-provider-dashboard.html';
            }
        }, 500);
    } else {
        if (messageDiv.innerHTML !== undefined) {
            messageDiv.innerHTML = '<div class="alert alert-error">✗ Invalid email or password. Try: alice@example.com / password123</div>';
        } else {
            alert('Invalid email or password. Try: alice@example.com / password123');
        }
    }
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    const messageDiv = document.getElementById('signup-message') || {};
    
    // Validate
    if (password.length < 6) {
        if (messageDiv.innerHTML !== undefined) {
            messageDiv.innerHTML = '<div class="alert alert-error">✗ Password must be at least 6 characters</div>';
        }
        return;
    }
    
    if (!name || !email || !role) {
        if (messageDiv.innerHTML !== undefined) {
            messageDiv.innerHTML = '<div class="alert alert-error">✗ Please fill all fields</div>';
        }
        return;
    }
    
    // Check if user already exists
    const existingUser = appData.users.find(u => u.email === email);
    
    if (existingUser) {
        if (messageDiv.innerHTML !== undefined) {
            messageDiv.innerHTML = '<div class="alert alert-error">✗ Email already registered. Please login instead.</div>';
        }
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
        skills: role === 'student' ? [] : null,
        jobsApplied: role === 'student' ? 0 : null,
        coursesEnrolled: role === 'student' ? 0 : null
    };
    
    appData.users.push(newUser);
    saveData();
    
    // Store current user session
    localStorage.setItem('currentUserEmail', email);
    
    if (messageDiv.innerHTML !== undefined) {
        messageDiv.innerHTML = '<div class="alert alert-success">✓ Account created! Sending welcome email...</div>';
    }
    
    // Send welcome email
    sendWelcomeEmail(name, email);
    
    setTimeout(() => {
        if (role === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (role === 'job-provider') {
            window.location.href = 'job-provider-dashboard.html';
        }
    }, 1500);
}

// Send welcome email
function sendWelcomeEmail(name, email) {
    // FormSubmit integration
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formspree.io/f/xyzqwert'; // Replace with your formspree ID
    form.style.display = 'none';
    
    form.innerHTML = `
        <input type="hidden" name="subject" value="Welcome to Teen Skill Bridge">
        <input type="hidden" name="message" value="Hi ${name}, welcome to Teen Skill Bridge!">
        <input type="hidden" name="email" value="${email}">
    `;
    
    document.body.appendChild(form);
    // Commented out to prevent actual email sending during demo
    // form.submit();
    document.body.removeChild(form);
}

// Logout
function logout() {
    localStorage.removeItem('currentUserEmail');
    window.location.href = 'index.html';
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

// Check if user is logged in
const checkAuth = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return currentUser;
};

// Toggle profile dropdown
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const profile = document.querySelector('.user-profile');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (dropdown && profile && !profile.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ============================================
// STUDENT DASHBOARD FUNCTIONS
// ============================================

// Switch tabs in student dashboard
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const btns = document.querySelectorAll('.dashboard-tabs .tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    btns.forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Show profile tab
function showProfileTab() {
    const tabs = document.querySelectorAll('.tab-content');
    const btns = document.querySelectorAll('.dashboard-tabs .tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    btns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('profile-tab').classList.add('active');
    btns[btns.length - 1].classList.add('active');
    
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// Load student data
function loadStudentData() {
    const user = checkAuth();
    
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }
    
    // Update header
    const studentName = document.getElementById('student-name');
    if (studentName) {
        studentName.textContent = user.name;
    }
    
    // Update profile tab
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const accountCreated = document.getElementById('account-created');
    const jobsApplied = document.getElementById('jobs-applied');
    const coursesEnrolled = document.getElementById('courses-enrolled');
    
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (accountCreated) accountCreated.textContent = new Date(user.createdAt).toLocaleDateString();
    if (jobsApplied) jobsApplied.textContent = user.jobsApplied || 0;
    if (coursesEnrolled) coursesEnrolled.textContent = user.coursesEnrolled || 0;
    
    // Load job listings
    loadJobListings();
}

// Load job listings for students
function loadJobListings() {
    const jobListingsContainer = document.getElementById('job-listings');
    
    if (!jobListingsContainer) return;
    
    if (appData.jobs.length === 0) {
        jobListingsContainer.innerHTML = '<div class="alert alert-info">No job opportunities available at the moment. Check back soon!</div>';
        return;
    }
    
    jobListingsContainer.innerHTML = appData.jobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <span class="job-type">${job.type}</span>
                </div>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-details">
                <div class="job-detail-item"><span>${job.pay}</span></div>
                <div class="job-detail-item"><span>${job.skills}</span></div>
                <div class="job-detail-item"><span>Posted ${new Date(job.postedAt).toLocaleDateString()}</span></div>
            </div>
            <button class="btn-primary" onclick="applyForJob('${job.id}')">Apply Now</button>
        </div>
    `).join('');
}

// Apply for a job
function applyForJob(jobId) {
    const user = getCurrentUser();
    const job = appData.jobs.find(j => j.id === jobId);
    
    if (!job) return;
    
    // Check if already applied
    const alreadyApplied = appData.studentApplications.some(app => 
        app.studentId === user.id && app.jobId === jobId
    );
    
    if (alreadyApplied) {
        alert('You have already applied for this position!');
        return;
    }
    
    // Create application
    const application = {
        id: Date.now().toString(),
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        jobId: jobId,
        jobTitle: job.title,
        providerId: job.providerId,
        appliedAt: new Date().toISOString()
    };
    
    appData.studentApplications.push(application);
    
    // Update users jobs applied count
    const userIndex = appData.users.findIndex(u => u.id === user.id);
    if (userIndex >= 0) {
        appData.users[userIndex].jobsApplied = (appData.users[userIndex].jobsApplied || 0) + 1;
    }
    
    saveData();
    
    alert('Application submitted successfully!');
    loadJobListings();
}

// ============================================
// JOB PROVIDER DASHBOARD FUNCTIONS
// ============================================

// Load job provider data
function loadJobProviderData() {
    const user = checkAuth();
    
    if (!user || user.role !== 'job-provider') {
        window.location.href = 'index.html';
        return;
    }
    
    // Update header
    const providerName = document.getElementById('provider-name');
    if (providerName) {
        providerName.textContent = user.name;
    }
    
    // Load posted jobs
    loadPostedJobs(user.id);
    
    // Load enrolled students
    loadEnrolledStudents(user.id);
}

// Post a new job
function postJob(event) {
    event.preventDefault();
    
    const user = getCurrentUser();
    const title = document.getElementById('job-title').value;
    const type = document.getElementById('job-type').value;
    const description = document.getElementById('job-description').value;
    const skills = document.getElementById('job-skills').value;
    const pay = document.getElementById('job-pay').value;
    
    const newJob = {
        id: Date.now().toString(),
        providerId: user.id,
        providerName: user.name,
        title,
        type,
        description,
        skills,
        pay,
        postedAt: new Date().toISOString()
    };
    
    appData.jobs.push(newJob);
    saveData();
    
    // Reset form
    event.target.reset();
    
    alert('Job posted successfully!');
    loadPostedJobs(user.id);
}

// Load posted jobs for provider
function loadPostedJobs(providerId) {
    const jobsList = document.getElementById('posted-jobs-list');
    if (!jobsList) return;
    
    const providerJobs = appData.jobs.filter(job => job.providerId === providerId);
    
    if (providerJobs.length === 0) {
        jobsList.innerHTML = '<div class="alert alert-info">You haven\'t posted any jobs yet. Use the form above to post your first job!</div>';
        return;
    }
    
    jobsList.innerHTML = providerJobs.map(job => `
        <div class="posted-job-card">
            <div class="posted-job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <span class="job-type">${job.type}</span>
                </div>
                <button class="delete-btn" onclick="deleteJob('${job.id}')">Delete</button>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-details">
                <div class="job-detail-item">${job.pay}</div>
                <div class="job-detail-item">${job.skills}</div>
                <div class="job-detail-item">${new Date(job.postedAt).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

// Delete a job
function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job posting?')) {
        return;
    }
    
    appData.jobs = appData.jobs.filter(job => job.id !== jobId);
    appData.studentApplications = appData.studentApplications.filter(app => app.jobId !== jobId);
    
    saveData();
    
    const user = getCurrentUser();
    loadPostedJobs(user.id);
    loadEnrolledStudents(user.id);
}

// Load enrolled students applications
function loadEnrolledStudents(providerId) {
    const studentsList = document.getElementById('enrolled-students-list');
    if (!studentsList) return;
    
    // Get all applications for this provider's jobs
    const providerJobIds = appData.jobs
        .filter(job => job.providerId === providerId)
        .map(job => job.id);
    
    const applications = appData.studentApplications.filter(app =>
        providerJobIds.includes(app.jobId)
    );
    
    if (applications.length === 0) {
        studentsList.innerHTML = '<div class="alert alert-info">No student applications yet. Students will appear here when they apply to your jobs.</div>';
        return;
    }
    
    studentsList.innerHTML = applications.map(app => `
        <div class="student-card">
            <div class="student-info">
                <div class="student-avatar">👤</div>
                <div class="student-details">
                    <h4>${app.studentName}</h4>
                    <p>${app.studentEmail}</p>
                </div>
            </div>
            <div class="student-meta">
                <p><strong>Applied for:</strong> ${app.jobTitle}</p>
                <p><strong>Applied on:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('student-dashboard')) {
        loadStudentData();
    } else if (currentPage.includes('job-provider')) {
        loadJobProviderData();
    }
    
    // Add sample data if database is empty for demo purposes
    if (appData.users.length === 0) {
        addSampleData();
    }
});

// Add sample data for demonstration
function addSampleData() {
    const sampleData = {
        users: [
            {
                id: '1',
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: 'password123',
                role: 'student',
                createdAt: new Date().toISOString(),
                skills: ['Web Development', 'Design'],
                jobsApplied: 0,
                coursesEnrolled: 2
            },
            {
                id: '2',
                name: 'Tech Startup Inc',
                email: 'jobs@techstartup.com',
                password: 'password123',
                role: 'job-provider',
                createdAt: new Date().toISOString()
            }
        ],
        jobs: [
            {
                id: '1',
                providerId: '2',
                providerName: 'Tech Startup Inc',
                title: 'Social Media Assistant',
                type: 'part-time',
                description: 'Help manage our social media accounts and create engaging content for our teenage audience.',
                skills: 'Social Media, Content Creation, Communication',
                pay: '$12/hour',
                postedAt: new Date().toISOString()
            }
        ],
        studentApplications: []
    };
    
    appData.users = sampleData.users;
    appData.jobs = sampleData.jobs;
    appData.studentApplications = sampleData.studentApplications;
    
    saveData();
}
