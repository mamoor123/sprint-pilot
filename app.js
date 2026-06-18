/* ============================================ */
/*  SprintPilot — AI Sprint Command Center      */
/* ============================================ */

// ===== STATE =====
let S = {
    sprint: { name: 'Sprint 1', start: '2026-06-18', end: '2026-07-01', goal: 'Ship auth and dashboard features' },
    stories: [], backlog: [], retro: [], activity: [],
    team: [
        { id: '1', name: 'Alice', role: 'Frontend Dev', color: '#6366f1' },
        { id: '2', name: 'Bob', role: 'Backend Dev', color: '#f59e0b' },
        { id: '3', name: 'Charlie', role: 'Designer', color: '#10b981' },
        { id: '4', name: 'Diana', role: 'QA Engineer', color: '#ef4444' }
    ],
    velocity: [22, 26, 24, 28, 30, 26],
    votes: {}
};
let nid = 1, nrid = 1;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    pendo.initialize({ visitor: { id: '' } });
    load(); initNav(); initTheme(); initBoard(); initModals(); initAI(); initCmd();
    render();
});

// ===== STORAGE =====
function load() {
    const d = localStorage.getItem('sp-data');
    if (d) { try { S = { ...S, ...JSON.parse(d) }; const ids = [...S.stories.map(s=>s.id),...S.backlog.map(s=>s.id)]; nid = ids.length ? Math.max(...ids)+1 : 1; nrid = S.retro.length ? Math.max(...S.retro.map(r=>r.id))+1 : 1; } catch(e){} }
    else sample();
}
function save() { localStorage.setItem('sp-data', JSON.stringify(S)); }

function sample() {
    S.stories = [
        { id:nid++, title:'User Authentication', desc:'As a user, I want to sign in with Google so I can access my account securely.', pts:8, pri:'high', assign:'1', epic:'Auth', tags:['frontend','backend'], status:'done', created:'2026-06-15' },
        { id:nid++, title:'Dashboard Analytics', desc:'As a PM, I want to see sprint metrics on a dashboard to track progress.', pts:5, pri:'high', assign:'1', epic:'Analytics', tags:['frontend','charts'], status:'progress', created:'2026-06-16' },
        { id:nid++, title:'API Rate Limiting', desc:'As a developer, I want API rate limiting so the service stays stable.', pts:3, pri:'medium', assign:'2', epic:'Infra', tags:['backend'], status:'progress', created:'2026-06-16' },
        { id:nid++, title:'Mobile Responsive', desc:'As a user, I want the app to work on mobile so I can use it on the go.', pts:5, pri:'medium', assign:'3', epic:'UI', tags:['frontend','ux'], status:'todo', created:'2026-06-17' },
        { id:nid++, title:'Email Notifications', desc:'As a user, I want email notifications for sprint updates.', pts:3, pri:'low', assign:'2', epic:'Notify', tags:['backend','email'], status:'todo', created:'2026-06-17' },
        { id:nid++, title:'Dark Mode', desc:'As a user, I want dark mode for comfortable night usage.', pts:2, pri:'low', assign:'3', epic:'UI', tags:['frontend','ux'], status:'review', created:'2026-06-17' },
        { id:nid++, title:'Export Sprint Report', desc:'As a PM, I want to export sprint reports as PDF for stakeholders.', pts:5, pri:'medium', assign:'1', epic:'Reports', tags:['frontend','export'], status:'todo', created:'2026-06-18' },
        { id:nid++, title:'Drag-and-Drop Board', desc:'As a user, I want to drag stories between columns to update status.', pts:3, pri:'high', assign:'1', epic:'Board', tags:['frontend','ux'], status:'done', created:'2026-06-15' }
    ];
    S.backlog = [
        { id:nid++, title:'User Roles & Permissions', desc:'As an admin, I want to set user roles to control access.', pts:8, pri:'high', assign:'', epic:'Auth', tags:['backend','security'], created:'2026-06-18' },
        { id:nid++, title:'Slack Integration', desc:'As a user, I want Slack notifications to keep my team updated.', pts:5, pri:'medium', assign:'', epic:'Integrations', tags:['backend','api'], created:'2026-06-18' },
        { id:nid++, title:'Sprint Templates', desc:'As a PM, I want sprint templates for quick setup.', pts:3, pri:'low', assign:'', epic:'Planning', tags:['frontend'], created:'2026-06-18' },
        { id:nid++, title:'Time Tracking', desc:'As a developer, I want to track time on stories to improve estimates.', pts:5, pri:'medium', assign:'', epic:'Tracking', tags:['frontend','backend'], created:'2026-06-18' }
    ];
    S.retro = [
        { id:nrid++, cat:'good', text:'Good collaboration between frontend and backend teams', votes:3 },
        { id:nrid++, cat:'good', text:'Sprint planning was well-structured', votes:2 },
        { id:nrid++, cat:'bad', text:'Too many context switches between tasks', votes:4 },
        { id:nrid++, cat:'bad', text:'Need better test coverage before merging', votes:3 },
        { id:nrid++, cat:'action', text:'Implement code review checklist', votes:5 },
        { id:nrid++, cat:'action', text:'Block focus time on calendars (no meetings)', votes:4 }
    ];
    S.activity = [
        { icon:'fa-check', text:'<strong>Alice</strong> completed <strong>User Authentication</strong>', time:'2h ago' },
        { icon:'fa-arrow-right', text:'<strong>Bob</strong> moved <strong>API Rate Limiting</strong> to In Progress', time:'3h ago' },
        { icon:'fa-plus', text:'<strong>Charlie</strong> added <strong>Mobile Responsive</strong>', time:'5h ago' },
        { icon:'fa-comment', text:'<strong>Diana</strong> commented on <strong>Dark Mode</strong>', time:'6h ago' },
        { icon:'fa-check', text:'<strong>Alice</strong> completed <strong>Drag-and-Drop Board</strong>', time:'1d ago' }
    ];
    save();
}

