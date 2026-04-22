document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize AOS Animations
    AOS.init({ duration: 1000, easing: 'ease-out-cubic', once: true, offset: 50 });

    // Initialize TRUE 3D WebGL Background (Vanta.NET)
    VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x8b5cf6, // Vibrant purple
        backgroundColor: 0x020617,
        points: 16.00,
        maxDistance: 20.00,
        spacing: 18.00,
        showDots: true
    });

    // Core DOM Elements
    const coursesGrid = document.getElementById('courses-grid');
    const roleToggle = document.getElementById('role-toggle');
    const roleTextStudent = document.getElementById('role-text-student');
    const roleTextLecturer = document.getElementById('role-text-lecturer');
    const lecturerIcon = document.getElementById('lecturer-icon');
    const lecturerBadge = document.getElementById('lecturer-badge');
    const navGlobalXp = document.getElementById('nav-global-xp');
    const searchInput = document.getElementById('course-search');
    
    // Modal DOM Elements
    const modalMenu = document.getElementById('add-lesson-modal');
    const modalPanel = document.getElementById('modal-panel');
    const closeModalBtn = document.getElementById('close-modal');
    const courseIdInput = document.getElementById('target-course-id');
    const courseNameLabel = document.getElementById('modal-course-name');
    const addLessonForm = document.getElementById('add-lesson-form');
    const submitLessonBtn = document.getElementById('submit-lesson-btn');

    let coursesData = [];
    let isLecturer = localStorage.getItem('elearn_is_lecturer') === 'true';

    // Set Global XP
    let globalXp = parseInt(localStorage.getItem('elearn_global_xp') || '0');
    navGlobalXp.textContent = globalXp.toLocaleString() + ' XP';

    // Role Switching
    const uiToggle = document.getElementById('role-toggle');
    uiToggle.checked = isLecturer;
    updateRoleVisuals(isLecturer, false);

    uiToggle.addEventListener('change', (e) => {
        isLecturer = e.target.checked;
        localStorage.setItem('elearn_is_lecturer', isLecturer);
        updateRoleVisuals(isLecturer, true);
        renderCourses();
    });

    function updateRoleVisuals(lecturerMode, animate) {
        if (lecturerMode) {
            roleTextStudent.classList.replace('text-white', 'text-slate-500');
            roleTextLecturer.classList.replace('text-slate-500', 'text-white');
            lecturerIcon.classList.remove('opacity-0');
            lecturerBadge.classList.remove('hidden');
        } else {
            roleTextStudent.classList.replace('text-slate-500', 'text-white');
            roleTextLecturer.classList.replace('text-white', 'text-slate-500');
            lecturerIcon.classList.add('opacity-0');
            lecturerBadge.classList.add('hidden');
        }
    }

    // Fetch and Build Grid
    fetch('/courses')
        .then(res => res.json())
        .then(data => {
            coursesData = data;
            renderCourses();
        })
        .catch(err => {
            coursesGrid.innerHTML = `
                <div class="col-span-full p-10 bg-rose-500/10 border border-rose-500/30 rounded-3xl text-center shadow-[0_0_30px_rgba(225,29,72,0.2)]" data-tilt>
                    <i class="fa-solid fa-triangle-exclamation text-rose-400 text-5xl mb-4"></i>
                    <h3 class="text-2xl font-bold text-rose-300">Database Connection Severed</h3>
                    <p class="text-slate-400 mt-2">The Node server is inherently offline.</p>
                </div>
            `;
        });

    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        renderCourses(keyword);
    });

    function renderCourses(searchTerm = '') {
        coursesGrid.innerHTML = '';
        
        const filtered = coursesData.filter(c => 
            c.title.toLowerCase().includes(searchTerm) || 
            c.description.toLowerCase().includes(searchTerm)
        );
        
        filtered.forEach((course, index) => {
            const saved = localStorage.getItem('elearn_progress_' + course.id);
            let userProgress = {};
            let completedCount = 0;
            if(saved) {
                userProgress = JSON.parse(saved);
                completedCount = Object.values(userProgress).filter(p => p.completed).length;
            }
            const progressPercent = course.totalLessons > 0 ? Math.round((completedCount / course.totalLessons)*100) : 0;
            const isCompletedTotal = progressPercent === 100;

            const card = document.createElement('div');
            // Adding course-card and initializing VanillaTilt classes
            card.className = "course-card rounded-[2.5rem] overflow-hidden flex flex-col relative group h-full z-10 cursor-pointer";
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 150).toString());
            
            // Nested 3D Popout layers (card-pop-z1, card-pop-z2)
            let html = `
                <div class="h-60 relative overflow-hidden group-hover:shadow-lg">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent z-10 transition-opacity duration-1000 group-hover:opacity-60"></div>
                    <img src="${course.image}?auto=format&fit=crop&w=800&q=80" 
                         class="w-full h-full object-cover transition duration-[2s] group-hover:scale-[1.15] filter brightness-75 group-hover:brightness-100" 
                         alt="${course.title}">
                    
                    <div class="absolute top-6 left-6 z-20 flex gap-3">
                        <span class="px-4 py-2 bg-black/70 backdrop-blur-xl border border-white/20 rounded-full text-xs font-black text-white uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                            <i class="fa-solid fa-cube text-indigo-400 mr-1"></i> ${course.totalLessons} Nodes
                        </span>
                        ${isCompletedTotal && !isLecturer ? `
                            <span class="px-4 py-2 bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/50 rounded-full text-xs font-black text-yellow-300 uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                                <i class="fa-solid fa-crown"></i> Mastered
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="p-8 md:p-10 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-[#0f172a]/95 to-[#020617]/90 rounded-b-[2.5rem]">
                    <h3 class="text-3xl font-black text-white mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-500 drop-shadow-xl">${course.title}</h3>
                    <p class="text-slate-400 text-base mb-8 flex-1 leading-relaxed font-medium">${course.description}</p>
                    
                    ${!isLecturer ? `
                        <!-- Gamified Student Interface -->
                        <div class="mt-auto">
                            <div class="flex justify-between items-end mb-3">
                                <span class="text-xs font-black uppercase tracking-widest text-${progressPercent > 0 ? 'emerald' : 'slate'}-400">
                                    <i class="fa-solid fa-circle-nodes mr-1 text-xs"></i> Synced:
                                </span>
                                <span class="text-2xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">${progressPercent}%</span>
                            </div>
                            <div class="w-full h-4 bg-black/80 rounded-full overflow-hidden shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-white/10 mb-8 p-0.5">
                                <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative" style="width: ${progressPercent}%; transition: width 2s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
                            </div>
                            
                            <a href="course.html?id=${course.id}" class="block w-full py-5 relative group/btn overflow-hidden bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600 hover:to-purple-600 border border-indigo-500/30 rounded-2xl text-center font-black text-white transition-all duration-500 shadow-[0_10px_30px_rgba(99,102,241,0.2)] hover:shadow-[0_20px_50px_rgba(168,85,247,0.5)]">
                                <span class="relative z-10 flex items-center justify-center gap-3 text-lg">
                                    <i class="fa-solid fa-vr-cardboard"></i> Enter Simulation 
                                </span>
                            </a>
                        </div>
                    ` : `
                        <!-- Lecturer Interface -->
                        <div class="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                            <a href="course.html?id=${course.id}" class="block w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center font-bold text-slate-300 hover:text-white transition duration-300 shadow-sm hover:shadow-lg backdrop-blur-md">
                                <i class="fa-solid fa-cube mr-2"></i> Audit Dimension
                            </a>
                            <button onclick="openAddLessonModal(${course.id}, '${course.title.replace(/'/g, "\\'")}')" class="w-full py-5 relative overflow-hidden group/add bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-center font-black text-white transition duration-500 shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.5)] border-none hover:-translate-y-1">
                                <span class="relative z-10 text-lg"><i class="fa-solid fa-plus-minus mr-2"></i> Inject Module</span>
                                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover/add:translate-y-0 transition-transform duration-500"></div>
                            </button>
                        </div>
                    `}
                </div>
            `;
            card.innerHTML = html;
            coursesGrid.appendChild(card);
        });
        
        AOS.refresh();
    }

    // Modal 3D Transition Logic
    window.openAddLessonModal = (id, title) => {
        courseIdInput.value = id;
        courseNameLabel.textContent = title;
        
        modalMenu.classList.remove('hidden');
        void modalMenu.offsetWidth; // reflow
        
        modalMenu.classList.remove('opacity-0', 'pointer-events-none');
        // Un-rotate and scale up the modal specifically referencing the embedded classes
        modalPanel.classList.remove('scale-90', 'rotate-x-12');
        modalPanel.classList.add('scale-100', 'rotate-x-0');
    };

    function closeAddModal() {
        modalMenu.classList.add('opacity-0', 'pointer-events-none');
        modalPanel.classList.remove('scale-100', 'rotate-x-0');
        modalPanel.classList.add('scale-90', 'rotate-x-12');
        setTimeout(() => {
            modalMenu.classList.add('hidden');
            addLessonForm.reset();
        }, 700);
    }

    closeModalBtn.addEventListener('click', closeAddModal);
    modalMenu.addEventListener('click', (e) => { if (e.target === modalMenu) closeAddModal(); });

    addLessonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const cId = courseIdInput.value;
        const payload = {
            title: document.getElementById('lesson-title').value,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Force valid placeholder embed for test
            content: '3D Simulation Node Content Added.'
        };

        const originalBtnText = submitLessonBtn.innerHTML;
        submitLessonBtn.innerHTML = '<i class="fa-solid fa-atom fa-spin text-2xl"></i> Synchronizing Mesh...';
        submitLessonBtn.disabled = true;

        fetch('/courses/' + cId + '/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                submitLessonBtn.innerHTML = '<i class="fa-solid fa-circle-check text-2xl"></i> Successfully Synthesized!';
                
                const courseMatch = coursesData.find(c => c.id == cId);
                if(courseMatch) courseMatch.totalLessons += 1;
                
                setTimeout(() => {
                    closeAddModal();
                    renderCourses();
                    submitLessonBtn.innerHTML = originalBtnText;
                    submitLessonBtn.disabled = false;
                }, 1500);
            }
        });
    });
});
