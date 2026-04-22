document.addEventListener('DOMContentLoaded', () => {
    
    // Init AOS
    AOS.init({ duration: 1200, easing: 'ease-out-cubic', once: true });

    let courseData = null;
    let currentLessonIndex = 0;
    let userProgress = {}; 
    let globalXp = parseInt(localStorage.getItem('elearn_global_xp') || '0');

    const DOM = {
        navTitle: document.getElementById('nav-course-title'),
        sidebarLessons: document.getElementById('sidebar-lessons'),
        mainPanel: document.getElementById('main-panel'),
        progressText: document.getElementById('progress-text'),
        progressBar: document.getElementById('progress-bar'),
        sidebarCount: document.getElementById('sidebar-count'),
        navXpText: document.getElementById('nav-global-xp')
    };

    DOM.navXpText.textContent = globalXp.toLocaleString();

    const courseId = new URLSearchParams(window.location.search).get('id') || 1;
    
    fetch('/courses/' + courseId)
        .then(res => res.json())
        .then(data => {
            courseData = data;
            const saved = localStorage.getItem('elearn_progress_' + courseData.id);
            if (saved) userProgress = JSON.parse(saved);
            else {
                courseData.lessons.forEach(l => { userProgress[l.id] = { completed: false, score: 0 }; });
            }
            initCourse();
        })
        .catch(err => {
            DOM.mainPanel.innerHTML = `
                <div class="flex items-center justify-center min-h-[60vh]">
                    <h2 class="text-4xl text-rose-500 font-black">Connection Refused.</h2>
                </div>
            `;
        });

    function initCourse() {
        DOM.navTitle.textContent = courseData.title;
        DOM.sidebarCount.textContent = `${courseData.lessons.length} Modules`;
        
        courseData.lessons.forEach(l => {
            if (!userProgress[l.id]) userProgress[l.id] = { completed: false, score: 0 };
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
        localStorage.setItem('elearn_global_xp', globalXp.toString());
        DOM.navXpText.textContent = globalXp.toLocaleString();
    }
    
    function updateProgressUI() {
        if (!courseData) return;
        const total = courseData.lessons.length;
        const completed = courseData.lessons.filter(l => userProgress[l.id]?.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
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
            item.className = `lesson-item p-4 rounded-xl border border-white/5 flex flex-col gap-2 group cursor-pointer transition-all duration-300 hover:bg-white/5 ${active ? 'active shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-indigo-500/40 bg-[#0f172a]' : 'bg-black/30'}`;
            item.setAttribute('data-aos', 'fade-right');
            item.setAttribute('data-aos-delay', (index * 150).toString());
            
            let iconHtml = completed 
                ? `<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)] text-white"><i class="fa-solid fa-check text-lg"></i></div>`
                : `<div class="w-10 h-10 rounded-lg bg-white/5 border border-white/20 text-indigo-300 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition"><i class="fa-solid fa-play ml-0.5 text-sm"></i></div>`;

            item.innerHTML = `
                <div class="flex items-center gap-3 relative z-10">
                    ${iconHtml}
                    <div class="flex-1 min-w-0">
                        <div class="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center justify-between mb-1">
                            <span>Sector ${index + 1}</span>
                            ${completed ? `<span class="text-emerald-400 font-bold bg-emerald-500/20 px-2 rounded shadow-sm">${score} XP Data</span>` : ''}
                        </div>
                        <div class="text-sm font-bold truncate text-slate-200 group-hover:text-indigo-300 transition-colors">
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
            <div class="space-y-12 overflow-hidden pt-6 relative">
                
                <h1 class="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-pink-300 tracking-tighter leading-tight py-4 drop-shadow-2xl" data-aos="fade-up" data-aos-delay="200">
                    ${lesson.title}
                </h1>

                <!-- Lesson Content Base Styles -->
                <div class="glass-card rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 md:p-8" data-aos="fade-up" data-aos-delay="400">
                    
                    <div class="w-full aspect-video rounded-[2rem] overflow-hidden bg-black mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
                        <iframe width="100%" height="100%" src="${lesson.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="relative z-0 filter brightness-95"></iframe>
                    </div>
                    
                    <div class="px-6 pb-6 relative z-10">
                        <div class="flex items-center justify-between border-b border-white/10 pb-8 mb-10 flex-wrap gap-4">
                            <h3 class="text-4xl font-black text-white tracking-tight"><i class="fa-solid fa-cube text-indigo-400 mr-4"></i> Core Construct Info</h3>
                            <button id="download-pdf-btn" class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full transition-all duration-300 font-extrabold flex items-center gap-3 text-sm border-none shadow-lg transform hover:-translate-y-1">
                                <i class="fa-solid fa-file-pdf text-xl"></i> Extract Neural PDF
                            </button>
                        </div>
                        <div class="prose prose-invert prose-xl max-w-none prose-p:leading-relaxed prose-p:text-slate-300 font-semibold drop-shadow-md">
                            <p>${lesson.content}</p>
                        </div>
                    </div>
                </div>

                <!-- 10 Questions Quiz Area -->
                <div class="relative mt-24 mb-16" data-aos="zoom-in-up" data-aos-offset="150">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-pink-600/10 blur-[150px] rounded-[50%] z-0 pointer-events-none mix-blend-screen"></div>
                    
                    <div id="quiz-container" class="glass-card p-10 md:p-16 rounded-[4rem] relative z-10 border-pink-500/30">
                        <!-- Dynamic content injected here -->
                    </div>
                </div>

                <div id="next-lesson-container" class="mt-8 flex justify-end" data-aos="fade-left"></div>
            </div>
        `;
        
        DOM.mainPanel.innerHTML = html;
        AOS.refreshHard();
        
        // Setup PDF Hook
        const pdfBtn = document.getElementById('download-pdf-btn');
        if (pdfBtn) {
            pdfBtn.onclick = () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.text("NovaLearn module details: " + lesson.title, 20, 20);
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(14);
                
                const splitText = doc.splitTextToSize(lesson.content, 170);
                doc.text(splitText, 20, 40);
                
                doc.save(`${lesson.title.replace(/ /g, '_')}_Notes.pdf`);
            };
        }
        
        if (completed) renderQuizResults(lesson, index);
        else init10QQuiz(lesson, index);
    }

    function init10QQuiz(lesson, lessonIndex) {
        const container = document.getElementById('quiz-container');
        let currentQ = 0;
        let score = 0;

        function renderCurrentQuestion() {
            const q = lesson.quizzes[currentQ];
            
            let htmlStr = `
                <div class="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-indigo-500/20 pb-8 gap-6">
                    <div class="flex items-center gap-6">
                        <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center shadow-lg text-white text-3xl font-black border-2 border-white/20">
                            Q${currentQ + 1}
                        </div>
                        <div>
                            <h3 class="text-3xl font-black text-white tracking-tight">Access Protocol</h3>
                            <p class="text-pink-300 font-bold mt-1 uppercase tracking-widest text-xs md:text-sm"><i class="fa-solid fa-unlock-keyhole mr-1"></i> Input requested sequence</p>
                        </div>
                    </div>
                    <div class="text-white font-black bg-[#020617]/80 py-3 px-6 rounded-2xl border-2 border-indigo-500/30 text-xl tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-database text-indigo-400 text-lg"></i> ${currentQ + 1}<span class="text-slate-600">/</span>${lesson.quizzes.length}
                    </div>
                </div>
                
                <div class="bg-[#020617]/70 border-b-4 border-pink-500 rounded-3xl p-8 md:p-10 mb-12 text-2xl md:text-3xl font-black text-white shadow-lg leading-snug">
                    ${q.question}
                </div>
                
                <div class="flex flex-col gap-4 mb-10" id="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option group w-full text-left px-8 py-5 rounded-[1.5rem] text-slate-200 flex items-center gap-5 hover:bg-white/10" data-idx="${i}">
                            <div class="indicator w-8 h-8 rounded-full border-[4px] border-slate-600 shadow-inner flex items-center justify-center shrink-0 transition-colors"></div>
                            <span class="text-xl font-bold flex-1 drop-shadow-md">${String(opt).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 relative">
                    <div id="quiz-feedback" class="w-full sm:w-auto font-black text-xl opacity-0 transition-all duration-500 transform translate-y-4"></div>
                    <button id="quiz-submit" class="glass-button w-full sm:w-auto ml-auto px-10 py-5 rounded-[2rem] font-black text-white shadow-lg flex items-center justify-center gap-3 text-lg opacity-50 cursor-not-allowed pointer-events-none transition-all border-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105">
                        Submit Override <i class="fa-brands fa-space-awesome text-xl animate-bounce"></i>
                    </button>
                </div>
            `;
            container.innerHTML = htmlStr;
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
                    ind.innerHTML = '<div class="w-4 h-4 bg-white rounded-full shadow-lg"></div>';
                    
                    selectedIdx = parseInt(opt.dataset.idx);
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                };
            });

            submitBtn.onclick = () => {
                const correctAns = lesson.quizzes[currentQ].answer;
                const isCorrect = selectedIdx === correctAns;
                
                if (isCorrect) {
                    score++;
                    globalXp += 50; 
                    saveProgress();
                }
                
                options.forEach(o => {
                    o.classList.add('pointer-events-none');
                    const idx = parseInt(o.dataset.idx);
                    if (idx === correctAns) {
                        o.classList.replace('border-indigo-400', 'border-emerald-500');
                        o.classList.replace('bg-indigo-500/20', 'bg-emerald-500/20');
                        if (!o.classList.contains('bg-emerald-500/20')) { o.classList.add('border-emerald-500', 'bg-emerald-500/20'); }
                        
                        const ind = o.querySelector('.indicator');
                        ind.classList.replace('border-slate-600', 'border-emerald-500');
                        ind.classList.replace('border-indigo-400', 'border-emerald-500');
                        ind.classList.add('bg-emerald-500');
                        ind.innerHTML = '<i class="fa-solid fa-check text-white font-black text-xl"></i>';
                    } else if (idx === selectedIdx && !isCorrect) {
                        o.classList.replace('border-indigo-400', 'border-rose-500');
                        o.classList.replace('bg-indigo-500/20', 'bg-rose-500/30');
                        const ind = o.querySelector('.indicator');
                        ind.classList.replace('border-slate-600', 'border-rose-500');
                        ind.classList.replace('border-indigo-400', 'border-rose-500');
                        ind.classList.add('bg-rose-500');
                        ind.innerHTML = '<i class="fa-solid fa-xmark text-white font-black text-xl"></i>';
                    } else {
                        o.classList.add('opacity-40');
                    }
                });

                submitBtn.style.display = 'none';

                if (isCorrect) {
                    feedbackEl.innerHTML = '<span class="text-emerald-400 bg-emerald-500/10 px-8 py-4 rounded-2xl border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.4)]"><i class="fa-solid fa-unlock-keyhole mr-3"></i> Firewall Bypassed! <span class="text-white">+50 XP</span></span>';
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8, x: 0.1 }, colors: ['#10b981', '#ffffff'] });
                } else {
                    feedbackEl.innerHTML = '<span class="text-rose-400 bg-rose-500/10 px-8 py-4 rounded-2xl border-2 border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.4)]"><i class="fa-solid fa-radiation mr-3"></i> Breach Detected. Sequence Failed.</span>';
                }
                
                feedbackEl.classList.remove('opacity-0', 'translate-y-4');

                setTimeout(() => {
                    currentQ++;
                    if (currentQ < lesson.quizzes.length) renderCurrentQuestion();
                    else finishQuiz();
                }, 2500);
            };
        }

        function finishQuiz() {
            userProgress[lesson.id].completed = true;
            userProgress[lesson.id].score = score;
            if(score === lesson.quizzes.length) globalXp += 200; 
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
        let message = "Sector Operational!";
        let icon = "fa-cubes";
        
        if(percentage < 50) { colorTheme = "orange"; message = "System Error"; icon = "fa-bug"; } 
        else if(percentage === 100) { confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 }, zIndex: 9999, colors: ['#10b981', '#3b82f6', '#8b5cf6'] }); }

        document.getElementById('quiz-container').innerHTML = `
            <div class="text-center py-16" data-aos="zoom-in" data-aos-duration="1000">
                <i class="fa-solid ${icon} text-7xl text-${colorTheme}-400 mb-10 drop-shadow-[0_0_40px_rgba(var(--tw-colors-${colorTheme}-500),_0.7)] animate-bounce"></i>
                
                <div class="w-64 h-64 mx-auto rounded-full border-[16px] border-${colorTheme}-500/10 flex flex-col items-center justify-center mb-10 relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] bg-black/40">
                    <div class="absolute inset-[-16px] border-[16px] border-${colorTheme}-400 rounded-full animate-[spin_5s_linear_infinite] border-t-transparent border-l-transparent drop-shadow-[0_0_20px_rgba(var(--tw-colors-${colorTheme}-400),_0.8)]"></div>
                    <span class="text-8xl font-black text-white drop-shadow-xl">${score}</span>
                    <span class="text-${colorTheme}-200 text-3xl font-black mt-2">/ ${total}</span>
                </div>
                
                <h3 class="text-5xl font-black text-${colorTheme}-300 mb-6 tracking-tight drop-shadow-md">${message}</h3>
                <p class="text-slate-300 text-2xl font-bold max-w-lg mx-auto">Sector resolved at <span class="text-white font-black border-b-4 border-${colorTheme}-500 pb-1 px-2">${percentage}%</span> sync capacity.</p>
                
                <button onclick="
                    let p = JSON.parse(localStorage.getItem('elearn_progress_${courseData.id}'));
                    p[${lesson.id}].completed = false; p[${lesson.id}].score = 0;
                    localStorage.setItem('elearn_progress_${courseData.id}', JSON.stringify(p)); location.reload();" 
                    class="mt-14 px-10 py-5 rounded-[2rem] border-2 border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-indigo-500/30 hover:border-indigo-500 font-extrabold text-xl transition-all flex items-center gap-4 mx-auto shadow-[0_10px_30px_rgba(99,102,241,0.2)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.5)] hover:-translate-y-2">
                    <i class="fa-solid fa-code-commit text-2xl"></i> Rewrite History Matrix
                </button>
            </div>
        `;

        document.getElementById('next-lesson-container').innerHTML = getNextButtonHtml(index, index === courseData.lessons.length - 1);
        const nextBtn = document.getElementById('next-lesson-btn');
        if (nextBtn) nextBtn.onclick = () => handleNextLesson(index);
    }

    function getNextButtonHtml(index, isLastLesson) {
        if (isLastLesson) {
            return `<button id="next-lesson-btn" class="glass-button px-14 py-8 rounded-[3rem] font-black text-white shadow-xl flex items-center gap-5 text-2xl border-none bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all"><i class="fa-solid fa-cube text-3xl animate-spin"></i> Initialize Master Code</button>`;
        } else {
            return `<button id="next-lesson-btn" class="glass-button px-12 py-6 rounded-[2.5rem] font-black text-white shadow-lg flex items-center gap-4 text-xl transition-all hover:-translate-y-1 hover:shadow-xl">Execute Next Node <i class="fa-solid fa-fingerprint text-2xl ml-2 drop-shadow-md"></i></button>`;
        }
    }

    function handleNextLesson(currentIndex) {
        if (currentIndex < courseData.lessons.length - 1) {
            currentLessonIndex = currentIndex + 1;
            renderSidebar();
            renderLesson(currentLessonIndex);
        } else {
            const end = Date.now() + 8000;
            (function frame() {
              confetti({ particleCount: 7, angle: 60, spread: 80, origin: { x: 0 }, colors: ['#6366f1', '#10b981', '#ec4899', '#ffffff'] });
              confetti({ particleCount: 7, angle: 120, spread: 80, origin: { x: 1 }, colors: ['#a855f7', '#fbbf24', '#0ea5e9', '#ffffff'] });
              if (Date.now() < end) requestAnimationFrame(frame);
            }());

            DOM.mainPanel.innerHTML = `
                <div class="flex items-center justify-center min-h-[85vh] pb-20" data-aos="zoom-out" data-aos-duration="2000">
                    <div class="bg-black/40 backdrop-blur-[40px] p-16 md:p-20 rounded-[5rem] text-center max-w-4xl w-full relative overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.9)] border-2 border-indigo-500/50 group">
                        
                        <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div class="absolute -top-60 -left-60 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
                        <div class="absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-pink-600/30 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
                        
                        <div class="relative z-10 flex flex-col items-center">
                            <i class="fa-solid fa-infinity text-9xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_50px_rgba(168,85,247,0.8)] mb-10 transform hover:scale-110 transition-transform duration-1000"></i>
                            
                            <h2 class="text-6xl md:text-[6rem] font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-pink-200 tracking-tighter leading-none drop-shadow-2xl">
                                System Mastered.
                            </h2>
                            <p class="text-indigo-200 text-2xl md:text-3xl mb-8 font-black uppercase tracking-widest border-b-2 border-indigo-500/30 pb-4">
                                ${courseData.title} <span class="text-emerald-400 ml-4"><i class="fa-solid fa-check-double"></i> 100% SECURED</span>
                            </p>
                            
                            <div class="bg-black/60 rounded-[3rem] px-12 py-8 border border-white/10 shadow-inner mb-16">
                                <p class="text-white text-3xl font-black flex items-center gap-4">
                                    <i class="fa-solid fa-bolt text-yellow-400 text-5xl animate-bounce drop-shadow-[0_0_20px_#facc15]"></i> 
                                    Total Global XP: <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 text-6xl">${globalXp.toLocaleString()}</span>
                                </p>
                            </div>
                            
                            <div class="flex gap-8 justify-center w-full">
                                <a href="index.html" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none py-8 rounded-[2.5rem] font-black text-white shadow-lg flex items-center justify-center gap-4 text-2xl transition-all hover:scale-105">
                                    <i class="fa-solid fa-network-wired text-3xl"></i> Return to Main Grid
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
});