// ===== NAVIGATION =====
function initNav() {
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => {
        e.preventDefault(); switchView(l.dataset.view);
    }));
    document.getElementById('hamburger').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
}
function switchView(v) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === v));
    document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === `view-${v}`));
    document.getElementById('sidebar').classList.remove('open');
    const titles = { dashboard:'Dashboard', board:'Sprint Board', timeline:'Timeline', backlog:'Backlog', 'ai-planner':'AI Planner', 'risk-radar':'Risk Radar', standup:'AI Standup', velocity:'Velocity', workload:'Workload', retro:'Retrospective' };
    document.getElementById('view-title').textContent = titles[v] || v;
    if (v === 'velocity') setTimeout(renderCharts, 100);
    if (v === 'timeline') renderTimeline();
    if (v === 'workload') renderWorkload();
    if (v === 'risk-radar') renderRiskRadar();
    if (v === 'ai-planner') renderVotes();
    closePanel();
}

// ===== THEME =====
function initTheme() {
    const t = localStorage.getItem('sp-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
    document.getElementById('theme-switch').addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('sp-theme', next);
        renderCharts();
    });
}

// ===== BOARD =====
function initBoard() {
    ['todo','progress','review','done'].forEach(s => {
        const el = document.getElementById(`col-${s}`);
        if (el) new Sortable(el, { group:'stories', animation:200, ghostClass:'sortable-ghost',
            onEnd: evt => {
                const id = +evt.item.dataset.id;
                const ns = evt.to.closest('.board-col').dataset.status;
                const st = S.stories.find(s => s.id === id);
                if (st) { st.status = ns; save(); renderBoard(); addActivity('fa-arrow-right', `<strong>You</strong> moved <strong>${st.title}</strong> to ${statusLabel(ns)}`); toast('Story moved!'); }
            }
        });
    });
}
function statusLabel(s) { return { todo:'To Do', progress:'In Progress', review:'Review', done:'Done' }[s] || s; }

// ===== MODALS =====
function initModals() {
    document.getElementById('add-story-btn').addEventListener('click', () => openStoryModal());
    document.getElementById('add-backlog-btn').addEventListener('click', () => openStoryModal(null, true));
    document.getElementById('story-form').addEventListener('submit', e => { e.preventDefault(); saveStory(); });
    document.getElementById('retro-form').addEventListener('submit', e => { e.preventDefault(); saveRetro(); });
    document.querySelectorAll('.cancel-modal, .modal-close-btn').forEach(b => b.addEventListener('click', closeModals));
    document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModals(); }));
    document.querySelectorAll('.add-retro-btn').forEach(b => b.addEventListener('click', () => openRetroModal(b.dataset.cat)));
    document.getElementById('backlog-search').addEventListener('input', e => renderBacklog(e.target.value));
}

function openStoryModal(s, bl) {
    const m = document.getElementById('story-modal');
    const sel = document.getElementById('story-assign');
    sel.innerHTML = '<option value="">Unassigned</option>' + S.team.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    if (s) {
        document.getElementById('modal-title').textContent = 'Edit Story';
        document.getElementById('story-id').value = s.id;
        document.getElementById('story-title').value = s.title;
        document.getElementById('story-desc').value = s.desc || '';
        document.getElementById('story-pts').value = s.pts;
        document.getElementById('story-pri').value = s.pri;
        document.getElementById('story-assign').value = s.assign || '';
        document.getElementById('story-epic').value = s.epic || '';
        document.getElementById('story-tags').value = (s.tags||[]).join(', ');
        document.getElementById('story-form').dataset.mode = 'edit';
        document.getElementById('story-form').dataset.bl = S.backlog.some(b => b.id === s.id) ? '1' : '0';
    } else {
        document.getElementById('modal-title').textContent = bl ? 'Add to Backlog' : 'New Story';
        document.getElementById('story-form').reset();
        document.getElementById('story-id').value = '';
        document.getElementById('story-form').dataset.mode = 'add';
        document.getElementById('story-form').dataset.bl = bl ? '1' : '0';
    }
    m.classList.add('open');
}

