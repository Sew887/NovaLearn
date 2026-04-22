document.addEventListener('DOMContentLoaded', () => {
    let courseData = null;
    let currentLessonIndex = 0;
    let userProgress = {}; 

    const DOM = {
        navTitle: document.getElementById('nav-course-title'),
        sidebarLessons: document.getElementById('sidebar-lessons'),
        mainPanel: document.getElementById('main-panel'),
        progressText: document.getElementById('progress-text'),
        progressBar: document.getElementById('progress-bar'),
        sidebarCount: document.getElementById('sidebar-count')
    };

    fetch('/courses/1')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            courseData = data;
            
            const saved = localStorage.getItem('elearn_progress_' + courseData.id);
            if (saved) {
                userProgress = JSON.parse(saved);
            } else {
                courseData.lessons.forEach(l => {
                    userProgress[l.id] = { completed: false, score: 0 };
                });
            }
            
            initCourse();
        })
        .catch(err => {
            DOM.mainPanel.innerHTML = `
                <div class="flex items-center justify-center min-h-[60vh] animate-fade-in">
                    <div class="glass-card p-10 rounded-3xl text-center max-w-md border-rose-500/30">
                        <h2 class="text-2xl font-bold mb-3 text-white">Connection Error</h2>
                        <p class="text-slate-300">Could not connect to the backend server. Make sure you run <code class="bg-black/30 px-2 py-1 rounded text-rose-300">node server.js</code>.</p>
                    </div>
                </div>
            `;
        });

    function initCourse() {
        DOM.navTitle.textContent = courseData.title;
        DOM.sidebarCount.textContent = `${courseData.lessons.length} Lessons`;
        
        // Ensure properties exist for older data saves
        courseData.lessons.forEach(l => {
            if (!userProgress[l.id]) {
                userProgress[l.id] = { completed: false, score: 0 };
            }
            if (userProgress[l.id].score === undefined) {
                userProgress[l.id].score = 0;
            }
        });

        saveProgress();
        updateProgressUI();
        
        let firstIncomplete = courseData.lessons.findIndex(l => !userProgress[l.id].completed);
        currentLessonIndex = firstIncomplete === -1 ? 0 : firstIncomplete;
        
        renderSidebar();
        renderLesson(currentLessonIndex);
    }
    
    function saveProgress() {
        localStorage.setItem('elearn_progress_' + courseData.id, JSON.stringify(userProgress));
    }
    
    function updateProgressUI() {
        if (!courseData) return;
        const total = courseData.lessons.length;
        const completed = courseData.lessons.filter(l => userProgress[l.id]?.completed).length;
        const percent = total > 0 ? (completed / total) * 100 : 0;
        
        DOM.progressText.textContent = `${completed}/${total}`;
        DOM.progressBar.style.width = `${percent}%`;
    }

    function renderSidebar() {
        DOM.sidebarLessons.innerHTML = '';
        
        courseData.lessons.forEach((lesson, index) => {
            const completed = userProgress[lesson.id].completed;
            const score = userProgress[lesson.id].score;
            const active = index === currentLessonIndex;
            
            const item = document.createElement('div');
            item.className = `lesson-item p-4 rounded-2xl border-l-[3px] border-transparent flex flex-col gap-2 group ${active ? 'active' : ''} relative overflow-hidden`;
            
            if (active) {
                item.innerHTML += '<div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent animate-pulse z-0"></div>';
            }
            
            let iconHtml = completed 
                ? `<div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0"><i class="fa-solid fa-check"></i></div>`
                : `<div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><i class="fa-solid fa-play text-sm ml-1"></i></div>`;

            item.innerHTML += `
                <div class="flex items-center gap-4 relative z-10">
                    ${iconHtml}
                    <div class="flex-1 min-w-0">
                        <div class="text-[10px] sm:text-xs text-indigo-300 font-bold uppercase tracking-widest flex items-center justify-between">
                            <span>Lesson ${index + 1}</span>
                            ${completed ? `<span class="text-emerald-400">Score: ${score}/10</span>` : ''}
                        </div>
                        <div class="text-sm sm:text-base font-semibold truncate text-slate-100 group-hover:text-white transition-colors">
                            ${lesson.title}
                        </div>
                    </div>
                </div>
            `;
            
            item.onclick = () => {
                currentLessonIndex = index;
                renderSidebar();
                renderLesson(currentLessonIndex);
            };
            
            DOM.sidebarLessons.appendChild(item);
        });
    }

    function renderLesson(index) {
        const lesson = courseData.lessons[index];
        const completed = userProgress[lesson.id].completed;
        const isLastLesson = index === courseData.lessons.length - 1;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        let html = `
            <div class="animate-fade-in space-y-8">
                
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <div class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                        <span class="text-indigo-200 text-sm font-semibold">
                            Module ${index + 1} <span class="text-white/20">|</span> ${courseData.lessons.length} Modules Total
                        </span>
                    </div>
                    
                    ${completed ? `
                        <div class="inline-flex items-center gap-3 px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                            <i class="fa-solid fa-medal text-lg"></i>
                            <span class="text-sm font-bold">Score: ${userProgress[lesson.id].score} / 10 Mastered</span>
                        </div>
                    ` : ''}
                </div>

                <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-50 to-indigo-200 tracking-tight leading-tight py-2">
                    ${lesson.title}
                </h1>

                <!-- Lesson Content: Video, PDF View, Text -->
                <div class="glass-card rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 p-2 md:p-4">
                    <div class="w-full aspect-video rounded-2xl overflow-hidden bg-black mb-6">
                        <iframe width="100%" height="100%" src="${lesson.videoUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    
                    <div class="px-4 pb-4">
                        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                            <h3 class="text-2xl font-bold text-white"><i class="fa-solid fa-file-alt text-indigo-400 mr-2"></i> Lesson Concept Info</h3>
                            <button class="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 hover:text-white px-4 py-2 rounded-xl transition duration-300 font-bold flex items-center gap-2 text-sm border border-indigo-500/50">
                                <i class="fa-solid fa-file-pdf"></i> View & Download PDF
                            </button>
                        </div>
                        <div class="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-300 font-medium">
                            <p>${lesson.content}</p>
                        </div>
                    </div>
                </div>

                <!-- 10 Questions Quiz Area -->
                <div class="relative mt-16 mb-8">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-indigo-500/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>
                    
                    <div id="quiz-container" class="glass-card p-6 md:p-10 rounded-[2rem] relative z-10 border-indigo-500/30 overflow-hidden">
                        <!-- Dynamic content injected here -->
                    </div>
                </div>

                <div id="next-lesson-container" class="mt-8 flex justify-end transition-all duration-500">
                    <!-- Nav button injected here -->
                </div>
            </div>
        `;
        
        DOM.mainPanel.innerHTML = html;
        
        if (completed) {
            renderQuizResults(lesson, index);
        } else {
            init10QQuiz(lesson, index);
        }
    }

    /* === 10 Question Quiz Engine === */
    function init10QQuiz(lesson, lessonIndex) {
        const container = document.getElementById('quiz-container');
        let currentQ = 0;
        let score = 0;
        let answersGiven = new Array(10).fill(null);

        function renderCurrentQuestion() {
            const q = lesson.quizzes[currentQ];
            const isLastQuestion = currentQ === lesson.quizzes.length - 1;
            
            container.innerHTML = `
                <div class="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white text-lg font-bold">
                            Q${currentQ + 1}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white">Knowledge Check</h3>
                            <p class="text-indigo-300 text-sm font-medium">Earn perfect score 10/10 to excel.</p>
                        </div>
                    </div>
                    <div class="text-slate-400 font-bold bg-white/5 py-1 px-3 rounded-lg border border-white/10">
                        ${currentQ + 1} / ${lesson.quizzes.length}
                    </div>
                </div>
                
                <div class="bg-indigo-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8 text-xl font-medium text-white shadow-inner">
                    ${q.question.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
                
                <div class="flex flex-col gap-4 mb-8" id="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option group w-full text-left px-6 py-4 rounded-xl border border-white/10 bg-white/5 font-medium text-slate-200 flex items-center gap-4 transition-all duration-300 hover:bg-white/10 hover:border-indigo-400/50" data-idx="${i}">
                            <div class="indicator w-6 h-6 rounded-full border-2 border-slate-500 flex items-center justify-center shrink-0"></div>
                            <span class="text-lg flex-1">${String(opt).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 relative">
                    <div id="quiz-feedback" class="w-full sm:w-auto font-bold opacity-0 transition-opacity"></div>
                    <button id="quiz-submit" class="glass-button w-full sm:w-auto ml-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-3">
                        Submit Answer <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            `;

            bindQuizEvents();
        }

        function bindQuizEvents() {
            const options = container.querySelectorAll('.quiz-option');
            const submitBtn = document.getElementById('quiz-submit');
            const feedbackEl = document.getElementById('quiz-feedback');
            
            let selectedIdx = null;

            options.forEach(opt => {
                opt.onclick = () => {
                    options.forEach(o => {
                        o.classList.remove('border-indigo-400', 'bg-indigo-500/20');
                        o.querySelector('.indicator').classList.remove('border-indigo-400', 'bg-indigo-500');
                        o.querySelector('.indicator').innerHTML = '';
                    });
                    
                    opt.classList.add('border-indigo-400', 'bg-indigo-500/20');
                    const ind = opt.querySelector('.indicator');
                    ind.classList.add('border-indigo-400', 'bg-indigo-500');
                    ind.innerHTML = '<div class="w-2 h-2 bg-white rounded-full"></div>';
                    
                    selectedIdx = parseInt(opt.dataset.idx);
                };
            });

            submitBtn.onclick = () => {
                if (selectedIdx === null) {
                    feedbackEl.innerHTML = '<span class="text-orange-400 bg-orange-500/20 px-4 py-2 rounded-lg border border-orange-500/30"><i class="fa-solid fa-triangle-exclamation"></i> Select an answer</span>';
                    feedbackEl.style.opacity = 1;
                    return;
                }

                const correctAns = lesson.quizzes[currentQ].answer;
                const isCorrect = selectedIdx === correctAns;
                
                if (isCorrect) score++;
                
                options.forEach(o => {
                    o.classList.add('pointer-events-none', 'opacity-60');
                    const idx = parseInt(o.dataset.idx);
                    if (idx === correctAns) {
                        o.classList.remove('opacity-60', 'border-indigo-400', 'bg-indigo-500/20');
                        o.classList.add('border-emerald-500', 'bg-emerald-500/20');
                        const ind = o.querySelector('.indicator');
                        ind.classList.add('bg-emerald-500', 'border-emerald-500');
                        ind.innerHTML = '<i class="fa-solid fa-check text-white text-xs"></i>';
                    } else if (idx === selectedIdx && !isCorrect) {
                        o.classList.remove('border-indigo-400', 'bg-indigo-500/20');
                        o.classList.add('border-rose-500', 'bg-rose-500/20', 'opacity-100');
                        const ind = o.querySelector('.indicator');
                        ind.classList.add('bg-rose-500', 'border-rose-500');
                        ind.innerHTML = '<i class="fa-solid fa-xmark text-white text-xs"></i>';
                    }
                });

                submitBtn.style.display = 'none';

                if (isCorrect) {
                    feedbackEl.innerHTML = '<span class="text-emerald-400 bg-emerald-500/20 px-4 py-2 rounded-lg border border-emerald-500/30"><i class="fa-solid fa-circle-check"></i> Correct!</span>';
                } else {
                    feedbackEl.innerHTML = '<span class="text-rose-400 bg-rose-500/20 px-4 py-2 rounded-lg border border-rose-500/30"><i class="fa-solid fa-circle-xmark"></i> Incorrect!</span>';
                }
                feedbackEl.style.opacity = 1;

                setTimeout(() => {
                    currentQ++;
                    if (currentQ < lesson.quizzes.length) {
                        renderCurrentQuestion();
                    } else {
                        finishQuiz();
                    }
                }, 1500);
            };
        }

        function finishQuiz() {
            userProgress[lesson.id].completed = true;
            userProgress[lesson.id].score = score;
            saveProgress();
            updateProgressUI();
            renderSidebar();
            renderQuizResults(lesson, lessonIndex);
        }

        renderCurrentQuestion();
    }

    function renderQuizResults(lesson, index) {
        const score = userProgress[lesson.id].score;
        const total = lesson.quizzes.length;
        const percentage = Math.round((score / total) * 100);
        
        let colorTheme = "emerald";
        let message = "Excellent work!";
        if(percentage < 50) {
            colorTheme = "orange";
            message = "Keep practicing!";
        }

        document.getElementById('quiz-container').innerHTML = `
            <div class="text-center py-8">
                <div class="w-32 h-32 mx-auto rounded-full border-8 border-${colorTheme}-500/30 flex items-center justify-center mb-6 relative">
                    <div class="absolute inset-0 border-8 border-${colorTheme}-500 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent border-l-transparent"></div>
                    <span class="text-5xl font-black text-white">${score}</span>
                    <span class="text-slate-400 text-xl absolute bottom-4">/${total}</span>
                </div>
                <h3 class="text-3xl font-bold text-${colorTheme}-400 mb-2">${message}</h3>
                <p class="text-slate-300 text-lg">You scored ${percentage}% on this knowledge check.</p>
                <button onclick="localStorage.removeItem('elearn_progress_${courseData.id}'); location.reload();" class="mt-6 text-indigo-400 hover:text-indigo-300 underline font-semibold transition">Retake All Lesson Quizzes (Reset Total Progress)</button>
            </div>
        `;

        const isLast = index === courseData.lessons.length - 1;
        document.getElementById('next-lesson-container').innerHTML = getNextButtonHtml(index, isLast);
        document.getElementById('next-lesson-btn').onclick = () => handleNextLesson(index);
    }

    function getNextButtonHtml(index, isLastLesson) {
        if (isLastLesson) {
            return `
                <button id="next-lesson-btn" class="glass-button w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 text-xl group animate-fade-in bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-none">
                    Claim Certificate <i class="fa-solid fa-award text-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500"></i>
                </button>
            `;
        } else {
            return `
                <button id="next-lesson-btn" class="glass-button w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 text-lg group animate-fade-in">
                    Proceed to Next Lesson <i class="fa-solid fa-arrow-right-long group-hover:translate-x-2 transition-transform duration-300"></i>
                </button>
            `;
        }
    }

    function handleNextLesson(currentIndex) {
        if (currentIndex < courseData.lessons.length - 1) {
            currentLessonIndex = currentIndex + 1;
            renderSidebar();
            renderLesson(currentLessonIndex);
        } else {
            DOM.mainPanel.innerHTML = `
                <div class="flex items-center justify-center min-h-full animate-fade-in pb-20">
                    <div class="glass-card p-10 md:p-14 rounded-[3rem] text-center max-w-2xl w-full relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-emerald-500/30">
                        <div class="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px]"></div>
                        <div class="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]"></div>
                        
                        <div class="relative z-10 flex flex-col items-center">
                            <div class="w-32 h-32 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.6)] border-4 border-emerald-200/20 transform hover:scale-110 transition-transform duration-500">
                                <i class="fa-solid fa-award text-6xl text-white drop-shadow-lg"></i>
                            </div>
                            
                            <h2 class="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-teal-300">
                                Masterclass Completed!
                            </h2>
                            <p class="text-slate-300 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
                                Complete overall performance tracked across all modules. Amazing job!
                            </p>
                            
                            <button onclick="localStorage.removeItem('elearn_progress_${courseData.id}'); location.reload();" class="glass-button px-8 py-4 rounded-xl font-bold text-white shadow-lg mx-auto flex items-center gap-2">
                                <i class="fa-solid fa-rotate-right"></i> Restart Everything
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
});
