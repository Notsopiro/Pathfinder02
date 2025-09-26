document.addEventListener('DOMContentLoaded', async () => {

    // --- Basic Setup & Enhanced Data ---
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link, .logo, .get-started-btn, .btn-lg, footer a[data-page]');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // --- START: Gemini AI Integration ---
    // WARNING: Do not expose your API key in a production environment.
    // This is for demonstration purposes only.
    const GEMINI_API_KEY = 'AIzaSyAO91FPokqFnUOFaLmFyzKvOr-rAU0onag'; // <-- PASTE YOUR API KEY HERE
    const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    let chat; // This will hold our chat session
    // --- END: Gemini AI Integration ---

    let quizResultsSummary = null;
    let resultsChart = null;

    // Expanded career data for a richer experience
    const careersData = [
      { id: 1, title: 'Software Engineer', field: 'Technology', description: 'Design, develop, and maintain software systems using various programming languages.', qualifications: 'Bachelor\'s in Computer Science', outlook: 'Excellent', skills: ['Java', 'Python', 'React', 'Algorithms'] },
      { id: 2, title: 'Graphic Designer', field: 'Creative', description: 'Create visual concepts, by hand or using computer software, to communicate ideas that inspire, inform, or captivate consumers.', qualifications: 'Bachelor\'s in Design or related field', outlook: 'Good', skills: ['Adobe CC', 'UI/UX', 'Typography', 'Branding'] },
      { id: 3, title: 'Data Scientist', field: 'Technology', description: 'Analyze and interpret complex data to help organizations make better decisions. Involves machine learning and statistical modeling.', qualifications: 'Master\'s or PhD in a quantitative field', outlook: 'Excellent', skills: ['Python', 'R', 'Machine Learning', 'Statistics'] },
      { id: 4, title: 'Marketing Manager', field: 'Business', description: 'Plan and execute marketing campaigns to promote brands, products, or services. Oversee a team of marketing professionals.', qualifications: 'Bachelor\'s in Marketing or Business', outlook: 'Very Good', skills: ['SEO/SEM', 'Content Strategy', 'Analytics', 'Leadership'] },
      { id: 5, title: 'Registered Nurse', field: 'Healthcare', description: 'Provide and coordinate patient care, educate patients and the public about various health conditions, and provide advice and emotional support.', qualifications: 'Associate or Bachelor\'s in Nursing (ASN/BSN)', outlook: 'Excellent', skills: ['Patient Care', 'Medical Software', 'Empathy', 'Critical Thinking'] },
      { id: 6, title: 'Financial Analyst', field: 'Finance', description: 'Provide guidance to businesses and individuals making investment decisions. They assess the performance of stocks, bonds, and other types of investments.', qualifications: 'Bachelor\'s in Finance or Economics', outlook: 'Very Good', skills: ['Financial Modeling', 'Excel', 'Statistics', 'Valuation'] },
      { id: 7, title: 'Architect', field: 'Creative', description: 'Plan and design buildings and other structures. Work with clients to create functional and aesthetically pleasing spaces.', qualifications: 'Bachelor/Master of Architecture', outlook: 'Good', skills: ['AutoCAD', 'SketchUp', 'Project Management', 'Creativity'] },
      { id: 8, title: 'Electrician', field: 'Trades', description: 'Install, maintain, and repair electrical power, communications, lighting, and control systems in homes, businesses, and factories.', qualifications: 'Apprenticeship/Trade School', outlook: 'Good', skills: ['Blueprint Reading', 'Troubleshooting', 'Safety Compliance'] },
      { id: 9, title: 'High School Teacher', field: 'Education', description: 'Educate students in a specific subject area, plan lessons, grade assignments, and mentor students in their academic and personal growth.', qualifications: 'Bachelor\'s Degree & Teaching Credential', outlook: 'Stable', skills: ['Pedagogy', 'Classroom Management', 'Subject-Matter Expertise'] },
      { id: 10, title: 'Civil Engineer', field: 'Technology', description: 'Conceive, design, build, supervise, operate, construct, and maintain infrastructure projects and systems in the public and private sector.', qualifications: 'Bachelor\'s in Civil Engineering', outlook: 'Good', skills: ['Project Management', 'CAD Software', 'Structural Analysis'] },
      { id: 11, title: 'Plumber', field: 'Trades', description: 'Install and repair pipes and fixtures that carry water, steam, air, or other liquids or gases in businesses, homes, and factories.', qualifications: 'Apprenticeship/Trade School', outlook: 'Stable', skills: ['Pipe Systems', 'Troubleshooting', 'Welding'] },
      { id: 12, title: 'Physical Therapist', field: 'Healthcare', description: 'Help injured or ill people improve their movement and manage their pain. They are often an important part of rehabilitation.', qualifications: 'Doctor of Physical Therapy (DPT)', outlook: 'Excellent', skills: ['Rehabilitation', 'Anatomy', 'Patient Education'] },
    ];

    const quizQuestions = [
        { question: "Which activity sounds most appealing on a weekend?", options: ["Building a small robot or coding a simple app.", "Painting, writing, or playing an instrument.", "Fixing a leaky faucet or building furniture.", "Organizing a group event or leading a team project."], traits: ['Tech', 'Creative', 'Hands-On', 'Social'] },
        { question: "When faced with a problem, you tend to:", options: ["Look for a logical, step-by-step solution.", "Brainstorm creative and unconventional ideas.", "Gather as much data as possible before deciding.", "Roll up your sleeves and try a practical fix."], traits: ['Tech', 'Creative', 'Analytical', 'Hands-On'] },
        { question: "Which work environment do you prefer?", options: ["A dynamic, flexible environment with new challenges.", "A quiet, focused environment for deep thinking.", "A collaborative, team-oriented environment.", "Working outdoors or with physical tools."], traits: ['Creative', 'Analytical', 'Social', 'Hands-On'] },
        { question: "What subject do you find most interesting?", options: ["Mathematics or Physics", "Art or Literature", "Economics or Psychology", "Woodshop or Auto Mechanics"], traits: ['Tech', 'Creative', 'Analytical', 'Hands-On'] },
        { question: "You are most proud of your ability to:", options: ["Create functional and efficient things.", "Express yourself in a unique way.", "Understand complex systems and patterns.", "Connect with and motivate people."], traits: ['Tech', 'Creative', 'Analytical', 'Social'] },
        { question: "Which of these job descriptions appeals to you most?", options: ["Developing cutting-edge software for a tech company.", "Designing the cover for a bestselling novel.", "Counseling students at a university.", "Constructing a custom piece of furniture."], traits: ['Tech', 'Creative', 'Social', 'Hands-On'] },
        { question: "In a group project, you are most likely to be the one who:", options: ["Handles the technical aspects and troubleshooting.", "Comes up with the overall vision and aesthetic.", "Organizes the data and creates the project plan.", "Presents the final project to the class."], traits: ['Tech', 'Creative', 'Analytical', 'Social'] },
        { question: "You learn best by:", options: ["Reading and researching on your own.", "Watching videos and seeing visual examples.", "Doing it yourself and through trial-and-error.", "Discussing concepts with others."], traits: ['Analytical', 'Creative', 'Hands-On', 'Social'] },
        { question: "What kind of impact do you want to make?", options: ["Building tools that solve problems.", "Creating art that inspires people.", "Helping individuals with their personal challenges.", "Improving systems to be more efficient."], traits: ['Tech', 'Creative', 'Social', 'Analytical'] },
        { question: "Choose a tool you'd prefer to work with:", options: ["A powerful computer.", "A set of artist's brushes.", "A well-organized spreadsheet.", "A set of high-quality hand tools."], traits: ['Tech', 'Creative', 'Analytical', 'Hands-On'] }
    ];
    
    // --- Mock Community Data ---
    let communityPostsData = [
        { id: 1, author: 'Alex_Techie', avatar: 'https://placehold.co/40x40/64748B/FFFFFF?text=A', timestamp: '3 hours ago', content: 'Just finished the quiz and it pointed me towards Data Science. I was thinking about software engineering but this is an interesting alternative. Anyone here in the data field? What’s it really like?', likes: 12, comments: 4, liked: false },
        { id: 2, author: 'CreativeSoul', avatar: 'https://placehold.co/40x40/EC4899/FFFFFF?text=C', timestamp: '8 hours ago', content: 'I\'m struggling to choose between Graphic Design and Architecture. The quiz highlighted my creative and technical side. How do you balance passion with practical job prospects?', likes: 25, comments: 8, liked: true },
        { id: 3, author: 'FutureNurse', avatar: 'https://placehold.co/40x40/22C55E/FFFFFF?text=F', timestamp: '1 day ago', content: 'For anyone considering healthcare, I highly recommend shadowing a professional for a day. It gave me so much clarity that I couldn\'t get from just reading online. My quiz results confirmed my social and analytical strengths, which is perfect for nursing!', likes: 42, comments: 11, liked: false },
    ];

    // --- Icon Replacement ---
    lucide.createIcons();

    // --- Theme Switcher ---
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);


    // --- Page Navigation ---
    function showPage(pageId) {
        pages.forEach(page => page.classList.add('hidden'));
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) activePage.classList.remove('hidden');
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if(link.dataset.page === pageId) link.classList.add('active');
        });
        window.scrollTo(0, 0);

        if (pageId === 'careers') renderCareers();
        if (pageId === 'quiz') startQuiz();
        if (pageId === 'chatbot') initializeChat();
        if (pageId === 'community') renderCommunityFeed();
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.currentTarget.dataset.page;
            if (pageId) showPage(pageId);
        });
    });

    // --- Intelligent Quiz Logic ---
    const quizContainer = document.getElementById('quiz-container');
    const quizResultsContainer = document.getElementById('quiz-results-container');
    let currentQuestionIndex = 0;
    let scores = { Tech: 0, Creative: 0, Analytical: 0, Social: 0, 'Hands-On': 0 };
    let userAnswersText = [];

    function startQuiz() {
        currentQuestionIndex = 0;
        scores = { Tech: 0, Creative: 0, Analytical: 0, Social: 0, 'Hands-On': 0 };
        userAnswersText = [];
        quizContainer.classList.remove('hidden');
        quizResultsContainer.classList.add('hidden');
        if (resultsChart) {
            resultsChart.destroy();
        }
        renderQuestion();
    }

    function renderQuestion() {
        const question = quizQuestions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
        quizContainer.innerHTML = `
            <p class="quiz-progress-text">Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</p>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
            <h2 class="quiz-question">${question.question}</h2>
            <div class="quiz-options">
                ${question.options.map((option, index) => `<button class="quiz-option" data-index="${index}">${option}</button>`).join('')}
            </div>
        `;
        document.querySelectorAll('.quiz-option').forEach(button => button.addEventListener('click', handleAnswer));
    }

    function handleAnswer(e) {
        const selectedIndex = e.target.dataset.index;
        const selectedTrait = quizQuestions[currentQuestionIndex].traits[selectedIndex];
        if (scores.hasOwnProperty(selectedTrait)) {
            scores[selectedTrait]++;
        }
        userAnswersText.push(e.target.textContent);

        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            renderQuestion();
        } else {
            finishQuiz();
        }
    }

    function finishQuiz() {
        quizContainer.classList.add('hidden');
        quizResultsContainer.classList.remove('hidden');
        
        const sortedTraits = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
        const primaryTrait = sortedTraits[0];
        const secondaryTrait = sortedTraits[1];

        quizResultsSummary = `Based on your answers, your primary trait appears to be **${primaryTrait}**, with a strong secondary inclination towards **${secondaryTrait}**. This suggests you thrive on tasks involving ${primaryTrait.toLowerCase()} skills and enjoy environments that foster ${secondaryTrait.toLowerCase()} interactions.`;
        
        document.getElementById('quiz-answers-summary').innerHTML = quizResultsSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        renderRadarChart();
    }

    function renderRadarChart() {
        const ctx = document.getElementById('results-chart').getContext('2d');
        const isLightTheme = document.body.getAttribute('data-theme') === 'light';
        const gridColor = isLightTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
        const pointLabelColor = isLightTheme ? '#202124' : '#F0F0F8';
        const ticksColor = isLightTheme ? '#5F6368' : '#A0A0B8';
        const legendColor = isLightTheme ? '#202124' : '#F0F0F8';
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
        const accentColorTransparent = accentColor + '33'; // Add 20% opacity in hex

        const data = {
            labels: ['Tech', 'Creative', 'Analytical', 'Social', 'Hands-On'],
            datasets: [{
                label: 'Your Interests',
                data: [scores.Tech, scores.Creative, scores.Analytical, scores.Social, scores['Hands-On']],
                backgroundColor: accentColorTransparent,
                borderColor: accentColor,
                pointBackgroundColor: accentColor,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: accentColor
            }]
        };

        resultsChart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: { color: pointLabelColor, font: { size: 14 } },
                        ticks: {
                            color: ticksColor,
                            backdropColor: 'transparent',
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: legendColor
                        }
                    }
                }
            }
        });
    }
    
    // --- Chatbot Logic ---
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSubmitBtn = document.getElementById('chat-submit-btn');

    // MODIFIED: This function now initializes a chat session with Gemini
    function initializeChat() {
        chatWindow.innerHTML = '';
        
        // System instruction to define the AI's role
        const systemInstruction = "You are a friendly and encouraging AI Career Coach. Your name is Path Finder. You help users explore career paths based on their interests and quiz results. Keep your responses concise, helpful, and conversational.";
        
        const initialHistory = [
            { role: "user", parts: [{ text: "Hello, I'd like some career advice." }], },
            { role: "model", parts: [{ text: "Of course! I'm Path Finder, your AI Career Coach. To start, you can tell me about your interests or take our quiz for a personalized analysis." }], }
        ];

        // Start a new chat session with system instruction and history
        chat = model.startChat({
            history: initialHistory,
            generationConfig: { maxOutputTokens: 500, },
            systemInstruction: systemInstruction,
        });

        const initialMessage = quizResultsSummary 
            ? `Hello! I've analyzed your quiz results. ${quizResultsSummary} Based on this, what kind of work are you curious to explore?`
            : "Hello! I'm your AI Career Coach. To get started, you can tell me about your interests, or take our quiz for a more detailed analysis. What's on your mind?";
        
        addMessageToChat('ai', initialMessage);
    }

    function addMessageToChat(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);

        let content;
        if (text === 'loading') {
            content = `<div class="avatar"><i data-lucide="bot"></i></div>
                       <div class="chat-bubble"><div class="loading-dots"><span></span><span></span><span></span></div></div>`;
        } else {
            const avatar = sender === 'ai' ? `<div class="avatar"><i data-lucide="bot"></i></div>` : '';
            // Basic markdown for bold text
            const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            content = `${avatar}<div class="chat-bubble">${formattedText}</div>`;
        }
        
        messageElement.innerHTML = content;
        chatWindow.appendChild(messageElement);
        lucide.createIcons();
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageElement;
    }

    // MODIFIED: This function is now async and calls the Gemini API
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;

        addMessageToChat('user', userInput);
        chatInput.value = '';
        chatSubmitBtn.disabled = true;

        const loadingMessage = addMessageToChat('ai', 'loading');
        
        try {
            // Send the user message to the Gemini chat session
            const result = await chat.sendMessage(userInput);
            const response = await result.response;
            const text = response.text();
            
            loadingMessage.remove(); // Remove the loading indicator
            addMessageToChat('ai', text); // Add the AI's response
            
        } catch (error) {
            loadingMessage.remove();
            addMessageToChat('ai', "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.");
            console.error("Gemini API Error:", error);
        } finally {
            chatSubmitBtn.disabled = false;
        }
    });

    // --- Careers Page Logic ---
    const careersGrid = document.getElementById('careers-grid');
    const searchInput = document.getElementById('career-search');
    const filterSelect = document.getElementById('career-filter');

    function renderCareers() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;

        const filteredCareers = careersData
            .filter(career => filterValue === 'All' || career.field === filterValue)
            .filter(career => career.title.toLowerCase().includes(searchTerm) || career.description.toLowerCase().includes(searchTerm));

        careersGrid.innerHTML = filteredCareers.length ? filteredCareers.map(career => `
            <div class="career-card">
                <h3>${career.title}</h3>
                <p>${career.description}</p>
                <div class="info"><strong>Qualifications:</strong> ${career.qualifications}</div>
                <div class="info"><strong>Job Outlook:</strong> ${career.outlook}</div>
                <div class="skills-container">
                    ${career.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('') : `<p class="no-results">No careers found matching your criteria.</p>`;
    }

    searchInput.addEventListener('input', renderCareers);
    filterSelect.addEventListener('change', renderCareers);
    
    // --- Community Page Logic ---
    const communityFeed = document.getElementById('community-feed');
    const postForm = document.getElementById('post-form');
    const postTextarea = document.getElementById('post-textarea');

    function renderCommunityFeed() {
        communityFeed.innerHTML = communityPostsData
            .sort((a, b) => b.id - a.id) // Show newest posts first
            .map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.author}" class="post-avatar" onerror="this.onerror=null;this.src='https://placehold.co/40x40/334155/FFFFFF?text=U';">
                    <div>
                        <div class="post-author">${post.author}</div>
                        <div class="post-meta">${post.timestamp}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="action-btn like-btn ${post.liked ? 'liked' : ''}">
                        <i data-lucide="heart"></i>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-btn">
                        <i data-lucide="message-circle"></i>
                        <span>${post.comments}</span>
                    </button>
                </div>
            </div>
        `).join('');
        lucide.createIcons(); // Re-render icons after updating HTML
    }

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const postContent = postTextarea.value.trim();
        if (!postContent) return;

        const newPost = {
            id: Date.now(),
            author: 'CurrentUser', // In a real app, this would be the logged-in user
            avatar: 'https://placehold.co/40x40/06B6D4/FFFFFF?text=Me',
            timestamp: 'Just now',
            content: postContent,
            likes: 0,
            comments: 0,
            liked: false
        };
        
        communityPostsData.push(newPost);
        postTextarea.value = '';
        renderCommunityFeed();
    });

    communityFeed.addEventListener('click', (e) => {
        const likeButton = e.target.closest('.like-btn');
        if (!likeButton) return;

        const postCard = likeButton.closest('.post-card');
        const postId = parseInt(postCard.dataset.postId);
        const post = communityPostsData.find(p => p.id === postId);

        if (post) {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            renderCommunityFeed(); // Re-render the whole feed to update the state
        }
    });

    // --- Initial Load ---
    showPage('home');
});