function openRetroModal(cat) {
    document.getElementById('retro-cat').value = cat;
    document.getElementById('retro-id').value = '';
    document.getElementById('retro-text').value = '';
    document.getElementById('retro-modal').classList.add('open');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

function saveStory() {
    const form = document.getElementById('story-form');
    const id = document.getElementById('story-id').value;
    const bl = form.dataset.bl === '1';
    const s = {
        id: id ? +id : nid++,
        title: document.getElementById('story-title').value.trim(),
        desc: document.getElementById('story-desc').value.trim(),
        pts: +document.getElementById('story-pts').value,
        pri: document.getElementById('story-pri').value,
        assign: document.getElementById('story-assign').value,
        epic: document.getElementById('story-epic').value.trim(),
        tags: document.getElementById('story-tags').value.split(',').map(t => t.trim()).filter(Boolean),
        status: bl ? 'backlog' : 'todo',
        created: new Date().toISOString().slice(0, 10)
    };
    if (form.dataset.mode === 'edit') {
        const list = bl ? S.backlog : S.stories;
        const i = list.findIndex(x => x.id === s.id);
        if (i >= 0) { s.status = list[i].status; list[i] = s; }
    } else {
        (bl ? S.backlog : S.stories).push(s);
        addActivity('fa-plus', `<strong>You</strong> added <strong>${s.title}</strong>`);
    }
    save(); render(); closeModals(); toast(form.dataset.mode === 'edit' ? 'Updated!' : 'Added!');
}

function saveRetro() {
    const id = document.getElementById('retro-id').value;
    const r = { id: id ? +id : nrid++, cat: document.getElementById('retro-cat').value, text: document.getElementById('retro-text').value.trim(), votes: 0 };
    if (!r.text) return;
    S.retro.push(r); save(); renderRetro(); closeModals(); toast('Note added!');
}

// ===== AI =====
function initAI() {
    document.getElementById('estimate-btn').addEventListener('click', () => {
        const t = document.getElementById('ai-story-input').value.trim();
        if (!t) return;
        const r = estimate(t);
        const el = document.getElementById('estimation-result');
        el.classList.add('show'); el.innerHTML = r;
    });
    document.getElementById('calc-cap-btn').addEventListener('click', () => {
        const r = capacity(+$('#cap-team').value, +$('#cap-vel').value, +$('#cap-days').value, +$('#cap-avail').value);
        const el = document.getElementById('capacity-result');
        el.classList.add('show'); el.innerHTML = r;
    });
    document.getElementById('suggest-btn').addEventListener('click', () => {
        const r = suggest();
        const el = document.getElementById('suggestion-result');
        el.classList.add('show'); el.innerHTML = r;
    });
    document.getElementById('gen-standup-btn').addEventListener('click', () => {
        const r = standup();
        const el = document.getElementById('standup-output');
        el.classList.add('show'); el.innerHTML = r;
    });
}

function estimate(text) {
    const w = text.toLowerCase();
    let pts = 3, comp = 'Medium', conf = 75;
    const hi = ['integration','authentication','security','payment','migration','real-time','algorithm','machine learning','ai','blockchain'];
    const md = ['api','database','dashboard','search','notification','export','import','filter','sort','upload'];
    const lo = ['button','text','color','style','layout','tooltip','icon','label','rename','typo'];
    if (hi.some(k => w.includes(k))) { pts = 8; comp = 'High'; conf = 70; }
    else if (md.some(k => w.includes(k))) { pts = 5; comp = 'Medium'; conf = 80; }
    else if (lo.some(k => w.includes(k))) { pts = 2; comp = 'Low'; conf = 85; }
    if (text.length > 200) { pts = Math.min(pts + 2, 13); conf -= 5; }
    let bd = '';
    if (pts >= 8) bd = `<div style="margin-top:10px"><h4>💡 Suggested Breakdown</h4>
        <div class="ai-suggest-item"><span>1. Core functionality</span><span class="story-pts">${Math.ceil(pts*0.4)} pts</span></div>
        <div class="ai-suggest-item"><span>2. Error handling & edge cases</span><span class="story-pts">${Math.ceil(pts*0.3)} pts</span></div>
        <div class="ai-suggest-item"><span>3. Testing & polish</span><span class="story-pts">${Math.ceil(pts*0.3)} pts</span></div></div>`;
    return `<h4>🤖 AI Estimation</h4><span class="ai-big">${pts} pts</span>
        <div class="ai-row"><div><strong>Complexity:</strong> ${comp}</div><div><strong>Confidence:</strong> ${conf}%</div></div>
        <div style="font-size:13px;color:var(--tx2);margin-top:4px">${pts>=8?'⚠️ High complexity — consider breaking down':'✅ '+comp+' complexity — normal sprint work'}</div>${bd}`;
}

function capacity(team, vel, days, avail) {
    const eff = Math.round(days * avail / 100);
    const hrs = Math.round(eff * 8);
    const total = hrs * team;
    const sug = Math.round(vel * avail / 100);
    const stories = Math.round(sug / 3);
    return `<h4>📊 Capacity Analysis</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:10px 0">
        <div><div style="font-size:11px;color:var(--tx3)">Effective Days</div><span class="ai-big" style="font-size:28px">${eff}</span></div>
        <div><div style="font-size:11px;color:var(--tx3)">Hours/Person</div><span class="ai-big" style="font-size:28px">${hrs}h</span></div>
        <div><div style="font-size:11px;color:var(--tx3)">Total Capacity</div><span class="ai-big" style="font-size:28px">${total}h</span></div>
        <div><div style="font-size:11px;color:var(--tx3)">Suggested Points</div><span class="ai-big" style="font-size:28px">${sug}</span></div></div>
        <div style="font-size:13px;color:var(--tx2)">Plan for ~${sug} story points (${stories} avg stories at 3 pts each)</div>`;
}

function suggest() {
    const avg = S.velocity.length ? Math.round(S.velocity.reduce((a,b) => a+b, 0) / S.velocity.length) : 26;
    const load = S.stories.reduce((s, x) => s + x.pts, 0);
    const rem = Math.max(0, avg - load);
    const ord = { critical:0, high:1, medium:2, low:3 };
    const sorted = [...S.backlog].sort((a,b) => ord[a.pri] - ord[b.pri]);
    let picked = [], tot = 0;
    for (const s of sorted) { if (tot + s.pts <= rem) { picked.push(s); tot += s.pts; } }
    let h = `<h4>🚀 Sprint Suggestion</h4><div class="ai-row"><div><strong>Avg Velocity:</strong> ${avg} pts</div><div><strong>Current Load:</strong> ${load} pts</div><div><strong>Remaining:</strong> ${rem} pts</div></div>`;
    if (!picked.length) h += `<div style="color:var(--amber);margin-top:8px">⚠️ Sprint is at capacity. Finish current stories first.</div>`;
    else { h += `<div style="margin-top:8px"><strong>Suggested stories:</strong></div>`; picked.forEach(s => { h += `<div class="ai-suggest-item"><span>${s.title}</span><span class="story-pts">${s.pts} pts</span></div>`; }); h += `<div style="margin-top:6px;font-size:13px;color:var(--tx2)">Total: ${tot} pts from ${picked.length} stories</div>`; }
    return h;
}

function standup() {
    const done = S.stories.filter(s => s.status === 'done');
    const prog = S.stories.filter(s => s.status === 'progress');
    const todo = S.stories.filter(s => s.status === 'todo');
    const review = S.stories.filter(s => s.status === 'review');
    return `<h4>📋 Daily Standup — ${new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}</h4>
        <div class="standup-section"><div class="standup-label">✅ Completed (${done.length})</div>${done.map(s => `<div>• ${s.title} (${s.pts} pts)</div>`).join('') || '<div>None yet</div>'}</div>
        <div class="standup-section"><div class="standup-label">🔄 In Progress (${prog.length})</div>${prog.map(s => `<div>• ${s.title} — assigned to ${assignName(s.assign)}</div>`).join('') || '<div>None</div>'}</div>
        <div class="standup-section"><div class="standup-label">👀 In Review (${review.length})</div>${review.map(s => `<div>• ${s.title}</div>`).join('') || '<div>None</div>'}</div>
        <div class="standup-section"><div class="standup-label">📝 Up Next (${todo.length})</div>${todo.map(s => `<div>• ${s.title} (${s.pts} pts)</div>`).join('') || '<div>Backlog is clear</div>'}</div>
        <div class="standup-section"><div class="standup-label">⚠️ Blockers</div><div>${getRisks().filter(r => r.level === 'high').map(r => `• ${r.story}: ${r.issue}`).join('<br>') || 'No blockers detected'}</div></div>`;
}

function getRisks() {
    const risks = [];
    S.stories.forEach(s => {
        if (s.status === 'todo' && s.pri === 'critical') risks.push({ story: s.title, level: 'high', issue: 'Critical story not started', suggestion: 'Assign and start immediately' });
        if (s.pts >= 8 && s.status !== 'done') risks.push({ story: s.title, level: 'medium', issue: 'Large story (8+ pts) — risk of spillover', suggestion: 'Consider breaking into smaller stories' });
        if (!s.assign && s.status !== 'todo') risks.push({ story: s.title, level: 'medium', issue: 'No assignee on active story', suggestion: 'Assign a team member' });
    });
    const totalPts = S.stories.reduce((a, s) => a + s.pts, 0);
    const donePts = S.stories.filter(s => s.status === 'done').reduce((a, s) => a + s.pts, 0);
    const daysLeft = Math.max(0, Math.ceil((new Date(S.sprint.end) - new Date()) / 86400000));
    const daysTotal = Math.ceil((new Date(S.sprint.end) - new Date(S.sprint.start)) / 86400000);
    const expected = Math.round((1 - daysLeft / daysTotal) * totalPts);
    if (donePts < expected * 0.7 && daysLeft < daysTotal * 0.5) risks.push({ story: 'Sprint Overall', level: 'high', issue: `Behind schedule: ${donePts}/${totalPts} pts done, ${daysLeft} days left`, suggestion: 'Re-scope or add resources' });
    return risks;
}

function healthScore() {
    const total = S.stories.reduce((a, s) => a + s.pts, 0) || 1;
    const done = S.stories.filter(s => s.status === 'done').reduce((a, s) => a + s.pts, 0);
    const review = S.stories.filter(s => s.status === 'review').reduce((a, s) => a + s.pts, 0);
    const progress = S.stories.filter(s => s.status === 'progress').reduce((a, s) => a + s.pts, 0);
    const risks = getRisks();
    const hiRisks = risks.filter(r => r.level === 'high').length;
    // Weighted score: done=100%, review=80%, progress=50%, todo=0%
    let score = Math.round(((done * 1 + review * 0.8 + progress * 0.5) / total) * 100);
    score -= hiRisks * 10;
    score = Math.max(0, Math.min(100, score));
    return { score, done, total, hiRisks };
}

// ===== COMMAND PALETTE =====
function initCmd() {
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('command-input');
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openCmd(); }
        if (e.key === 'Escape') closeCmd();
    });
    document.getElementById('cmd-trigger').addEventListener('click', openCmd);
    document.getElementById('sidebar-search-trigger').addEventListener('click', openCmd);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeCmd(); });
    input.addEventListener('input', () => filterCmd(input.value));
}
function openCmd() {
    document.getElementById('command-palette-overlay').classList.add('open');
    const input = document.getElementById('command-input');
    input.value = ''; input.focus(); filterCmd('');
}
function closeCmd() { document.getElementById('command-palette-overlay').classList.remove('open'); }
function filterCmd(q) {
    const items = [
        { icon:'fa-chart-pie', text:'Dashboard', action:() => switchView('dashboard') },
        { icon:'fa-columns', text:'Sprint Board', action:() => switchView('board') },
        { icon:'fa-timeline', text:'Timeline', action:() => switchView('timeline') },
        { icon:'fa-list-check', text:'Backlog', action:() => switchView('backlog') },
        { icon:'fa-wand-magic-sparkles', text:'AI Planner', action:() => switchView('ai-planner') },
        { icon:'fa-shield-halved', text:'Risk Radar', action:() => switchView('risk-radar') },
        { icon:'fa-robot', text:'AI Standup', action:() => switchView('standup') },
        { icon:'fa-chart-line', text:'Velocity', action:() => switchView('velocity') },
        { icon:'fa-users-gear', text:'Workload', action:() => switchView('workload') },
        { icon:'fa-rotate-left', text:'Retrospective', action:() => switchView('retro') },
        { icon:'fa-plus', text:'New Story', action:() => openStoryModal() },
        ...S.stories.map(s => ({ icon:'fa-ticket', text:s.title, action:() => openPanel(s) })),
        ...S.backlog.map(s => ({ icon:'fa-list', text:`[Backlog] ${s.title}`, action:() => openPanel(s) }))
    ];
    const filtered = q ? items.filter(i => i.text.toLowerCase().includes(q.toLowerCase())) : items.slice(0, 10);
    const el = document.getElementById('command-results');
    el.innerHTML = filtered.map((i, idx) => `<div class="command-item${idx===0?' selected':''}" data-idx="${idx}"><i class="fas ${i.icon}"></i><span>${i.text}</span></div>`).join('');
    el.querySelectorAll('.command-item').forEach((div, idx) => div.addEventListener('click', () => { filtered[idx].action(); closeCmd(); }));
}

