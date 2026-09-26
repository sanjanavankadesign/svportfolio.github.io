/**
 * Connect AI Talent Pipeline SaaS Application Logic
 * Supports full 15-screen workflow navigation:
 * - Dashboard, Brief, AI JD Extraction, Batch Ingestion, Resolution Center
 * - All Matches, Sourced Candidates Grid, Shortlisted Candidates
 * - Contacted (Engagement Overview), Responded (Triage), Screened (Scorecards)
 * - Candidate Detail & Direct Messaging View with AI suggest reply & Quick Actions
 */

// Google Material Design Icons Helper
window.lucide = window.lucide || {
    createIcons: function() {
        const LUCIDE_TO_MATERIAL = {
            'arrow-up-right': 'north_east', 'arrow-right': 'arrow_forward', 'arrow-left': 'arrow_back',
            'arrow-down': 'arrow_downward', 'lock': 'lock', 'sparkles': 'auto_awesome',
            'moon': 'dark_mode', 'sun': 'light_mode', 'menu': 'menu', 'x': 'close',
            'plus': 'add', 'message-square': 'chat_bubble', 'send': 'send', 'copy': 'content_copy',
            'users': 'group', 'check': 'check', 'alert-triangle': 'warning', 'chevron-left': 'chevron_left',
            'chevron-right': 'chevron_right', 'file-text': 'description', 'help-circle': 'help',
            'search': 'search', 'calendar': 'calendar_today', 'edit-3': 'edit', 'phone-call': 'call',
            'mail-open': 'mark_email_read', 'user-check': 'how_to_reg', 'ghost': 'sentiment_dissatisfied',
            'shield-alert': 'gpp_maybe', 'git-branch': 'fork_right', 'pie-chart': 'pie_chart',
            'heart': 'favorite', 'compass': 'explore', 'check-circle-2': 'check_circle',
            'network': 'hub', 'book-open': 'menu_book', 'image': 'image', 'layout': 'dashboard',
            'layout-grid': 'grid_view', 'bar-chart-2': 'bar_chart', 'settings': 'settings',
            'briefcase': 'work', 'target': 'track_changes', 'clock': 'schedule',
            'paperclip': 'attach_file', 'mic': 'mic', 'map-pin': 'location_on', 'bot': 'smart_toy',
            'filter': 'filter_alt'
        };
        document.querySelectorAll('[data-lucide]').forEach(el => {
            const iconName = el.getAttribute('data-lucide');
            const matName = LUCIDE_TO_MATERIAL[iconName] || iconName.replace(/-/g, '_');
            const span = document.createElement('span');
            span.className = 'material-symbols-outlined ' + (el.className || '');
            span.textContent = matName;
            el.replaceWith(span);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Current State
    let currentView = 'dashboard';
    let currentRoleTitle = 'Senior React Developer';
    let currentRoleLocation = 'Bangalore (Hybrid)';
    let currentTags = ['REACT 18', 'TYPESCRIPT', 'NEXT.JS', 'ARCHITECTURE', 'D3.JS'];

    // DOM Elements Map
    const views = {
        dashboard: document.getElementById('view-dashboard'),
        brief: document.getElementById('view-brief'),
        aiJd: document.getElementById('view-ai-jd'),
        ingestion: document.getElementById('view-ingestion'),
        resolutions: document.getElementById('view-resolutions'),
        outreachAll: document.getElementById('view-outreach-all'),
        sourcedGrid: document.getElementById('view-sourced-grid'),
        shortlisted: document.getElementById('view-shortlisted'),
        contacted: document.getElementById('view-contacted'),
        responded: document.getElementById('view-responded'),
        screened: document.getElementById('view-screened'),
        candidateDetail: document.getElementById('view-candidate-detail')
    };

    const breadcrumbContainer = document.getElementById('breadcrumb-nav');
    const headerTitleBar = document.getElementById('header-title-bar');
    const pipelineTabsBar = document.getElementById('pipeline-tabs-bar');
    const topSaveDraftBtn = document.getElementById('top-save-draft');
    const stackTagsContainer = document.getElementById('stack-tags-container');
    const briefTextarea = document.getElementById('brief-textarea');
    const chatInput = document.getElementById('chat-input');
    const sidebarSearch = document.getElementById('sidebar-search');

    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // View Switcher Function
    window.switchView = function(targetView) {
        currentView = targetView;

        // Hide all views
        Object.keys(views).forEach(key => {
            if (views[key]) views[key].classList.add('hidden');
        });

        // Show target view
        if (views[targetView]) {
            views[targetView].classList.remove('hidden');
        }

        // Header & Tab visibility management
        const isPipelineView = ['outreachAll', 'sourcedGrid', 'shortlisted', 'contacted', 'responded', 'screened'].includes(targetView);

        if (targetView === 'dashboard') {
            if (breadcrumbContainer) breadcrumbContainer.classList.add('hidden');
            if (headerTitleBar) headerTitleBar.classList.add('hidden');
            if (pipelineTabsBar) pipelineTabsBar.classList.add('hidden');
            if (topSaveDraftBtn) topSaveDraftBtn.classList.add('hidden');
        } else if (targetView === 'candidateDetail') {
            if (breadcrumbContainer) breadcrumbContainer.classList.add('hidden');
            if (headerTitleBar) headerTitleBar.classList.add('hidden');
            if (pipelineTabsBar) pipelineTabsBar.classList.add('hidden');
            if (topSaveDraftBtn) topSaveDraftBtn.classList.add('hidden');
        } else {
            if (breadcrumbContainer) breadcrumbContainer.classList.remove('hidden');
            if (topSaveDraftBtn) topSaveDraftBtn.classList.remove('hidden');

            if (targetView === 'brief' || targetView === 'aiJd') {
                if (headerTitleBar) headerTitleBar.classList.add('hidden');
                if (pipelineTabsBar) pipelineTabsBar.classList.add('hidden');
                document.getElementById('breadcrumb-text').textContent = 'Jobs / Create new';
            } else {
                if (headerTitleBar) headerTitleBar.classList.remove('hidden');
                if (pipelineTabsBar) pipelineTabsBar.classList.remove('hidden');
                document.getElementById('breadcrumb-text').textContent = 'Jobs / Senior React Developer';
            }
        }

        // Re-initialize Lucide Icons
        if (window.lucide) {
            lucide.createIcons();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Render Tech Stack Tags
    window.renderStackTags = function() {
        if (!stackTagsContainer) return;

        stackTagsContainer.innerHTML = '';
        currentTags.forEach((tag, index) => {
            const pill = document.createElement('div');
            pill.className = 'inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-md text-xs font-bold font-mono tracking-wider tag-pill uppercase';
            pill.innerHTML = `
                <span>${tag}</span>
                <button type="button" onclick="removeTag(${index})" class="hover:text-red-500 text-indigo-400 font-bold leading-none ml-1 focus:outline-none">&times;</button>
            `;
            stackTagsContainer.appendChild(pill);
        });

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.onclick = promptAddTag;
        addBtn.className = 'inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-900 text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors';
        addBtn.innerHTML = `+ add`;
        stackTagsContainer.appendChild(addBtn);
    };

    window.removeTag = function(index) {
        currentTags.splice(index, 1);
        renderStackTags();
        showToast('Tag removed');
    };

    window.promptAddTag = function() {
        const newTag = prompt('Enter new core stack technology:');
        if (newTag && newTag.trim() !== '') {
            currentTags.push(newTag.trim().toUpperCase());
            renderStackTags();
            showToast(`Added '${newTag.trim()}' to stack`);
        }
    };

    // Quick Actions
    window.startJobCreation = function(prefillPrompt = '') {
        switchView('brief');
        if (briefTextarea && prefillPrompt) {
            briefTextarea.value = prefillPrompt;
        }
    };

    window.submitRoleBrief = function() {
        const val = briefTextarea ? briefTextarea.value : '';
        if (!val || val.trim() === '') {
            showToast('Please describe the role first');
            return;
        }
        document.getElementById('ai-user-prompt-text').textContent = val;
        switchView('aiJd');
        showToast('AI drafted job description successfully');
    };

    window.confirmIngestion = function() {
        switchView('ingestion');
        showToast('Ingestion pipeline initialized...');

        let percent = 0;
        const percentEl = document.getElementById('ingestion-percent');
        const processingEl = document.getElementById('ingestion-processing-count');

        const interval = setInterval(() => {
            percent += 15;
            if (percent >= 92) {
                percent = 92;
                if (percentEl) percentEl.textContent = '92%';
                if (processingEl) processingEl.textContent = '93';
                clearInterval(interval);

                setTimeout(() => {
                    switchView('resolutions');
                    showToast('Candidate parsing complete — 3 issues detected');
                }, 1800);
            } else {
                if (percentEl) percentEl.textContent = `${percent}%`;
                if (processingEl) processingEl.textContent = `${Math.floor(percent * 1.01)}`;
            }
        }, 300);
    };

    window.applyResolutions = function() {
        switchView('outreachAll');
        showToast('Resolutions applied! 30 candidates matched.');
    };

    // Pipeline Tab Selection
    window.selectTab = function(tabName) {
        const tabBtns = document.querySelectorAll('.pipeline-tab');
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
                btn.classList.remove('bg-white', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
            } else {
                btn.classList.remove('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
                btn.classList.add('bg-white', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
            }
        });

        if (tabName === 'all') switchView('outreachAll');
        else if (tabName === 'sourced') switchView('sourcedGrid');
        else if (tabName === 'shortlisted') switchView('shortlisted');
        else if (tabName === 'contacted') switchView('contacted');
        else if (tabName === 'responded') switchView('responded');
        else if (tabName === 'screened') switchView('screened');
        else showToast(`Selected tab: ${tabName.toUpperCase()}`);
    };

    // Open Specific Candidate Messaging Detail
    window.openCandidateDetail = function(name = 'Sanjay Verma') {
        document.getElementById('detail-candidate-name').textContent = name;
        switchView('candidateDetail');
        showToast(`Opened candidate conversation for ${name}`);
    };

    // AI Suggest Reply in Candidate Detail
    window.aiSuggestReply = function() {
        const msgBox = document.getElementById('sms-textarea');
        if (msgBox) {
            msgBox.value = "Thanks for following up! Are you available for a 15-min tech alignment call tomorrow at 2 PM IST?";
            showToast('AI reply draft generated!');
        }
    };

    window.sendCandidateMessage = function() {
        const msgBox = document.getElementById('sms-textarea');
        if (msgBox && msgBox.value.trim()) {
            showToast(`Message sent via SMS to ${document.getElementById('detail-candidate-name').textContent}!`);
            msgBox.value = '';
        } else {
            showToast('Please type a message first');
        }
    };

    // Toast Notification System
    window.showToast = function(msg) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-20 right-6 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce-slow pointer-events-auto';
        toast.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>${msg}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // Command Bar Listener
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = chatInput.value.trim();
                if (!cmd) return;

                chatInput.value = '';
                showToast(`Command executed: "${cmd}"`);

                if (cmd.toLowerCase().includes('create')) startJobCreation(cmd);
                else if (cmd.toLowerCase().includes('sourced')) selectTab('sourced');
                else if (cmd.toLowerCase().includes('screened')) selectTab('screened');
                else if (cmd.toLowerCase().includes('responded')) selectTab('responded');
                else if (cmd.toLowerCase().includes('dashboard')) switchView('dashboard');
            }
        });
    }

    renderStackTags();
});
