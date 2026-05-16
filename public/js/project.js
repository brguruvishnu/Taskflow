document.addEventListener('DOMContentLoaded', async () => {
    // Get Project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        window.location.href = '/dashboard.html';
        return;
    }

    // State
    let project = null;
    let tasks = [];
    let members = [];
    let currentRole = 'MEMBER';
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // UI Elements
    document.getElementById('user-name').textContent = currentUser?.name;
    const btnNewTask = document.getElementById('btn-new-task');
    const adminControls = document.getElementById('admin-controls');

    // Modals
    window.closeModal = (id) => document.getElementById(id).classList.remove('active');

    document.getElementById('btn-members').addEventListener('click', () => {
        document.getElementById('members-modal').classList.add('active');
        renderMembersList();
    });

    // Initialization
    await loadProjectData();

    async function loadProjectData() {
        try {
            [project, tasks, members] = await Promise.all([
                api.getProject(projectId),
                api.getTasks(projectId),
                api.getMembers(projectId)
            ]);

            // Determine current user's role
            const myMemberRec = members.find(m => m.userId === currentUser.id);
            if (project.ownerId === currentUser.id || myMemberRec?.role === 'ADMIN') {
                currentRole = 'ADMIN';
            }

            renderHeader();
            renderBoard();
            setupAdminFeatures();

        } catch (error) {
            alert('Failed to load project: ' + error.message);
            window.location.href = '/dashboard.html';
        }
    }

    function renderHeader() {
        document.getElementById('project-title').textContent = project.name;
        document.getElementById('project-desc').textContent = project.description || '';
    }

    function setupAdminFeatures() {
        if (currentRole === 'ADMIN') {
            btnNewTask.style.display = 'block';
            document.getElementById('add-member-section').style.display = 'block';
            
            btnNewTask.addEventListener('click', () => {
                populateAssigneeDropdown('task-assignee');
                document.getElementById('task-modal').classList.add('active');
            });
        }
    }

    function populateAssigneeDropdown(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Unassigned</option>' + 
            members.map(m => `<option value="${m.user.id}">${m.user.name}</option>`).join('');
    }

    // --- BOARD RENDERING ---
    function renderBoard() {
        const cols = {
            'TODO': document.getElementById('col-todo'),
            'IN_PROGRESS': document.getElementById('col-inprogress'),
            'DONE': document.getElementById('col-done')
        };

        // Clear columns
        Object.values(cols).forEach(col => col.innerHTML = '');

        // Counters
        const counts = { 'TODO': 0, 'IN_PROGRESS': 0, 'DONE': 0 };

        tasks.forEach(task => {
            counts[task.status]++;
            const col = cols[task.status];
            
            const card = document.createElement('div');
            card.className = 'task-card';
            card.onclick = () => openTaskDetail(task);
            
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
            const assignee = task.assignee ? task.assignee.name : 'Unassigned';
            
            // Check if overdue
            const isOverdue = task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date();
            const dateColor = isOverdue ? 'color: var(--danger-color)' : '';

            card.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>👤 ${assignee}</span>
                    <span style="${dateColor}">${dueDate}</span>
                </div>
            `;
            col.appendChild(card);
        });

        document.getElementById('count-todo').textContent = counts['TODO'];
        document.getElementById('count-inprogress').textContent = counts['IN_PROGRESS'];
        document.getElementById('count-done').textContent = counts['DONE'];
    }

    // --- TASK CREATION ---
    document.getElementById('create-task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            assigneeId: document.getElementById('task-assignee').value || null,
            dueDate: document.getElementById('task-due').value || null
        };

        try {
            await api.createTask(projectId, data);
            closeModal('task-modal');
            e.target.reset();
            loadProjectData(); // Refresh board
        } catch (error) {
            alert(error.message);
        }
    });

    // --- TASK DETAIL ---
    let currentTask = null;
    function openTaskDetail(task) {
        currentTask = task;
        document.getElementById('detail-title').textContent = task.title;
        document.getElementById('detail-desc').textContent = task.description || 'No description provided.';
        document.getElementById('detail-status').value = task.status;

        // Reset display
        adminControls.style.display = 'none';
        const saveBtn = document.getElementById('btn-save-task');
        saveBtn.style.display = 'block';

        // Permissions logic
        const isAssignee = task.assigneeId === currentUser.id;
        
        if (currentRole === 'ADMIN') {
            adminControls.style.display = 'block';
            populateAssigneeDropdown('detail-assignee');
            document.getElementById('detail-assignee').value = task.assigneeId || '';
        } else if (!isAssignee) {
            // Member but not assigned: can view only
            saveBtn.style.display = 'none';
            document.getElementById('detail-status').disabled = true;
        } else {
            // Member and assigned: can update status
            document.getElementById('detail-status').disabled = false;
        }

        document.getElementById('task-detail-modal').classList.add('active');
    }

    document.getElementById('btn-save-task').addEventListener('click', async () => {
        const updateData = {
            status: document.getElementById('detail-status').value
        };

        if (currentRole === 'ADMIN') {
            updateData.assigneeId = document.getElementById('detail-assignee').value || null;
        }

        try {
            await api.updateTask(projectId, currentTask.id, updateData);
            closeModal('task-detail-modal');
            loadProjectData();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('btn-delete-task').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        try {
            await api.deleteTask(projectId, currentTask.id);
            closeModal('task-detail-modal');
            loadProjectData();
        } catch (error) {
            alert(error.message);
        }
    });

    // --- MEMBERS MANAGEMENT ---
    function renderMembersList() {
        const list = document.getElementById('members-list');
        list.innerHTML = members.map(m => {
            const isOwner = m.user.id === project.ownerId;
            const roleBadge = m.role === 'ADMIN' ? 'badge-admin' : 'badge-member';
            const displayRole = isOwner ? 'OWNER' : m.role;

            let actions = '';
            if (currentRole === 'ADMIN' && !isOwner) {
                const toggleRole = m.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
                actions = `
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="updateMemberRole('${m.user.id}', '${toggleRole}')" class="btn btn-outline btn-sm">Make ${toggleRole}</button>
                        <button onclick="removeMember('${m.user.id}')" class="btn btn-danger btn-sm">Remove</button>
                    </div>
                `;
            }

            return `
                <div class="item-card glass-panel" style="margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-weight: 500;">${m.user.name} <span class="badge ${roleBadge}" style="margin-left: 0.5rem;">${displayRole}</span></div>
                        <div class="text-sm text-muted">${m.user.email}</div>
                    </div>
                    ${actions}
                </div>
            `;
        }).join('');
    }

    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('member-email').value;

        try {
            await api.addMember(projectId, email);
            document.getElementById('member-email').value = '';
            // Refresh members
            members = await api.getMembers(projectId);
            renderMembersList();
            loadProjectData(); // Refresh board (assignee lists)
        } catch (error) {
            alert(error.message);
        }
    });

    window.updateMemberRole = async (userId, newRole) => {
        try {
            // Note: need to hit a PATCH endpoint, assuming api.js has it or we can add it. 
            // Oh, I missed adding updateMemberRole to api.js. Let's fetch directly.
            const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
                method: 'PATCH',
                headers: api.getHeaders(),
                body: JSON.stringify({ role: newRole })
            });
            await api.handleResponse(res);
            members = await api.getMembers(projectId);
            renderMembersList();
        } catch (error) {
            alert(error.message);
        }
    };

    window.removeMember = async (userId) => {
        if (!confirm('Remove this member?')) return;
        try {
            await api.removeMember(projectId, userId);
            members = await api.getMembers(projectId);
            renderMembersList();
            loadProjectData(); // Refresh board to clear assignees if needed
        } catch (error) {
            alert(error.message);
        }
    };
});