// ===== SIDE PANEL =====
function openPanel(s) {
    const p = document.getElementById('side-panel');
    document.getElementById('panel-title').textContent = s.title;
    const a = S.team.find(t => t.id === s.assign);
    document.getElementById('panel-body').innerHTML = `
        <div style="margin-bottom:16px"><span class="tag tag-${s.pri}" style="font-size:12px">${s.pri}</span> <span class="story-pts" style="font-size:13px">${s.pts} pts</span> ${s.epic?`<span class="tag tag-epic" style="font-size:12px">${s.epic}</span>`:''}</div>
        <div style="margin-bottom:16px;font-size:14px;color:var(--tx2);line-height:1.6">${s.desc||'No description'}</div>
        <div style="margin-bottom:12px"><strong style="font-size:12px;color:var(--tx3)">ASSIGNEE</strong><div style="margin-top:4px;font-size:14px">${a?`<span class="story-avatar" style="background:${a.color};display:inline-flex;width:22px;height:22px;font-size:10px;vertical-align:middle;margin-right:6px">${a.name[0]}</span>${a.name}`:'Unassigned'}</div></div>
        <div style="margin-bottom:12px"><strong style="font-size:12px;color:var(--tx3)">TAGS</strong><div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">${(s.tags||[]).map(t=>`<span class="tag" style="background:var(--accent-l);color:var(--accent)">${t}</span>`).join('')||'None'}</div></div>
        <div style="display:flex;gap:8px;margin-top:20px">
            ${S.stories.some(x=>x.id===s.id)?`<button class="btn btn-ghost" onclick="moveToBacklog(${s.id})"><i class="fas fa-arrow-left"></i> To Backlog</button>`:`<button class="btn btn-primary" onclick="moveToSprint(${s.id})"><i class="fas fa-arrow-right"></i> To Sprint</button>`}
            <button class="btn btn-ghost" onclick="editStory(${s.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger" onclick="deleteStory(${s.id})"><i class="fas fa-trash"></i> Delete</button>
        </div>`;
    p.classList.add('open');
}
function closePanel() { document.getElementById('side-panel').classList.remove('open'); }
document.getElementById('panel-close').addEventListener('click', closePanel);

