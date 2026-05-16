document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const userNameEl = document.getElementById('user-name');
    const projectsList = document.getElementById('projects-list');
    const overdueList = document.getElementById('overdue-list');
    
    // Set User Name & Role restrictions
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        userNameEl.textContent = user.name;
        if (user.globalRole !== 'ADMIN') {
            document.getElementById('btn-new-project').style.display = 'none';
        }
    }

    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });

    // Modal Handlers
    document.getElementById('btn-new-project').addEventListener('click', () => {
        document.getElementById('project-modal').classList.add('active');
    });

    window.closeModal = (id) => {
        document.getElementById(id).classList.remove('active');
    };

    // Create Project
    document.getElementById('create-project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('project-name').value;
        const description = document.getElementById('project-desc').value;

        try {
            await api.createProject({ name, description });
            closeModal('project-modal');
            e.target.reset();
            loadDashboard(); // Refresh
        } catch (error) {
            alert(error.message);
        }
    });

    // Initial Load
    loadDashboard();

    async function loadDashboard() {
        try {
            // Fetch Dashboard Stats & Projects in parallel
            const [dashboardData, projectsData] = await Promise.all([
                api.getDashboard(),
                api.getProjects()
            ]);

            renderStats(dashboardData.stats);
            renderOverdueTasks(dashboardData.overdueTasks);
            renderProjects(projectsData);

        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    function renderStats(stats) {
        document.getElementById('stat-projects').textContent = stats.totalProjects;
        document.getElementById('stat-todo').textContent = stats.todoTasks;
        document.getElementById('stat-inprogress').textContent = stats.inProgressTasks;
        document.getElementById('stat-overdue').textContent = stats.overdueCount;
    }

    function renderProjects(projects) {
        if (projects.length === 0) {
            projectsList.innerHTML = `<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--text-secondary)">No projects found. Create one to get started!</div>`;
            return;
        }

        projectsList.innerHTML = projects.map(p => {
            const role = p.members[0]?.role;
            const badgeClass = role === 'ADMIN' ? 'badge-admin' : 'badge-member';
            
            return `
            <a href="/project.html?id=${p.id}" class="item-card glass-panel" style="display: block; text-decoration: none; color: inherit;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin-bottom: 0.5rem; color: var(--text-primary)">${p.name}</h3>
                        <p class="text-sm text-muted">${p.description || 'No description'}</p>
                    </div>
                    <span class="badge ${badgeClass}">${role}</span>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 1rem; font-size: 0.875rem; color: var(--text-secondary)">
                    <span>✓ ${p._count.tasks} Tasks</span>
                    <span>👥 ${p._count.members} Members</span>
                </div>
            </a>
        `}).join('');
    }

    function renderOverdueTasks(tasks) {
        if (tasks.length === 0) {
            overdueList.innerHTML = `<p class="text-muted">No overdue tasks. Great job!</p>`;
            return;
        }

        overdueList.innerHTML = tasks.map(t => `
            <div class="glass-panel" style="padding: 1rem; margin-bottom: 0.5rem; border-left: 3px solid var(--danger-color)">
                <div style="font-weight: 500">${t.title}</div>
                <div class="text-sm text-muted" style="margin-top: 0.25rem">
                    Due: ${new Date(t.dueDate).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }
});
