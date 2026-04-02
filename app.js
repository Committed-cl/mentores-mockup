// ============================================================
// APP — Plataforma Mentores (Mockup SPA)
// ============================================================

// --- State ---
const state = {
  currentRole: 'mentor',
  currentPage: 'login',
  currentUser: null,
  // For mentor/mentee: which pair is selected
  selectedPairId: null,
  // Filters
  commitmentStatusFilter: 'todos',
  commitmentMentorFilter: 'todos',
  commitmentMenteeFilter: 'todos',
  sessionMentorFilter: 'todos',
  sessionMenteeFilter: 'todos',
  fileSearch: '',
  userRoleFilter: 'todos',
  userStatusFilter: 'todos',
  reportPeriod: '2026-03'
};

// --- Helpers ---
function getUserById(id) { return USERS.find(u => u.id === id); }
function getPairById(id) { return PAIRS.find(p => p.id === id); }

function getUserPairs(userId, role) {
  if (role === 'mentor') return PAIRS.filter(p => p.mentorId === userId && p.active);
  if (role === 'mentee') return PAIRS.filter(p => p.menteeId === userId && p.active);
  return PAIRS.filter(p => p.active);
}

function getPairCommitments(pairId) {
  return COMMITMENTS.filter(c => c.pairId === pairId);
}