function editStory(id) {
    const s = S.stories.find(x => x.id === id) || S.backlog.find(x => x.id === id);
    if (s) { closePanel(); openStoryModal(s); }
}
function deleteStory(id) {
    S.stories = S.stories.filter(x => x.id !== id);
    S.backlog = S.backlog.filter(x => x.id !== id);
    save(); render(); closePanel(); toast('Deleted!');
}
function moveToBacklog(id) {
    const i = S.stories.findIndex(x => x.id === id);
    if (i >= 0) { const s = S.stories.splice(i, 1)[0]; delete s.status; S.backlog.push(s); save(); render(); closePanel(); toast('Moved to backlog!'); }
}
function moveToSprint(id) {
    const i = S.backlog.findIndex(x => x.id === id);
    if (i >= 0) { const s = S.backlog.splice(i, 1)[0]; s.status = 'todo'; S.stories.push(s); save(); render(); closePanel(); toast('Added to sprint!'); }
}

// ===== RENDER =====
function render() { renderDash(); renderBoard(); renderBacklog(); renderRetro(); renderActivity(); }
function assignName(id) { const t = S.team.find(x => x.id === id); return t ? t.name : 'Unassigned'; }
function assignColor(id) { const t = S.team.find(x => x.id === id); return t ? t.color : '#94a3b8'; }

function renderDash() {
    const h = healthScore();
    document.getElementById('sprint-score').textContent = h.score;
    document.getElementById('sprint-health-text').textContent = h.score >= 70 ? `On track to complete ${Math.round(h.done/h.total*100)}% of planned work` : h.score >= 40 ? 'Sprint needs attention — review risks' : 'Sprint at risk — immediate action needed';
    document.getElementById('stat-velocity').textContent = S.velocity.length ? S.velocity[S.velocity.length - 1] : 0;
    const daysLeft = Math.max(0, Math.ceil((new Date(S.sprint.end) - new Date()) / 86400000));
    document.getElementById('stat-days').textContent = daysLeft;
    document.getElementById('stat-done').textContent = S.stories.filter(s => s.status === 'done').length;
    const risks = getRisks();
    document.getElementById('stat-at-risk').textContent = risks.filter(r => r.level === 'high').length;
    const badge = document.getElementById('health-badge');
    badge.className = 'health-badge' + (h.score < 40 ? ' critical' : h.score < 70 ? ' at-risk' : '');
    badge.querySelector('span').textContent = h.score < 40 ? 'Critical' : h.score < 70 ? 'At Risk' : 'On Track';
    renderRiskMini(); renderQuickWins(); renderHealthDonut(h);
    setTimeout(renderBurndown, 100);
    document.getElementById('backlog-badge').textContent = S.backlog.length;
}

function renderHealthDonut(h) {
    const ctx = document.getElementById('health-donut');
    if (!ctx) return;
    if (window._healthChart) window._healthChart.destroy();
    window._healthChart = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [h.done, h.total - h.done], backgroundColor: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)'], borderWidth: 0 }] },
        options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, responsive: false }
    });
}

function renderRiskMini() {
    const risks = getRisks();
    document.getElementById('risk-list-mini').innerHTML = risks.length ? risks.slice(0, 4).map(r => `<div class="risk-item"><span class="risk-dot ${r.level}"></span><span class="risk-item-text">${r.story}: ${r.issue}</span></div>`).join('') : '<div style="font-size:13px;color:var(--tx3)">No risks detected ✅</div>';
}

function renderQuickWins() {
    const qw = S.stories.filter(s => s.status !== 'done' && s.pts <= 3 && (s.pri === 'high' || s.pri === 'critical'));
    document.getElementById('quickwins-list').innerHTML = qw.length ? qw.map(s => `<div class="qw-item"><span class="qw-item-text">${s.title}</span><span class="qw-pts">${s.pts} pts</span></div>`).join('') : '<div style="font-size:13px;color:var(--tx3)">No quick wins available</div>';
}

function renderActivity() {
    document.getElementById('activity-feed').innerHTML = S.activity.slice(0, 8).map(a => `<div class="activity-item"><div class="activity-icon"><i class="fas ${a.icon}"></i></div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div>`).join('');
}

function addActivity(icon, text) {
    S.activity.unshift({ icon, text, time: 'Just now' });
    if (S.activity.length > 20) S.activity.pop();
    save(); renderActivity();
}