function getPairSessions(pairId) {
  return SESSIONS.filter(s => s.pairId === pairId).sort((a, b) => b.date.localeCompare(a.date));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function today() {
  return '2026-04-02'; // Fixed date for mockup consistency
}

function statusOrder(s) {
  const order = { vencido: 0, vigente: 1, cumplido: 2, renegociado: 3, cancelado: 4 };
  return order[s] ?? 5;
}

function sortCommitments(list) {
  return [...list].sort((a, b) => {
    const so = statusOrder(a.status) - statusOrder(b.status);
    if (so !== 0) return so;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

function statusBadge(status) {
  const map = {
    vigente: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Vigente</span>',
    vencido: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Vencido</span>',
    cumplido: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Cumplido</span>',
    renegociado: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Renegociado</span>',
    cancelado: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Cancelado</span>'
  };
  return map[status] || status;
}

function roleBadge(role) {
  const map = {
    admin: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Admin</span>',
    mentor: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Mentor</span>',
    mentee: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">Mentoreado</span>',
    superuser: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Super Usuario</span>'
  };
  return map[role] || role;
}

function roleLabel(role) {
  const map = { admin: 'Admin', mentor: 'Mentor', mentee: 'Mentoreado', superuser: 'Super Usuario' };
  return map[role] || role;
}

function fileIcon(name) {
  if (name.endsWith('.pdf')) return '<svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>';
  if (name.endsWith('.pptx')) return '<svg class="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>';
  if (name.endsWith('.xlsx')) return '<svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>';
  return '<svg class="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden', 'opacity-0');
  t.classList.add('opacity-100');
  setTimeout(() => { t.classList.replace('opacity-100', 'opacity-0'); setTimeout(() => t.classList.add('hidden'), 300); }, 2500);
}

function nextId(arr) {
  return Math.max(...arr.map(x => x.id), 0) + 1;
}

// --- Routing ---
function navigate(page) {
  state.currentPage = page;
  render();
  window.scrollTo(0, 0);
}

// --- Role switching ---
function setRole(role) {
  state.currentRole = role;
  const roleUsers = { admin: 1, mentor: 2, mentee: 5, superuser: 9 };
  state.currentUser = getUserById(roleUsers[role]);
  state.selectedPairId = null;
  state.commitmentStatusFilter = 'todos';
  navigate('dashboard');
}

// --- Menu items per role ---
function getMenuItems() {
  const role = state.currentRole;
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', roles: ['admin','mentor','mentee','superuser'] },
    { id: 'users', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin'] },
    { id: 'pairs', label: 'Pares Mentoría', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['admin'] },
    { id: 'sessions', label: 'Sesiones', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin','mentor','mentee','superuser'] },
    { id: 'commitments', label: 'Compromisos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['admin','mentor','mentee','superuser'] },
    { id: 'files', label: 'Archivos', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', roles: ['admin','mentor','mentee','superuser'] },
    { id: 'reports', label: 'Reportes', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['admin','superuser'] },
    { id: 'config', label: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin'] }
  ];
  return items.filter(i => i.roles.includes(role));
}

// --- Modal ---
function openModal(title, bodyHtml) {
  const m = document.getElementById('modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  m.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// --- Render ---
function render() {
  const app = document.getElementById('app');
  if (state.currentPage === 'login') {
    app.innerHTML = renderLogin();
    return;
  }
  app.innerHTML = renderShell();
}

// --- Login ---
function renderLogin() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-xl">E</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">${TENANT.name}</h1>
          <p class="text-gray-500 text-sm mt-1">emin.mentores.cl</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value="usuario@emin.cl" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value="********" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <button onclick="setRole(document.getElementById('role-select').value)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition">Ingresar</button>
          <p class="text-center text-sm text-blue-600 hover:underline cursor-pointer">¿Olvidaste tu contraseña?</p>
        </div>
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-400 text-center mb-2">Selector de rol (solo para demo)</p>
          <select id="role-select" class="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm bg-gray-50">
            <option value="admin">Admin — Carolina Vega</option>
            <option value="mentor" selected>Mentor — Rodrigo Martínez</option>
            <option value="mentee">Mentoreado — Juanita Pérez</option>
            <option value="superuser">Super Usuario — María Torres</option>
          </select>
        </div>
      </div>
    </div>`;
}

// --- Shell (sidebar + content) ---
function renderShell() {
  const menu = getMenuItems();
  const user = state.currentUser;
  const menuHtml = menu.map(m => {
    const active = state.currentPage === m.id;
    return `<a href="#" onclick="navigate('${m.id}');return false" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${m.icon}"/></svg>
      <span class="sidebar-label">${m.label}</span>
    </a>`;
  }).join('');

  let content = '';
  switch (state.currentPage) {
    case 'dashboard': content = renderDashboard(); break;
    case 'users': content = renderUsers(); break;
    case 'pairs': content = renderPairs(); break;
    case 'sessions': content = renderSessions(); break;
    case 'commitments': content = renderCommitments(); break;
    case 'files': content = renderFiles(); break;
    case 'reports': content = renderReports(); break;
    case 'config': content = renderConfig(); break;
    default: content = renderDashboard();
  }

  return `
    <!-- Mobile header -->
    <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <button onclick="document.getElementById('sidebar').classList.toggle('-translate-x-full')" class="p-1.5 rounded-lg hover:bg-gray-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
      </button>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold text-xs">E</span></div>
        <span class="font-semibold text-sm">Mentores</span>
      </div>
      <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">${user.name.split(' ').map(n=>n[0]).join('')}</div>
    </div>
    <!-- Layout -->
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside id="sidebar" class="fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform -translate-x-full lg:translate-x-0">
        <div class="p-5 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-sm">E</span></div>
            <div>
              <p class="font-semibold text-sm text-gray-900">Mentores</p>
              <p class="text-xs text-gray-400">${TENANT.name}</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">${menuHtml}</nav>
        <div class="p-3 border-t border-gray-100">
          <div class="px-3 py-2 mb-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">${user.name.split(' ').map(n=>n[0]).join('')}</div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${user.name}</p>
                <p class="text-xs text-gray-400 truncate">${roleLabel(state.currentRole)}</p>
              </div>
            </div>
          </div>
          <div class="px-1">
            <p class="text-[10px] text-gray-400 mb-1 px-2">Demo — cambiar rol:</p>
            <select onchange="setRole(this.value)" class="w-full text-xs px-2 py-1.5 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              ${['admin','mentor','mentee','superuser'].map(r => `<option value="${r}" ${r===state.currentRole?'selected':''}>${roleLabel(r)}</option>`).join('')}
            </select>
          </div>
          <button onclick="navigate('login')" class="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-9m9 0l-3-3m3 3l-3 3"/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <!-- Overlay for mobile sidebar -->
      <div onclick="document.getElementById('sidebar').classList.add('-translate-x-full')" class="fixed inset-0 bg-black/30 z-30 lg:hidden" style="display:none" id="sidebar-overlay"></div>
      <!-- Main content -->
      <main class="flex-1 p-4 lg:p-8 max-w-6xl">${content}</main>
    </div>`;
}

// --- Stat Card ---
function statCard(value, label, color = 'blue') {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray: 'bg-gray-50 text-gray-700'
  };
  return `<div class="bg-white rounded-xl border border-gray-200 p-5">
    <p class="text-3xl font-bold ${colors[color] || colors.blue} inline-block px-2 py-0.5 rounded-lg">${value}</p>
    <p class="text-sm text-gray-500 mt-2">${label}</p>
  </div>`;
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  switch (state.currentRole) {
    case 'admin': return renderDashboardAdmin();
    case 'mentor': return renderDashboardMentor();
    case 'mentee': return renderDashboardMentee();
    case 'superuser': return renderDashboardSuper();
  }
}

function renderDashboardAdmin() {
  const activePairs = PAIRS.filter(p => p.active).length;
  const allC = COMMITMENTS;
  const vigentes = allC.filter(c => c.status === 'vigente').length;
  const vencidos = allC.filter(c => c.status === 'vencido').length;

  const inactivePairs = PAIRS.filter(p => p.active).filter(p => {
    const sess = SESSIONS.filter(s => s.pairId === p.id);
    if (sess.length === 0) return true;
    const last = sess.sort((a,b) => b.date.localeCompare(a.date))[0];
    return last.date < '2026-03-20';
  });

  return `
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Bienvenido, ${state.currentUser.name.split(' ')[0]}</h1>
    <p class="text-gray-500 mb-6">Panel de administración</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      ${statCard(activePairs, 'Pares activos', 'blue')}
      ${statCard(vigentes, 'Compromisos vigentes', 'yellow')}
      ${statCard(vencidos, 'Compromisos vencidos', 'red')}
    </div>
    ${inactivePairs.length ? `
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8">
      <h3 class="font-semibold text-yellow-800 mb-2">Pares sin actividad reciente</h3>
      <ul class="space-y-1">
        ${inactivePairs.map(p => {
          const mentor = getUserById(p.mentorId);
          const mentee = getUserById(p.menteeId);
          const sess = SESSIONS.filter(s => s.pairId === p.id).sort((a,b) => b.date.localeCompare(a.date));
          const lastDate = sess.length ? formatDate(sess[0].date) : 'Sin sesiones';
          return `<li class="text-sm text-yellow-700">${mentor.name} → ${mentee.name} <span class="text-yellow-500">(última sesión: ${lastDate})</span></li>`;
        }).join('')}
      </ul>
    </div>` : ''}
    <div class="flex flex-wrap gap-3">
      <button onclick="navigate('users')" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Gestionar Usuarios</button>
      <button onclick="navigate('pairs')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Gestionar Pares</button>
    </div>`;
}

function renderDashboardMentor() {
  const pairs = getUserPairs(state.currentUser.id, 'mentor');
  return `
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Bienvenido, ${state.currentUser.name.split(' ')[0]}</h1>
    <p class="text-gray-500 mb-6">Tus mentoreados</p>
    <div class="space-y-4">
      ${pairs.map(p => {
        const mentee = getUserById(p.menteeId);
        const comms = getPairCommitments(p.id);
        const vigentes = comms.filter(c => c.status === 'vigente').length;
        const vencidos = comms.filter(c => c.status === 'vencido').length;
        const sess = getPairSessions(p.id);
        const lastSession = sess.length ? formatDate(sess[0].date) : 'Sin sesiones';
        return `
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-sm font-semibold text-teal-700">${mentee.name.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                <p class="font-semibold text-gray-900">${mentee.name}</p>
                <p class="text-xs text-gray-400">Última sesión: ${lastSession}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              ${vigentes ? `<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">${vigentes} vigente${vigentes>1?'s':''}</span>` : ''}
              ${vencidos ? `<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">${vencidos} vencido${vencidos>1?'s':''}</span>` : '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Al día</span>'}
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="state.selectedPairId=${p.id};openSessionForm(${p.id})" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition">Registrar Sesión</button>
            <button onclick="state.selectedPairId=${p.id};navigate('commitments')" class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition">Ver Compromisos</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderDashboardMentee() {
  const pairs = getUserPairs(state.currentUser.id, 'mentee');
  const pair = pairs[0];
  if (!pair) return '<p class="text-gray-500">No tienes un mentor asignado.</p>';
  const mentor = getUserById(pair.mentorId);
  const comms = sortCommitments(getPairCommitments(pair.id).filter(c => c.assigneeId === state.currentUser.id));
  const vencidos = comms.filter(c => c.status === 'vencido');
  const vigentes = comms.filter(c => c.status === 'vigente');
  const sess = getPairSessions(pair.id);

  return `
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Bienvenido, ${state.currentUser.name.split(' ')[0]}</h1>
    <p class="text-gray-500 mb-6">Mi mentor: <strong>${mentor.name}</strong></p>
    ${vencidos.length ? `
    <div class="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
      <h3 class="font-semibold text-red-800 mb-3">Compromisos vencidos</h3>
      ${vencidos.map(c => `
        <div class="flex items-center justify-between py-2 ${vencidos.indexOf(c) < vencidos.length-1 ? 'border-b border-red-100' : ''}">
          <div>
            <p class="text-sm text-red-900">${c.description}</p>
            <p class="text-xs text-red-400">Fecha: ${formatDate(c.dueDate)}</p>
          </div>
          <button onclick="changeStatus(${c.id},'cumplido')" class="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition">Marcar Cumplido</button>
        </div>`).join('')}
    </div>` : ''}
    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <h3 class="font-semibold text-gray-900 mb-3">Próximos compromisos</h3>
      ${vigentes.length ? vigentes.map(c => `
        <div class="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
          <div>
            <p class="text-sm text-gray-900">${c.description}</p>
            <p class="text-xs text-gray-400">${formatDate(c.dueDate)}${c.dueTime ? ' a las ' + c.dueTime : ''}</p>
          </div>
          ${statusBadge(c.status)}
        </div>`).join('') : '<p class="text-sm text-gray-400">Sin compromisos pendientes.</p>'}
    </div>
    ${sess.length ? `
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Última sesión: <strong class="text-gray-900">${formatDate(sess[0].date)}</strong></p>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2">${sess[0].summary}</p>
        </div>
        <button onclick="state.selectedPairId=${pair.id};navigate('sessions')" class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition whitespace-nowrap ml-4">Ver Detalle</button>
      </div>
    </div>` : ''}`;
}

function renderDashboardSuper() {
  const allC = COMMITMENTS;
  const total = allC.filter(c => ['cumplido','vencido','vigente'].includes(c.status)).length;
  const cumplidos = allC.filter(c => c.status === 'cumplido').length;
  const pct = total > 0 ? Math.round(cumplidos / total * 100) : 0;
  const activePairs = PAIRS.filter(p => p.active).length;
  const vencidos = allC.filter(c => c.status === 'vencido');

  const pairsWithVencidos = [...new Set(vencidos.map(c => c.pairId))].map(pid => {
    const p = getPairById(pid);
    const mentor = getUserById(p.mentorId);
    const mentee = getUserById(p.menteeId);
    const count = vencidos.filter(c => c.pairId === pid).length;
    return { mentor: mentor.name, mentee: mentee.name, count };
  });

  return `
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Panel de Seguimiento</h1>
    <p class="text-gray-500 mb-6">Programa de Mentoría — ${TENANT.name}</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      ${statCard(pct + '%', 'Cumplimiento compromisos', pct >= 70 ? 'green' : 'red')}
      ${statCard(activePairs, 'Pares activos', 'blue')}
      ${statCard(vencidos.length, 'Compromisos vencidos', 'red')}
    </div>
    ${pairsWithVencidos.length ? `
    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <h3 class="font-semibold text-gray-900 mb-3">Pares con compromisos vencidos</h3>
      ${pairsWithVencidos.map(p => `
        <div class="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
          <p class="text-sm text-gray-700">${p.mentor} → ${p.mentee}</p>
          <span class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">${p.count} vencido${p.count>1?'s':''}</span>
        </div>`).join('')}
    </div>` : ''}
    <div class="flex flex-wrap gap-3">
      <button onclick="navigate('commitments')" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Ver Auditoría Completa</button>
      <button onclick="navigate('reports')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Ver Reportes</button>
    </div>`;
}

// ============================================================
// USERS
// ============================================================
function renderUsers() {
  let filtered = [...USERS];
  if (state.userRoleFilter !== 'todos') filtered = filtered.filter(u => u.role === state.userRoleFilter);
  if (state.userStatusFilter !== 'todos') filtered = filtered.filter(u => state.userStatusFilter === 'activo' ? u.active : !u.active);

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
      <button onclick="openUserForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Nuevo Usuario</button>
    </div>
    <div class="flex flex-wrap gap-3 mb-4">
      <select onchange="state.userRoleFilter=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        <option value="todos" ${state.userRoleFilter==='todos'?'selected':''}>Todos los roles</option>
        <option value="admin" ${state.userRoleFilter==='admin'?'selected':''}>Admin</option>
        <option value="mentor" ${state.userRoleFilter==='mentor'?'selected':''}>Mentor</option>
        <option value="mentee" ${state.userRoleFilter==='mentee'?'selected':''}>Mentoreado</option>
        <option value="superuser" ${state.userRoleFilter==='superuser'?'selected':''}>Super Usuario</option>
      </select>
      <select onchange="state.userStatusFilter=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        <option value="todos" ${state.userStatusFilter==='todos'?'selected':''}>Todos los estados</option>
        <option value="activo" ${state.userStatusFilter==='activo'?'selected':''}>Activo</option>
        <option value="inactivo" ${state.userStatusFilter==='inactivo'?'selected':''}>Inactivo</option>
      </select>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th class="px-5 py-3">Nombre</th><th class="px-5 py-3">Email</th><th class="px-5 py-3">Rol</th><th class="px-5 py-3">Estado</th><th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            ${filtered.map(u => `<tr class="hover:bg-gray-50">
              <td class="px-5 py-3.5 text-sm font-medium text-gray-900">${u.name}</td>
              <td class="px-5 py-3.5 text-sm text-gray-500">${u.email}</td>
              <td class="px-5 py-3.5">${roleBadge(u.role)}</td>
              <td class="px-5 py-3.5"><span class="inline-block w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-400'}"></span> <span class="text-sm text-gray-600">${u.active ? 'Activo' : 'Inactivo'}</span></td>
              <td class="px-5 py-3.5 text-right space-x-2">
                <button onclick="showToast('Edición de usuario (simulado)')" class="text-blue-600 hover:underline text-sm">Editar</button>
                <button onclick="toggleUserActive(${u.id})" class="text-red-500 hover:underline text-sm">${u.active ? 'Desactivar' : 'Activar'}</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function openUserForm() {
  openModal('Nuevo Usuario', `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input id="new-user-name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre completo" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input id="new-user-email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@emin.cl" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Rol</label><select id="new-user-role" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        <option value="mentor">Mentor</option><option value="mentee">Mentoreado</option><option value="admin">Admin</option><option value="superuser">Super Usuario</option>
      </select></div>
      <div class="flex justify-end gap-3 pt-2">
        <button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button onclick="createUser()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Crear y Enviar Invitación</button>
      </div>
    </div>`);
}

function createUser() {
  const name = document.getElementById('new-user-name').value.trim();
  const email = document.getElementById('new-user-email').value.trim();
  const role = document.getElementById('new-user-role').value;
  if (!name || !email) { showToast('Completa todos los campos'); return; }
  USERS.push({ id: nextId(USERS), name, email, role, active: true });
  closeModal(); render(); showToast('Usuario creado — invitación enviada');
}

function toggleUserActive(id) {
  const u = getUserById(id);
  if (u) { u.active = !u.active; render(); showToast(u.active ? 'Usuario activado' : 'Usuario desactivado'); }
}

// ============================================================
// PAIRS
// ============================================================
function renderPairs() {
  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Pares Mentor-Mentoreado</h1>
      <button onclick="openPairForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Nuevo Par</button>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th class="px-5 py-3">Mentor</th><th class="px-5 py-3">Mentoreado</th><th class="px-5 py-3">Estado</th><th class="px-5 py-3">Sesiones</th><th class="px-5 py-3">Compromisos</th><th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            ${PAIRS.map(p => {
              const mentor = getUserById(p.mentorId);
              const mentee = getUserById(p.menteeId);
              const sessCount = SESSIONS.filter(s => s.pairId === p.id).length;
              const commCount = COMMITMENTS.filter(c => c.pairId === p.id).length;
              const vencidos = COMMITMENTS.filter(c => c.pairId === p.id && c.status === 'vencido').length;
              return `<tr class="hover:bg-gray-50">
                <td class="px-5 py-3.5 text-sm font-medium text-gray-900">${mentor.name}</td>
                <td class="px-5 py-3.5 text-sm text-gray-700">${mentee.name}</td>
                <td class="px-5 py-3.5"><span class="inline-block w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-gray-400'}"></span> <span class="text-sm">${p.active ? 'Activo' : 'Inactivo'}</span></td>
                <td class="px-5 py-3.5 text-sm text-gray-600">${sessCount}</td>
                <td class="px-5 py-3.5 text-sm text-gray-600">${commCount}${vencidos ? ` <span class="text-red-500">(${vencidos} vencido${vencidos>1?'s':''})</span>` : ''}</td>
                <td class="px-5 py-3.5 text-right"><button onclick="togglePairActive(${p.id})" class="text-red-500 hover:underline text-sm">${p.active ? 'Desactivar' : 'Activar'}</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function openPairForm() {
  const mentors = USERS.filter(u => u.role === 'mentor' && u.active);
  const mentees = USERS.filter(u => u.role === 'mentee' && u.active);
  openModal('Nuevo Par Mentor-Mentoreado', `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Mentor</label><select id="new-pair-mentor" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        ${mentors.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Mentoreado</label><select id="new-pair-mentee" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        ${mentees.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select></div>
      <div class="flex justify-end gap-3 pt-2">
        <button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button onclick="createPair()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Crear Par</button>
      </div>
    </div>`);
}

function createPair() {
  const mentorId = parseInt(document.getElementById('new-pair-mentor').value);
  const menteeId = parseInt(document.getElementById('new-pair-mentee').value);
  if (PAIRS.find(p => p.mentorId === mentorId && p.menteeId === menteeId)) { showToast('Este par ya existe'); return; }
  PAIRS.push({ id: nextId(PAIRS), mentorId, menteeId, active: true });
  closeModal(); render(); showToast('Par creado exitosamente');
}

function togglePairActive(id) {
  const p = getPairById(id);
  if (p) { p.active = !p.active; render(); showToast(p.active ? 'Par activado' : 'Par desactivado'); }
}

// ============================================================
// SESSIONS
// ============================================================
function renderSessions() {
  const role = state.currentRole;
  let sessions = [...SESSIONS].sort((a,b) => b.date.localeCompare(a.date));

  if (role === 'mentor') {
    const pairIds = getUserPairs(state.currentUser.id, 'mentor').map(p => p.id);
    sessions = sessions.filter(s => pairIds.includes(s.pairId));
  } else if (role === 'mentee') {
    const pairIds = getUserPairs(state.currentUser.id, 'mentee').map(p => p.id);
    sessions = sessions.filter(s => pairIds.includes(s.pairId));
  }

  // Filters for admin/superuser
  if ((role === 'admin' || role === 'superuser') && state.sessionMentorFilter !== 'todos') {
    const mid = parseInt(state.sessionMentorFilter);
    const pairIds = PAIRS.filter(p => p.mentorId === mid).map(p => p.id);
    sessions = sessions.filter(s => pairIds.includes(s.pairId));
  }

  const showPairCol = role === 'admin' || role === 'superuser';
  const canCreate = role === 'mentor';

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Sesiones de Mentoría</h1>
      ${canCreate ? `<button onclick="openSessionFormAuto()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Registrar Sesión</button>` : ''}
    </div>
    ${showPairCol ? `<div class="flex flex-wrap gap-3 mb-4">
      <select onchange="state.sessionMentorFilter=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        <option value="todos">Todos los mentores</option>
        ${USERS.filter(u=>u.role==='mentor').map(u => `<option value="${u.id}" ${state.sessionMentorFilter==u.id?'selected':''}>${u.name}</option>`).join('')}
      </select>
    </div>` : ''}
    <div class="space-y-3">
      ${sessions.length ? sessions.map(s => {
        const pair = getPairById(s.pairId);
        const mentor = getUserById(pair.mentorId);
        const mentee = getUserById(pair.menteeId);
        return `<div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-sm font-semibold text-gray-900">${formatDate(s.date)}</p>
              ${showPairCol ? `<p class="text-xs text-gray-400">${mentor.name} → ${mentee.name}</p>` : `<p class="text-xs text-gray-400">${role === 'mentor' ? mentee.name : mentor.name}</p>`}
            </div>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed">${s.summary}</p>
        </div>`;
      }).join('') : '<p class="text-gray-400 text-sm">No hay sesiones registradas.</p>'}
    </div>`;
}

function openSessionFormAuto() {
  const pairs = getUserPairs(state.currentUser.id, 'mentor');
  if (pairs.length === 1) { openSessionForm(pairs[0].id); return; }
  // If multiple pairs, let user pick
  openModal('Registrar Sesión', `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Mentoreado</label><select id="sess-pair-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        ${pairs.map(p => `<option value="${p.id}">${getUserById(p.menteeId).name}</option>`).join('')}
      </select></div>
      <div class="flex justify-end gap-3"><button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600">Cancelar</button><button onclick="closeModal();openSessionForm(parseInt(document.getElementById('sess-pair-select').value))" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Continuar</button></div>
    </div>`);
}

function openSessionForm(pairId) {
  const pair = getPairById(pairId);
  const mentee = getUserById(pair.menteeId);
  openModal('Registrar Sesión', `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Mentoreado</label><input type="text" value="${mentee.name}" disabled class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label><input id="sess-date" type="date" value="${today()}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Resumen de temas tratados</label><textarea id="sess-summary" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describe los temas conversados en la sesión..."></textarea></div>
      <input type="hidden" id="sess-pair-id" value="${pairId}" />
      <div class="flex justify-end gap-3 pt-2">
        <button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button onclick="createSession()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Guardar Sesión</button>
      </div>
    </div>`);
}

function createSession() {
  const pairId = parseInt(document.getElementById('sess-pair-id').value);
  const date = document.getElementById('sess-date').value;
  const summary = document.getElementById('sess-summary').value.trim();
  if (!summary || summary.length < 20) { showToast('El resumen debe tener al menos 20 caracteres'); return; }
  SESSIONS.push({ id: nextId(SESSIONS), pairId, date, summary, createdBy: state.currentUser.id });
  closeModal(); render(); showToast('Sesión registrada exitosamente');
}

// ============================================================
// COMMITMENTS
// ============================================================
function renderCommitments() {
  const role = state.currentRole;
  let comms = [...COMMITMENTS];
  let showPairCol = false;
  let canCreate = false;

  if (role === 'mentor') {
    const pairs = getUserPairs(state.currentUser.id, 'mentor');
    if (!state.selectedPairId && pairs.length) state.selectedPairId = pairs[0].id;
    comms = comms.filter(c => c.pairId === state.selectedPairId);
    canCreate = true;
  } else if (role === 'mentee') {
    const pairs = getUserPairs(state.currentUser.id, 'mentee');
    if (!state.selectedPairId && pairs.length) state.selectedPairId = pairs[0].id;
    comms = comms.filter(c => c.pairId === state.selectedPairId);
    canCreate = true;
  } else {
    showPairCol = true;
    if (state.commitmentMentorFilter !== 'todos') {
      const mid = parseInt(state.commitmentMentorFilter);
      const pairIds = PAIRS.filter(p => p.mentorId === mid).map(p => p.id);
      comms = comms.filter(c => pairIds.includes(c.pairId));
    }
    if (state.commitmentMenteeFilter !== 'todos') {
      const mid = parseInt(state.commitmentMenteeFilter);
      const pairIds = PAIRS.filter(p => p.menteeId === mid).map(p => p.id);
      comms = comms.filter(c => pairIds.includes(c.pairId));
    }
  }

  if (state.commitmentStatusFilter !== 'todos') {
    comms = comms.filter(c => c.status === state.commitmentStatusFilter);
  }

  comms = sortCommitments(comms);

  // Pair selector for mentor with multiple mentees
  let pairSelector = '';
  if (role === 'mentor') {
    const pairs = getUserPairs(state.currentUser.id, 'mentor');
    if (pairs.length > 1) {
      pairSelector = `<select onchange="state.selectedPairId=parseInt(this.value);render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        ${pairs.map(p => `<option value="${p.id}" ${state.selectedPairId===p.id?'selected':''}>${getUserById(p.menteeId).name}</option>`).join('')}
      </select>`;
    }
  }

  const canEdit = role === 'mentor' || role === 'mentee';

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900">${showPairCol ? 'Auditoría de Compromisos' : 'Compromisos'}</h1>
      <div class="flex flex-wrap gap-2">
        ${showPairCol ? `<button onclick="showToast('Descarga CSV iniciada (simulado)')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Exportar CSV</button>` : ''}
        ${canCreate ? `<button onclick="openCommitmentForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Nuevo Compromiso</button>` : ''}
      </div>
    </div>
    <div class="flex flex-wrap gap-3 mb-4">
      ${pairSelector}
      ${showPairCol ? `
        <select onchange="state.commitmentMentorFilter=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="todos">Todos los mentores</option>
          ${USERS.filter(u=>u.role==='mentor').map(u => `<option value="${u.id}" ${state.commitmentMentorFilter==u.id?'selected':''}>${u.name}</option>`).join('')}
        </select>
        <select onchange="state.commitmentMenteeFilter=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="todos">Todos los mentoreados</option>
          ${USERS.filter(u=>u.role==='mentee').map(u => `<option value="${u.id}" ${state.commitmentMenteeFilter==u.id?'selected':''}>${u.name}</option>`).join('')}
        </select>
      ` : ''}
      <select onchange="state.commitmentStatusFilter=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
        <option value="todos" ${state.commitmentStatusFilter==='todos'?'selected':''}>Todos los estatus</option>
        <option value="vigente" ${state.commitmentStatusFilter==='vigente'?'selected':''}>Vigente</option>
        <option value="vencido" ${state.commitmentStatusFilter==='vencido'?'selected':''}>Vencido</option>
        <option value="cumplido" ${state.commitmentStatusFilter==='cumplido'?'selected':''}>Cumplido</option>
        <option value="renegociado" ${state.commitmentStatusFilter==='renegociado'?'selected':''}>Renegociado</option>
        <option value="cancelado" ${state.commitmentStatusFilter==='cancelado'?'selected':''}>Cancelado</option>
      </select>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ${showPairCol ? '<th class="px-5 py-3">Mentor</th><th class="px-5 py-3">Mentoreado</th>' : ''}
            <th class="px-5 py-3">Descripción</th><th class="px-5 py-3">Cliente</th><th class="px-5 py-3">Realizador</th><th class="px-5 py-3">Fecha</th><th class="px-5 py-3">Estatus</th>${canEdit ? '<th class="px-5 py-3"></th>' : ''}
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            ${comms.length ? comms.map(c => {
              const pair = getPairById(c.pairId);
              const mentor = getUserById(pair.mentorId);
              const mentee = getUserById(pair.menteeId);
              const client = getUserById(c.clientId);
              const assignee = getUserById(c.assigneeId);
              const actions = [];
              if (canEdit && (c.status === 'vigente' || c.status === 'vencido')) {
                actions.push(`<button onclick="changeStatus(${c.id},'cumplido')" class="text-green-600 hover:underline text-xs">Cumplido</button>`);
                actions.push(`<button onclick="openRenegotiateModal(${c.id})" class="text-yellow-600 hover:underline text-xs">Renegociar</button>`);
              }
              if (canEdit && c.status === 'vigente') {
                actions.push(`<button onclick="if(confirm('¿Cancelar este compromiso?'))changeStatus(${c.id},'cancelado')" class="text-gray-500 hover:underline text-xs">Cancelar</button>`);
              }
              return `<tr class="hover:bg-gray-50 ${c.status === 'vencido' ? 'bg-red-50/50' : ''}">
                ${showPairCol ? `<td class="px-5 py-3.5 text-sm text-gray-700">${mentor.name}</td><td class="px-5 py-3.5 text-sm text-gray-700">${mentee.name}</td>` : ''}
                <td class="px-5 py-3.5 text-sm font-medium text-gray-900 max-w-xs">${c.description}</td>
                <td class="px-5 py-3.5 text-sm text-gray-600">${client ? client.name.split(' ')[0] : ''}</td>
                <td class="px-5 py-3.5 text-sm text-gray-600">${assignee ? assignee.name.split(' ')[0] : ''}</td>
                <td class="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">${formatDate(c.dueDate)}${c.dueTime ? ' ' + c.dueTime : ''}</td>
                <td class="px-5 py-3.5">${statusBadge(c.status)}</td>
                ${canEdit ? `<td class="px-5 py-3.5 text-right space-x-2">${actions.join(' ')}</td>` : ''}
              </tr>`;
            }).join('') : `<tr><td colspan="10" class="px-5 py-8 text-center text-gray-400 text-sm">No hay compromisos que coincidan con los filtros.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

function changeStatus(commitmentId, newStatus) {
  const c = COMMITMENTS.find(x => x.id === commitmentId);
  if (c) { c.status = newStatus; render(); showToast(`Compromiso marcado como ${newStatus}`); }
}

function openRenegotiateModal(commitmentId) {
  openModal('Renegociar Compromiso', `
    <p class="text-sm text-gray-600 mb-4">¿Deseas crear un nuevo compromiso con nueva fecha?</p>
    <div class="flex flex-col sm:flex-row justify-end gap-3">
      <button onclick="changeStatus(${commitmentId},'renegociado');closeModal()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Solo marcar como Renegociado</button>
      <button onclick="changeStatus(${commitmentId},'renegociado');closeModal();openCommitmentForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Sí, crear nuevo compromiso</button>
    </div>`);
}

function openCommitmentForm() {
  let pairId = state.selectedPairId;
  if (!pairId) {
    const pairs = getUserPairs(state.currentUser.id, state.currentRole);
    if (pairs.length) pairId = pairs[0].id;
  }
  if (!pairId) { showToast('No hay pares asignados'); return; }
  const pair = getPairById(pairId);
  const mentor = getUserById(pair.mentorId);
  const mentee = getUserById(pair.menteeId);

  openModal('Nuevo Compromiso', `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label><input id="new-comm-desc" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Descripción del compromiso" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Cliente (encarga)</label><select id="new-comm-client" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="${mentor.id}">${mentor.name}</option><option value="${mentee.id}">${mentee.name}</option>
        </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Realizador</label><select id="new-comm-assignee" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="${mentee.id}">${mentee.name}</option><option value="${mentor.id}">${mentor.name}</option>
        </select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha comprometida</label><input id="new-comm-date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Hora (opcional)</label><input id="new-comm-time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      </div>
      <input type="hidden" id="new-comm-pair" value="${pairId}" />
      <div class="flex justify-end gap-3 pt-2">
        <button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button onclick="createCommitment()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Crear Compromiso</button>
      </div>
    </div>`);
}

function createCommitment() {
  const desc = document.getElementById('new-comm-desc').value.trim();
  const clientId = parseInt(document.getElementById('new-comm-client').value);
  const assigneeId = parseInt(document.getElementById('new-comm-assignee').value);
  const dueDate = document.getElementById('new-comm-date').value;
  const dueTime = document.getElementById('new-comm-time').value || null;
  const pairId = parseInt(document.getElementById('new-comm-pair').value);
  if (!desc || !dueDate) { showToast('Completa la descripción y fecha'); return; }
  COMMITMENTS.push({ id: nextId(COMMITMENTS), pairId, description: desc, clientId, assigneeId, dueDate, dueTime, status: 'vigente', createdBy: state.currentUser.id });
  closeModal(); render(); showToast('Compromiso creado exitosamente');
}

// ============================================================
// FILES
// ============================================================
function renderFiles() {
  const role = state.currentRole;
  const isAdmin = role === 'admin';
  let filtered = [...FILES];
  if (state.fileSearch) {
    const q = state.fileSearch.toLowerCase();
    filtered = filtered.filter(f => f.name.toLowerCase().includes(q));
  }

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Archivos</h1>
      ${isAdmin ? `<button onclick="openFileForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Subir Archivo</button>` : ''}
    </div>
    <div class="mb-4">
      <input type="text" placeholder="Buscar por nombre..." value="${state.fileSearch}" oninput="state.fileSearch=this.value;render()" class="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
    <div class="space-y-3">
      ${filtered.map(f => `
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div class="flex-shrink-0">${fileIcon(f.name)}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">${f.name}</p>
            <p class="text-xs text-gray-400">${f.description || ''}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xs text-gray-400">${formatDate(f.date)}</p>
            <p class="text-xs text-gray-400">${f.size}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button onclick="showToast('Descarga iniciada (simulado)')" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition">Descargar</button>
            ${isAdmin ? `<button onclick="deleteFile(${f.id})" class="px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition">Eliminar</button>` : ''}
          </div>
        </div>
      `).join('')}
      ${!filtered.length ? '<p class="text-gray-400 text-sm text-center py-8">No se encontraron archivos.</p>' : ''}
    </div>`;
}

function openFileForm() {
  openModal('Subir Archivo', `
    <div class="space-y-4">
      <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition" onclick="document.getElementById('file-input-fake').click()">
        <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
        <p class="text-sm text-gray-500">Arrastra aquí o haz click para seleccionar</p>
        <p class="text-xs text-gray-400 mt-1">PDF, PPTX, DOCX, XLSX, imágenes (max 50 MB)</p>
        <input type="file" id="file-input-fake" class="hidden" onchange="document.getElementById('new-file-name').value=this.files[0]?.name||''" />
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input id="new-file-name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre del archivo" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label><input id="new-file-desc" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Breve descripción" /></div>
      <div class="flex justify-end gap-3 pt-2">
        <button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button onclick="createFile()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Subir</button>
      </div>
    </div>`);
}

function createFile() {
  const name = document.getElementById('new-file-name').value.trim();
  const desc = document.getElementById('new-file-desc').value.trim();
  if (!name) { showToast('Ingresa un nombre de archivo'); return; }
  FILES.unshift({ id: nextId(FILES), name, description: desc, date: today(), size: '1.2 MB' });
  closeModal(); render(); showToast('Archivo subido exitosamente');
}

function deleteFile(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;
  const idx = FILES.findIndex(f => f.id === id);
  if (idx > -1) { FILES.splice(idx, 1); render(); showToast('Archivo eliminado'); }
}

// ============================================================
// REPORTS
// ============================================================
function renderReports() {
  const monthLabel = { '2026-03': 'Marzo 2026', '2026-02': 'Febrero 2026', '2026-04': 'Abril 2026' };
  const period = state.reportPeriod;
  const periodSessions = SESSIONS.filter(s => s.date.startsWith(period));
  const periodCommitments = COMMITMENTS; // Simplified: show all

  const cumplidos = periodCommitments.filter(c => c.status === 'cumplido').length;
  const vencidos = periodCommitments.filter(c => c.status === 'vencido').length;
  const totalRelevant = periodCommitments.filter(c => ['cumplido','vencido','vigente'].includes(c.status)).length;

  const pairStats = PAIRS.filter(p => p.active).map(p => {
    const mentor = getUserById(p.mentorId);
    const mentee = getUserById(p.menteeId);
    const sess = SESSIONS.filter(s => s.pairId === p.id && s.date.startsWith(period)).length;
    const cump = COMMITMENTS.filter(c => c.pairId === p.id && c.status === 'cumplido').length;
    const venc = COMMITMENTS.filter(c => c.pairId === p.id && c.status === 'vencido').length;
    const total = cump + venc + COMMITMENTS.filter(c => c.pairId === p.id && c.status === 'vigente').length;
    const pct = total > 0 ? Math.round(cump / total * 100) : 0;
    return { mentor: mentor.name, mentee: mentee.name, sess, cump, venc, pct };
  });

  const inactive = pairStats.filter(p => p.sess === 0 && p.cump === 0);

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Reporte Mensual</h1>
      <div class="flex gap-2">
        <select onchange="state.reportPeriod=this.value;render()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="2026-03" ${period==='2026-03'?'selected':''}>Marzo 2026</option>
          <option value="2026-04" ${period==='2026-04'?'selected':''}>Abril 2026</option>
        </select>
        <button onclick="showToast('Descarga PDF iniciada (simulado)')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Exportar PDF</button>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      ${statCard(periodSessions.length, 'Sesiones registradas', 'blue')}
      ${statCard(cumplidos, 'Compromisos cumplidos', 'green')}
      ${statCard(vencidos, 'Compromisos vencidos', 'red')}
    </div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-semibold text-gray-900">Cumplimiento por par</h3></div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th class="px-5 py-3">Par</th><th class="px-5 py-3">Sesiones</th><th class="px-5 py-3">Cumplidos</th><th class="px-5 py-3">Vencidos</th><th class="px-5 py-3">% Cumplimiento</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            ${pairStats.map(p => `<tr class="hover:bg-gray-50">
              <td class="px-5 py-3.5 text-sm font-medium text-gray-900">${p.mentor} → ${p.mentee}</td>
              <td class="px-5 py-3.5 text-sm text-gray-600">${p.sess}</td>
              <td class="px-5 py-3.5 text-sm text-green-600">${p.cump}</td>
              <td class="px-5 py-3.5 text-sm ${p.venc ? 'text-red-600' : 'text-gray-600'}">${p.venc}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"><div class="h-full rounded-full ${p.pct >= 70 ? 'bg-green-500' : p.pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}" style="width:${p.pct}%"></div></div>
                  <span class="text-sm ${p.pct < 70 ? 'text-red-600' : 'text-gray-700'}">${p.pct}%</span>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ${inactive.length ? `
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
      <h3 class="font-semibold text-yellow-800 mb-2">Pares sin actividad en el periodo</h3>
      <ul class="space-y-1">${inactive.map(p => `<li class="text-sm text-yellow-700">${p.mentor} → ${p.mentee}</li>`).join('')}</ul>
    </div>` : ''}`;
}

// ============================================================
// CONFIG
// ============================================================
function renderConfig() {
  return `
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
    <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6 max-w-2xl">
      <div>
        <h3 class="font-semibold text-gray-900 mb-4">Branding</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
            <input type="text" value="${TENANT.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL del tenant</label>
            <input type="text" value="${TENANT.slug}.mentores.cl" disabled class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center"><span class="text-white font-bold">E</span></div>
              <button class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50">Cambiar logo</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color primario</label>
            <div class="flex items-center gap-2">
              <input type="color" value="${TENANT.primaryColor}" class="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
              <input type="text" value="${TENANT.primaryColor}" class="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>
      </div>
      <hr class="border-gray-200" />
      <div>
        <h3 class="font-semibold text-gray-900 mb-4">Notificaciones</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Frecuencia recordatorios</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option selected>Semanal</option><option>Quincenal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Umbral alerta incumplimiento</label>
            <div class="flex items-center gap-2">
              <input type="number" value="2" min="1" max="10" class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <span class="text-sm text-gray-500">compromisos vencidos</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email del consultor</label>
            <input type="email" value="${TENANT.consultantEmail}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL agendamiento</label>
            <input type="url" value="${TENANT.schedulingUrl}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </div>
      <div class="flex justify-end pt-2">
        <button onclick="showToast('Configuración guardada (simulado)')" class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Guardar Cambios</button>
      </div>
    </div>`;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  render();
});