function renderBoard() {
    ['todo','progress','review','done'].forEach(st => {
        const c = document.getElementById(`col-${st}`);
        const stories = S.stories.filter(s => s.status === st);
        document.getElementById(`cnt-${st}`).textContent = stories.length;
        c.innerHTML = stories.map(s => {
            const a = S.team.find(t => t.id === s.assign);
            const ini = a ? a.name[0] : '?';
            return `<div class="story-card" data-id="${s.id}">
                <div class="story-card-top"><div class="story-card-title">${s.title}</div>
                <div class="story-card-btns"><button onclick="event.stopPropagation();editStory(${s.id})"><i class="fas fa-pen"></i></button><button onclick="event.stopPropagation();deleteStory(${s.id})"><i class="fas fa-trash"></i></button></div></div>
                ${s.desc?`<div class="story-card-desc">${s.desc}</div>`:''}
                <div class="story-card-meta"><span class="tag tag-${s.pri}">${s.pri}</span>${s.epic?`<span class="tag tag-epic">${s.epic}</span>`:''}</div>
                <div class="story-card-foot"><span class="story-pts">${s.pts} pts</span>
                ${a?`<span class="story-assign"><span class="story-avatar" style="background:${a.color}">${ini}</span>${a.name}</span>`:''}</div></div>`;
        }).join('');
        c.querySelectorAll('.story-card').forEach(card => card.addEventListener('click', () => {
            const s = S.stories.find(x => x.id === +card.dataset.id);
            if (s) openPanel(s);
        }));
    });
}

function renderBacklog(q = '') {
    const filtered = S.backlog.filter(s => !q || s.title.toLowerCase().includes(q.toLowerCase()) || (s.desc||'').toLowerCase().includes(q.toLowerCase()));
    document.getElementById('backlog-list').innerHTML = filtered.map(s => `<div class="backlog-item">
        <span class="backlog-item-pts">${s.pts}</span>
        <div class="backlog-item-info"><div class="backlog-item-title">${s.title}</div><div class="backlog-item-desc">${s.desc||''}</div></div>
        <span class="tag tag-${s.pri}">${s.pri}</span>
        <div class="backlog-item-actions">
        <button class="btn btn-ghost btn-sm" onclick="openPanel(S.backlog.find(x=>x.id===${s.id}))"><i class="fas fa-eye"></i></button>
        <button class="btn btn-primary btn-sm" onclick="moveToSprint(${s.id})"><i class="fas fa-arrow-right"></i></button>
        <button class="btn btn-danger btn-sm" onclick="S.backlog=S.backlog.filter(x=>x.id!==${s.id});save();render();toast('Deleted!')"><i class="fas fa-trash"></i></button>
        </div></div>`).join('');
}

function renderRetro() {
    ['good','bad','action'].forEach(cat => {
        const el = document.getElementById(`retro-${cat}`);
        el.innerHTML = S.retro.filter(r => r.cat === cat).map(r => `<div class="retro-note">
            <div class="retro-note-text">${r.text}</div>
            <div class="retro-note-actions"><span class="retro-vote"><i class="fas fa-heart"></i> ${r.votes}</span>
            <button onclick="voteRetro(${r.id})"><i class="fas fa-plus"></i></button>
            <button onclick="S.retro=S.retro.filter(x=>x.id!==${r.id});save();renderRetro()"><i class="fas fa-trash"></i></button></div></div>`).join('');
    });
}
function voteRetro(id) { const r = S.retro.find(x => x.id === id); if (r) { r.votes++; save(); renderRetro(); } }

function renderVotes() {
    const el = document.getElementById('vote-list');
    el.innerHTML = S.backlog.map(s => {
        const v = S.votes[s.id] || {};
        return `<div class="vote-item"><span class="vote-item-title">${s.title}</span><span class="story-pts">${s.pts} pts</span>
            <div class="vote-btns">${S.team.map(t => `<button class="vote-btn${v[t.id]?' voted':''}" onclick="toggleVote(${s.id},'${t.id}')">${t.name[0]}</button>`).join('')}</div>
            <span class="vote-count">${Object.values(v).filter(Boolean).length}</span></div>`;
    }).join('');
}
function toggleVote(sid, tid) {
    if (!S.votes[sid]) S.votes[sid] = {};
    S.votes[sid][tid] = !S.votes[sid][tid];
    save(); renderVotes();
}

function renderTimeline() {
    const start = new Date(S.sprint.start);
    const end = new Date(S.sprint.end);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(new Date(d));
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('timeline-dates').innerHTML = days.map(d => {
        const ds = d.toISOString().slice(0, 10);
        return `<div class="timeline-day${ds===today?' today':''}">${d.toLocaleDateString('en-US',{weekday:'short',day:'numeric'})}</div>`;
    }).join('');
    const colors = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
    document.getElementById('timeline-body').innerHTML = S.stories.map((s, i) => {
        const created = new Date(s.created || S.sprint.start);
        const dayOffset = Math.max(0, Math.round((created - start) / 86400000));
        const duration = Math.max(2, Math.ceil(s.pts * 1.5));
        const left = (dayOffset / days.length) * 100;
        const width = Math.min((duration / days.length) * 100, 100 - left);
        const color = colors[i % colors.length];
        return `<div class="timeline-row"><span class="timeline-label">${s.title}</span>
            <div class="timeline-bar-wrap"><div class="timeline-bar" style="left:${left}%;width:${width}%;background:${color}">${s.pts} pts</div></div></div>`;
    }).join('');
}

function renderWorkload() {
    document.getElementById('workload-grid').innerHTML = S.team.map(t => {
        const stories = S.stories.filter(s => s.assign === t.id);
        const pts = stories.reduce((a, s) => a + s.pts, 0);
        const max = 20;
        const pct = Math.min(100, (pts / max) * 100);
        const cls = pct > 100 ? 'over' : pct > 75 ? 'warn' : 'ok';
        return `<div class="workload-card">
            <div class="workload-header"><div class="workload-avatar" style="background:${t.color}">${t.name[0]}</div>
            <div><div class="workload-name">${t.name}</div><div class="workload-role">${t.role}</div></div></div>
            <div class="workload-bar-wrap"><div class="workload-bar ${cls}" style="width:${pct}%"></div></div>
            <div class="workload-stats"><span>${pts} pts assigned</span><span>${pct}% capacity</span></div>
            <div class="workload-stories">${stories.map(s => `<div class="workload-story"><span>${s.title}</span><span class="story-pts">${s.pts}</span></div>`).join('')||'<div style="font-size:12px;color:var(--tx3);padding:6px">No stories assigned</div>'}</div></div>`;
    }).join('');
}

function renderRiskRadar() {
    const risks = getRisks();
    const good = risks.filter(r => r.level === 'low').length;
    const warn = risks.filter(r => r.level === 'medium').length;
    const bad = risks.filter(r => r.level === 'high').length;
    document.getElementById('risk-summary').innerHTML = `
        <div class="risk-summary-card good"><span class="risk-summary-num">${S.stories.length - risks.length}</span><span class="risk-summary-label">Healthy</span></div>
        <div class="risk-summary-card warn"><span class="risk-summary-num">${warn}</span><span class="risk-summary-label">Warnings</span></div>
        <div class="risk-summary-card bad"><span class="risk-summary-num">${bad}</span><span class="risk-summary-label">At Risk</span></div>`;
    document.getElementById('risk-tbody').innerHTML = risks.map(r => `<tr>
        <td style="font-weight:500">${r.story}</td>
        <td><span class="risk-level" style="background:var(--${r.level==='high'?'red':r.level==='medium'?'amber':'green'}-l);color:var(--${r.level==='high'?'red':r.level==='medium'?'amber':'green'})">${r.level}</span></td>
        <td>${r.issue}</td><td style="color:var(--tx3)">${r.suggestion}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--tx3);padding:20px">No risks detected ✅</td></tr>';
}

// ===== CHARTS =====
let charts = {};
function renderCharts() {
    Object.values(charts).forEach(c => c.destroy()); charts = {};
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tx = dark ? '#94a3b8' : '#64748b'; const grid = dark ? '#1e293b' : '#e2e8f0';
    Chart.defaults.color = tx; Chart.defaults.borderColor = grid;
    const vc = document.getElementById('vel-chart');
    if (vc) charts.vel = new Chart(vc, { type:'bar', data:{ labels:['S1','S2','S3','S4','S5','S6'], datasets:[{ data:S.velocity, backgroundColor:'#0d9488', borderRadius:6 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:grid}},x:{grid:{display:false}}} } });
    const dc = document.getElementById('dist-chart');
    if (dc) { const pri = ['critical','high','medium','low']; const cnt = pri.map(p => S.stories.filter(s => s.pri===p).length); charts.dist = new Chart(dc, { type:'doughnut', data:{ labels:['Critical','High','Medium','Low'], datasets:[{ data:cnt, backgroundColor:['#ef4444','#f59e0b','#3b82f6','#10b981'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}} } }); }
    renderBurndown();
}

function renderBurndown() {
    const bc = document.getElementById('burndown-chart');
    if (!bc) return;
    if (charts.bd) charts.bd.destroy();
    const total = S.stories.reduce((a, s) => a + s.pts, 0);
    const done = S.stories.filter(s => s.status === 'done').reduce((a, s) => a + s.pts, 0);
    const days = 10;
    const ideal = Array.from({ length: days + 1 }, (_, i) => total - (total / days) * i);
    const actual = [total, total - 2, total - 5, total - 8, total - 12, total - done];
    charts.bd = new Chart(bc, { type:'line', data:{ labels:Array.from({length:days+1},(_,i)=>`Day ${i}`), datasets:[
        { label:'Ideal', data:ideal, borderColor:'#94a3b8', borderDash:[5,5], pointRadius:0, fill:false },
        { label:'Actual', data:actual, borderColor:'#0d9488', backgroundColor:'rgba(13,148,136,0.1)', fill:true, tension:0.3 }
    ] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}, scales:{y:{beginAtZero:true,grid:{color:Chart.defaults.borderColor}},x:{grid:{display:false}}} } });
}

// ===== UTILS =====
function $(sel) { return document.querySelector(sel); }
function toast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000);
}