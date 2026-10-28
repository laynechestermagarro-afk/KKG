// ========== User Database + Permissions ==========
    const ALL_PERMS = {
      'customers.view': 'View Customers',
      'customers.add': 'Add Customer',
      'customers.edit': 'Edit Customer',
      'customers.delete': 'Delete Customer',
      'products.view': 'View Products',
      'products.add': 'Add Product',
      'products.edit': 'Edit Product',
      'products.delete': 'Delete Product',
      'products.priceAdd': 'Add Price',
      'products.priceEdit': 'Edit Price',
      'products.priceDelete': 'Delete Price',
      'hr.view': 'View Human Resources',
      'hr.jobAdd': 'Add Job',
      'hr.jobEdit': 'Edit Job',
      'hr.jobDelete': 'Delete Job',
      'hr.deptAdd': 'Add Department',
      'hr.deptEdit': 'Edit Department',
      'hr.deptDelete': 'Delete Department',
      'hr.empAdd': 'Add Employee',
      'hr.empEdit': 'Edit Employee',
      'hr.empDelete': 'Delete Employee',
      'hr.jhView': 'View Job History',
      'hr.jhAdd': 'Add Job History',
      'hr.jhEdit': 'Edit Job History',
      'hr.jhDelete': 'Delete Job History',
      'sales.view': 'View Sales',
      'sales.add': 'Add Sale',
      'sales.edit': 'Edit Sale',
      'sales.delete': 'Delete Sale',
      'sales.detailView': 'View Sale Details',
      'sales.detailAdd': 'Add Sale Detail',
      'sales.detailEdit': 'Edit Sale Detail',
      'sales.detailDelete': 'Delete Sale Detail',
      'reports.view': 'View Reports',
      'reports.topCustomers': 'Top Customers',
      'reports.productMaster': 'Product Master List',
      'reports.topProducts': 'Top Products',
      'reports.activeEmployees': 'Active Employees',
      'reports.allEmployees': 'All Employees',
      'reports.empJobHistory': 'Employee Job History',
      'reports.topSales': 'Top Sales',
    };
    const PERM_GROUPS = [
      { key: 'customers', label: 'Customer Management', view: 'customers.view',
        items: ['customers.add','customers.edit','customers.delete'] },
      { key: 'products', label: 'Product Management', view: 'products.view',
        items: ['products.add','products.edit','products.delete','products.priceAdd','products.priceEdit','products.priceDelete'] },
      { key: 'hr', label: 'Human Resources', view: 'hr.view',
        items: ['hr.jobAdd','hr.jobEdit','hr.jobDelete','hr.deptAdd','hr.deptEdit','hr.deptDelete',
                'hr.empAdd','hr.empEdit','hr.empDelete','hr.jhView','hr.jhAdd','hr.jhEdit','hr.jhDelete'] },
      { key: 'sales', label: 'Sales', view: 'sales.view',
        items: ['sales.add','sales.edit','sales.delete','sales.detailView','sales.detailAdd','sales.detailEdit','sales.detailDelete'] },
      { key: 'reports', label: 'Reports', view: 'reports.view',
        items: ['reports.topCustomers','reports.productMaster','reports.topProducts','reports.activeEmployees',
                'reports.allEmployees','reports.empJobHistory','reports.topSales'] },
    ];
    function fullPerms() {
      const p = {};
      Object.keys(ALL_PERMS).forEach(k => p[k] = true);
      return p;
    }
    function emptyPerms() {
      const p = {};
      Object.keys(ALL_PERMS).forEach(k => p[k] = false);
      return p;
    }
    // Sample user: customers + products view/add/edit, no delete, limited reports
    function sampleUserPerms() {
      const p = emptyPerms();
      ['customers.view','customers.add','customers.edit',
       'products.view','products.add','products.edit',
       'sales.view','sales.detailView',
       'reports.view','reports.productMaster','reports.topSales'].forEach(k => p[k] = true);
      return p;
    }

    const DEFAULT_USERS = [
      { email: 'superadmin@hope.com', firstName: 'Sarah', lastName: 'Chen', role: 'superadmin', status: 'active', perms: fullPerms() },
      { email: 'ceo@hope.com',        firstName: 'Michael', lastName: 'Reyes', role: 'superadmin', status: 'active', perms: fullPerms() },
      { email: 'admin@hope.com',      firstName: 'Lisa', lastName: 'Park', role: 'admin', status: 'active', perms: fullPerms() },
      { email: 'manager@hope.com',    firstName: 'David', lastName: 'Kim', role: 'admin', status: 'active', perms: fullPerms() },
      { email: 'user@hope.com',       firstName: 'Alex', lastName: 'Rivera', role: 'user', status: 'active', perms: sampleUserPerms() },
    ];
    const DEMO_ANY_PASSWORD_EMAILS = new Set([
      'superadmin@hope.com', 'admin@hope.com', 'user@hope.com'
    ]);

    let memoryUsers = null;

    function getUsers() {
      try {
        const stored = localStorage.getItem('hope_erp_users_v3');
        if (stored) return JSON.parse(stored);
        localStorage.setItem('hope_erp_users_v3', JSON.stringify(DEFAULT_USERS));
        return [...DEFAULT_USERS];
      } catch (e) {
        if (!memoryUsers) memoryUsers = [...DEFAULT_USERS];
        return memoryUsers;
      }
    }
    function saveUsers(users) {
      try { localStorage.setItem('hope_erp_users_v3', JSON.stringify(users)); }
      catch (e) { memoryUsers = users; }
    }
    function findUser(email) {
      return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    function upsertUser(user) {
      const users = getUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) users[idx] = user;
      else users.push(user);
      saveUsers(users);
    }
    // Permission check for current user
    function can(perm) {
      if (!currentUser) return false;
      if (currentUser.role === 'superadmin' || currentUser.role === 'admin') return true;
      const u = findUser(currentUser.email);
      if (!u || !u.perms) return false;
      return !!u.perms[perm];
    }
    function canModule(mod) {
      return can(mod + '.view');
    }

    // ========== Current user state ==========
    let currentUser = null;
    const SESSION_KEY = 'hope_erp_session_v1';

    function saveSession(email, rememberMe) {
      const session = JSON.stringify({ email });
      try {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        (rememberMe ? localStorage : sessionStorage).setItem(SESSION_KEY, session);
      } catch (err) {
        console.warn('Session could not be persisted in this browser.', err);
      }
    }

    function clearSession() {
      try {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      } catch (err) {
        console.warn('Session storage could not be cleared.', err);
      }
    }

    function restoreSession() {
      try {
        const rawSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
        if (!rawSession) return;
        const { email } = JSON.parse(rawSession);
        const user = email && findUser(email);
        if (!user || (user.status || 'active') !== 'active') {
          clearSession();
          return;
        }
        currentUser = {
          email: user.email,
          name: (user.firstName + ' ' + (user.lastName || '')).trim(),
          role: user.role,
          firstName: user.firstName || 'User'
        };
        showDashboard();
      } catch (err) {
        clearSession();
      }
    }

    // ========== Modal Controls ==========
    function openModal(name) {
      if (name === 'reset') {
        document.getElementById('resetDemoLink').hidden = true;
        document.getElementById('resetSuccess').classList.remove('show');
        document.getElementById('resetError').classList.remove('show');
        activePasswordReset = null;
      }
      document.getElementById(name + 'Modal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(name) {
      const modal = document.getElementById(name + 'Modal');
      if (modal) modal.classList.remove('active');
      // Also clear any leftover active modals
      const anyActive = document.querySelector('.modal-overlay.active');
      if (!anyActive) document.body.style.overflow = '';
      const error = document.getElementById(name + 'Error');
      const success = document.getElementById(name + 'Success');
      if (error) { error.classList.remove('show'); error.textContent = ''; }
      if (success) { success.classList.remove('show'); success.textContent = ''; }
    }
    function switchModal(from, to) {
      closeModal(from);
      setTimeout(() => openModal(to), 200);
    }
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id.replace('Modal', ''));
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['login','register','reset','setPassword'].forEach(closeModal);
        closeCustomerModal();
      }
    });
    // Close customer modal on overlay click
    document.getElementById('customerModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('customerModal')) closeCustomerModal();
    });

    function togglePassword(inputId, btn) {
      const input = document.getElementById(inputId);
      if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
      else { input.type = 'password'; btn.textContent = '👁'; }
    }

    // ========== Auth handlers ==========
    // This localStorage prototype is for UI development only; production auth
    // and password recovery must be handled by Supabase Auth.
    let activePasswordReset = null;

    function bytesToBase64(bytes) {
      return btoa(String.fromCharCode(...bytes));
    }

    function base64ToBytes(value) {
      return Uint8Array.from(atob(value), char => char.charCodeAt(0));
    }

    async function hashPassword(password, saltValue) {
      if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Secure password hashing is unavailable. Open this demo on localhost or HTTPS.');
      }
      const salt = saltValue ? base64ToBytes(saltValue) : window.crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, keyMaterial, 256);
      return { passwordSalt: bytesToBase64(salt), passwordHash: bytesToBase64(new Uint8Array(bits)) };
    }

    async function verifyPassword(user, password) {
      if (DEMO_ANY_PASSWORD_EMAILS.has(user.email.toLowerCase())) return true;
      if (!user.passwordHash || !user.passwordSalt) return false;
      const candidate = await hashPassword(password, user.passwordSalt);
      return candidate.passwordHash === user.passwordHash;
    }

    async function handleLogin(e) {
      if (e) e.preventDefault();
      try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const successEl = document.getElementById('loginSuccess');
        errorEl.classList.remove('show');
        successEl.classList.remove('show');

        if (!email || !password) {
          errorEl.textContent = 'Please fill in all fields.';
          errorEl.classList.add('show');
          return;
        }

        const user = findUser(email);
        if (!user || !(await verifyPassword(user, password))) {
          errorEl.textContent = 'Email or password is incorrect.';
          errorEl.classList.add('show');
          return;
        }

        // Normalize legacy users missing status/perms
        if (!user.status) user.status = 'active';
        if (!user.perms) {
          user.perms = (user.role === 'superadmin' || user.role === 'admin') ? fullPerms() : sampleUserPerms();
          upsertUser(user);
        }

        if (user.status === 'blocked') {
          errorEl.textContent = 'This account is blocked. Contact an administrator.';
          errorEl.classList.add('show');
          return;
        }
        if (user.status === 'pending') {
          errorEl.textContent = 'This account is pending approval. Contact an administrator.';
          errorEl.classList.add('show');
          return;
        }
        if (user.status === 'disapproved') {
          errorEl.textContent = 'This registration was not approved.';
          errorEl.classList.add('show');
          return;
        }

        currentUser = {
          email: user.email,
          name: (user.firstName + ' ' + (user.lastName || '')).trim(),
          role: user.role,
          firstName: user.firstName || 'User'
        };
        saveSession(user.email, document.getElementById('rememberMe').checked);

        // Close ALL modals and show dashboard
        ['login', 'register', 'reset', 'setPassword'].forEach(n => {
          const m = document.getElementById(n + 'Modal');
          if (m) m.classList.remove('active');
        });
        document.body.style.overflow = '';
        showDashboard();
      } catch (err) {
        console.error('Login error:', err);
        const errorEl = document.getElementById('loginError');
        if (errorEl) {
          errorEl.textContent = 'Login failed: ' + err.message;
          errorEl.classList.add('show');
        }
      }
    }

    async function handleRegister(e) {
      if (e) e.preventDefault();
      try {
        const firstName = document.getElementById('regFirstName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const errorEl = document.getElementById('registerError');
        const successEl = document.getElementById('registerSuccess');

        errorEl.classList.remove('show');
        successEl.classList.remove('show');

        if (!firstName || !lastName || !email || !password || !passwordConfirm) {
          errorEl.textContent = 'Please fill in all fields.';
          errorEl.classList.add('show');
          return;
        }
        if (password.length < 8) {
          errorEl.textContent = 'Password must be at least 8 characters.';
          errorEl.classList.add('show');
          return;
        }
        if (password !== passwordConfirm) {
          errorEl.textContent = 'Passwords do not match.';
          errorEl.classList.add('show');
          return;
        }

        if (findUser(email)) {
          errorEl.textContent = 'An account with this email already exists. Please sign in.';
          errorEl.classList.add('show');
          return;
        }

        const passwordCredentials = await hashPassword(password);
        const newUser = { email, firstName, lastName, role: 'user', status: 'pending', perms: emptyPerms(), ...passwordCredentials };
        upsertUser(newUser);

        successEl.textContent = 'Registration submitted. An admin must approve your account before you can sign in.';
        successEl.classList.add('show');
        document.getElementById('registerForm').reset();
      } catch (err) {
        console.error('Register error:', err);
        const errorEl = document.getElementById('registerError');
        if (errorEl) {
          errorEl.textContent = 'Registration failed: ' + err.message;
          errorEl.classList.add('show');
        }
      }
    }

    function handleReset(e) {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();
      const errorEl = document.getElementById('resetError');
      const successEl = document.getElementById('resetSuccess');

      errorEl.classList.remove('show');
      successEl.classList.remove('show');

      if (!email) {
        errorEl.textContent = 'Please enter your email address.';
        errorEl.classList.add('show');
        return;
      }
      const user = findUser(email);
      activePasswordReset = user ? { email: user.email, token: window.crypto.randomUUID() } : null;
      successEl.textContent = 'If an account exists for this email, password reset instructions are available.';
      successEl.classList.add('show');
      document.getElementById('resetDemoLink').hidden = !activePasswordReset;
      document.getElementById('resetForm').reset();
    }

    function openSetPassword() {
      if (!activePasswordReset) return;
      document.getElementById('setPasswordEmail').value = activePasswordReset.email;
      document.getElementById('setPasswordForm').reset();
      document.getElementById('setPasswordError').classList.remove('show');
      switchModal('reset', 'setPassword');
    }

    async function handleSetPassword(e) {
      e.preventDefault();
      const errorEl = document.getElementById('setPasswordError');
      errorEl.classList.remove('show');
      const password = document.getElementById('newPassword').value;
      const confirmation = document.getElementById('newPasswordConfirm').value;
      const email = document.getElementById('setPasswordEmail').value;

      if (!activePasswordReset || activePasswordReset.email !== email) {
        errorEl.textContent = 'This reset session has expired. Request a new password reset.';
        errorEl.classList.add('show');
        return;
      }
      if (password.length < 8) {
        errorEl.textContent = 'Password must be at least 8 characters.';
        errorEl.classList.add('show');
        return;
      }
      if (password !== confirmation) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.add('show');
        return;
      }

      try {
        const user = findUser(email);
        if (!user) throw new Error('Account not found.');
        Object.assign(user, await hashPassword(password));
        upsertUser(user);
        activePasswordReset = null;
        closeModal('setPassword');
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = '';
        const loginSuccess = document.getElementById('loginSuccess');
        loginSuccess.textContent = 'Password updated. Sign in with your new password.';
        loginSuccess.classList.add('show');
        openModal('login');
      } catch (err) {
        errorEl.textContent = err.message || 'Unable to update password.';
        errorEl.classList.add('show');
      }
    }

    // ========== Dashboard ==========
    function showDashboard() {
      // Force-close every auth modal so nothing sits on top of the dashboard
      ['login', 'register', 'reset', 'setPassword'].forEach(name => {
        const el = document.getElementById(name + 'Modal');
        if (el) el.classList.remove('active');
      });
      document.body.style.overflow = '';

      document.getElementById('landing').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      renderSidebar();
      renderDashboardHome();
      updateUserInfo();
    }

    function logout() {
      currentUser = null;
      clearSession();
      document.getElementById('dashboard').style.display = 'none';
      document.getElementById('landing').style.display = 'block';
    }

    function updateUserInfo() {
      if (!currentUser) return;
      document.getElementById('userName').textContent = currentUser.name;
      document.getElementById('userRoleLabel').textContent = currentUser.role;
      document.getElementById('userAvatar').textContent = (currentUser.firstName[0] || 'U').toUpperCase();

      const badge = document.getElementById('roleBadge');
      badge.textContent = currentUser.role;
      badge.className = 'role-badge role-' + currentUser.role;
    }

    function renderSidebar() {
      const nav = document.getElementById('sidebarNav');
      const role = currentUser.role;

      // Only items the current role is allowed to see will be rendered
      const items = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', roles: ['superadmin','admin','user'] },
        { section: 'Modules' },
        { id: 'customers', icon: '👥', label: 'Customers', roles: ['superadmin','admin','user'] },
        { id: 'products', icon: '📦', label: 'Inventory', roles: ['superadmin','admin','user'] },
        { id: 'hr', icon: '🧑‍💼', label: 'Shop Team', roles: ['superadmin','admin','user'] },
        { id: 'sales', icon: '🛠️', label: 'Sales & Repairs', roles: ['superadmin','admin','user'] },
        { id: 'reports', icon: '📊', label: 'Reports', roles: ['superadmin','admin','user'] },
        { section: 'Administration' },
        { id: 'users', icon: '🔐', label: 'User Management', roles: ['superadmin','admin'] },
        { id: 'settings', icon: '⚙️', label: 'Database Connection', roles: ['superadmin','admin'] },
      ];

      let html = '';
      let pendingSection = null;

      items.forEach(item => {
        if (item.section) {
          pendingSection = item.section; // remember section, only print if an item follows
          return;
        }

        // Skip entirely if role is not allowed
        if (!item.roles.includes(role)) return;
        // Permission-aware navigation for every role (admins pass via can()).
        if (['customers','products','hr','sales','reports'].includes(item.id)) {
          if (!canModule(item.id)) return;
        }

        // Print pending section header only when we actually have an item to show
        if (pendingSection) {
          html += `<div class="nav-section"><div class="nav-section-title">${pendingSection}</div>`;
          pendingSection = null;
        }

        html += `<div class="nav-item" onclick="navigateTo('${item.id}')" data-id="${item.id}">
          <span class="icon">${item.icon}</span> ${item.label}
        </div>`;
      });

      nav.innerHTML = html;

      // Set active
      const active = nav.querySelector('[data-id="dashboard"]');
      if (active) active.classList.add('active');
    }

    function navigateTo(page) {
      const modulePages = ['customers', 'products', 'hr', 'sales', 'reports'];
      if (!currentUser || (modulePages.includes(page) && !canModule(page)) ||
          (['users', 'settings'].includes(page) && !['superadmin', 'admin'].includes(currentUser.role))) {
        document.getElementById('contentArea').innerHTML = '<div class="empty-state">Access denied. This page is not assigned to your account.</div>';
        return;
      }

      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const el = document.querySelector(`[data-id="${page}"]`);
      if (el) el.classList.add('active');

      document.getElementById('pageTitle').textContent = {
        dashboard: 'Dashboard',
        customers: 'Shop Customers',
        products: 'Computer Inventory',
        hr: 'Shop Team',
        sales: 'Sales & Repairs',
        reports: 'Reports',
        users: 'User Management',
        settings: 'Database Connection'
      }[page] || page;

      if (page === 'dashboard') renderDashboardHome();
      else if (page === 'customers') renderCustomers();
      else if (page === 'products') renderProducts();
      else if (page === 'hr') renderHR();
      else if (page === 'sales') renderSales();
      else if (page === 'reports') renderReports();
      else if (page === 'users') renderUserManagement();
      else if (page === 'settings') renderDatabaseSettings();
      else renderModulePlaceholder(page);
    }

    // ========== CUSTOMERS MODULE ==========
    const DEFAULT_CUSTOMERS = [
      { custNo: 'C-001', custName: 'Northstar Gaming Lounge', address: '123 Main St, Metro City', payterms: 'Net 30', isDeleted: false, stamp: 'CREATED system 2026-10-01 9:00 AM' },
      { custNo: 'C-002', custName: 'PixelPoint Studio', address: '456 Oak Ave, Harbor Town', payterms: 'Net 45', isDeleted: false, stamp: 'CREATED system 2026-10-02 10:15 AM' },
      { custNo: 'C-003', custName: 'Jordan Lee', address: '789 Pine Rd, Silicon Valley', payterms: 'COD', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { custNo: 'C-004', custName: 'ByteWorks IT Supply', address: '1 Raccoon City Blvd', payterms: 'Prepaid', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
      { custNo: 'C-005', custName: 'Maya Patel', address: '200 Park Avenue, New York', payterms: 'Net 15', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
    ];

    let memoryCustomers = null;
    let customerFilter = 'active'; // 'active' | 'deleted' | 'all'
    let customerSearch = '';

    function getCustomers() {
      try {
        // v3 loads computer-shop sample customers while preserving user edits in this version.
        const stored = localStorage.getItem('hope_erp_customers_v3');
        if (stored) return JSON.parse(stored);
        localStorage.setItem('hope_erp_customers_v3', JSON.stringify(DEFAULT_CUSTOMERS));
        return [...DEFAULT_CUSTOMERS];
      } catch (e) {
        if (!memoryCustomers) memoryCustomers = [...DEFAULT_CUSTOMERS];
        return memoryCustomers;
      }
    }

    function saveCustomers(list) {
      try {
        localStorage.setItem('hope_erp_customers_v3', JSON.stringify(list));
      } catch (e) {
        memoryCustomers = list;
      }
    }

    function makeStamp(action) {
      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const who = (currentUser && currentUser.firstName) ? currentUser.firstName.toLowerCase().replace(/\s+/g, '') : 'user';
      return `${action} ${who} ${date} ${hours}:${mins} ${ampm}`;
    }

    function renderCustomers() {
      const area = document.getElementById('contentArea');
      const role = currentUser.role;
      const canRestore = role === 'superadmin' || role === 'admin';
      const canSeeDeleted = canRestore;

      let list = getCustomers();

      // Regular users never see soft-deleted records
      if (!canSeeDeleted) {
        list = list.filter(c => !c.isDeleted);
      } else {
        if (customerFilter === 'active') list = list.filter(c => !c.isDeleted);
        else if (customerFilter === 'deleted') list = list.filter(c => c.isDeleted);
        // 'all' → no filter
      }

      if (customerSearch) {
        const q = customerSearch.toLowerCase();
        list = list.filter(c =>
          c.custNo.toLowerCase().includes(q) ||
          c.custName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.payterms.toLowerCase().includes(q)
        );
      }

      const totalAll = getCustomers().length;
      const totalActive = getCustomers().filter(c => !c.isDeleted).length;
      const totalDeleted = getCustomers().filter(c => c.isDeleted).length;

      const colCount = canSeeDeleted ? 7 : 5;

      let rows = '';
      if (list.length === 0) {
        rows = `<tr><td colspan="${colCount}"><div class="empty-state">No customers found.<p>Try a different filter or add a new customer.</p></div></td></tr>`;
      } else {
        list.forEach(c => {
          let actions = '';
          if (c.isDeleted) {
            if (canRestore) {
              actions = `<button class="btn-restore" onclick="restoreCustomer('${c.custNo}')">Restore</button>`;
            } else {
              actions = '—';
            }
          } else {
            actions = `
              ${can('customers.edit') ? `<button class="btn-edit" onclick="openEditCustomer('${c.custNo}')">Edit</button>` : ''}
              ${can('customers.delete') ? `<button class="btn-del" onclick="softDeleteCustomer('${c.custNo}')">Delete</button>` : ''}
              ${!can('customers.edit') && !can('customers.delete') ? '—' : ''}
            `;
          }

          // Users: no Status or Stamp columns
          const adminCols = canSeeDeleted ? `
              <td>${c.isDeleted
                ? '<span class="badge badge-deleted">Inactive</span>'
                : '<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${c.stamp || '—'}</div></td>
          ` : '';

          rows += `
            <tr class="${c.isDeleted ? 'deleted-row' : ''}">
              <td><strong>${c.custNo}</strong></td>
              <td>${c.custName}</td>
              <td>${c.address}</td>
              <td>${c.payterms}</td>
              ${adminCols}
              <td><div class="action-btns">${actions}</div></td>
            </tr>`;
        });
      }

      const filterTabs = canSeeDeleted ? `
        <div class="filter-tabs">
          <button class="filter-tab ${customerFilter === 'active' ? 'active' : ''}" onclick="setCustomerFilter('active')">Active (${totalActive})</button>
          <button class="filter-tab ${customerFilter === 'deleted' ? 'active' : ''}" onclick="setCustomerFilter('deleted')">Inactive (${totalDeleted})</button>
          <button class="filter-tab ${customerFilter === 'all' ? 'active' : ''}" onclick="setCustomerFilter('all')">All (${totalAll})</button>
        </div>
      ` : '';

      const headerCols = canSeeDeleted
        ? `<th>Cust No</th><th>Customer Name</th><th>Address</th><th>Pay Terms</th><th>Status</th><th>Stamp</th><th>Actions</th>`
        : `<th>Cust No</th><th>Customer Name</th><th>Address</th><th>Pay Terms</th><th>Actions</th>`;

      area.innerHTML = `
        <div class="module-toolbar">
          <h3>Customer Management</h3>
          <div class="toolbar-right">
            ${filterTabs}
            <input type="text" class="search-input" placeholder="Search customers..." value="${customerSearch}"
              oninput="customerSearch=this.value; renderCustomers();" />
            ${can('customers.add') ? `<button class="btn btn-primary btn-sm" onclick="openAddCustomer()">+ Add Customer</button>` : ''}
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>${headerCols}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    function setCustomerFilter(f) {
      customerFilter = f;
      renderCustomers();
    }

    function openAddCustomer() {
      document.getElementById('customerModalTitle').textContent = 'Add Customer';
      document.getElementById('customerModalSub').textContent = 'Enter new customer details';
      document.getElementById('customerSaveBtn').textContent = 'Save Customer';
      document.getElementById('custEditNo').value = '';
      document.getElementById('custNo').value = '';
      document.getElementById('custNo').readOnly = false;
      document.getElementById('custName').value = '';
      document.getElementById('custAddress').value = '';
      document.getElementById('custPayterms').value = '';
      document.getElementById('customerError').classList.remove('show');
      document.getElementById('customerModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function openEditCustomer(custNo) {
      const c = getCustomers().find(x => x.custNo === custNo);
      if (!c || c.isDeleted) return;
      document.getElementById('customerModalTitle').textContent = 'Edit Customer';
      document.getElementById('customerModalSub').textContent = 'Update customer details';
      document.getElementById('customerSaveBtn').textContent = 'Update Customer';
      document.getElementById('custEditNo').value = c.custNo;
      document.getElementById('custNo').value = c.custNo;
      document.getElementById('custNo').readOnly = true;
      document.getElementById('custName').value = c.custName;
      document.getElementById('custAddress').value = c.address;
      document.getElementById('custPayterms').value = c.payterms;
      document.getElementById('customerError').classList.remove('show');
      document.getElementById('customerModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeCustomerModal() {
      document.getElementById('customerModal').classList.remove('active');
      document.body.style.overflow = '';
    }

    function saveCustomer(e) {
      e.preventDefault();
      const errorEl = document.getElementById('customerError');
      errorEl.classList.remove('show');

      const editNo = document.getElementById('custEditNo').value;
      const custNo = document.getElementById('custNo').value.trim();
      const custName = document.getElementById('custName').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      const payterms = document.getElementById('custPayterms').value.trim();

      if (!custNo || !custName || !address || !payterms) {
        errorEl.textContent = 'All fields are required.';
        errorEl.classList.add('show');
        return;
      }

      const list = getCustomers();

      if (editNo) {
        // Update existing
        const idx = list.findIndex(c => c.custNo === editNo);
        if (idx < 0) return;
        list[idx] = {
          ...list[idx],
          custName, address, payterms,
          stamp: makeStamp('EDITED')
        };
      } else {
        // Add new – check duplicate custNo
        if (list.some(c => c.custNo.toLowerCase() === custNo.toLowerCase())) {
          errorEl.textContent = 'Customer No. already exists.';
          errorEl.classList.add('show');
          return;
        }
        list.push({
          custNo, custName, address, payterms,
          isDeleted: false,
          stamp: makeStamp('CREATED')
        });
      }

      saveCustomers(list);
      closeCustomerModal();
      renderCustomers();
    }

    function softDeleteCustomer(custNo) {
      if (!confirm('Mark this customer as inactive? It can be restored later by an Admin.')) return;
      const list = getCustomers();
      const idx = list.findIndex(c => c.custNo === custNo);
      if (idx < 0) return;
      list[idx].isDeleted = true;
      list[idx].stamp = makeStamp('DELETED');
      saveCustomers(list);
      renderCustomers();
    }

    function restoreCustomer(custNo) {
      const role = currentUser.role;
      if (role !== 'superadmin' && role !== 'admin') {
        alert('Only Superadmin or Admin can restore customers.');
        return;
      }
      const list = getCustomers();
      const idx = list.findIndex(c => c.custNo === custNo);
      if (idx < 0) return;
      list[idx].isDeleted = false;
      list[idx].stamp = makeStamp('RESTORED');
      saveCustomers(list);
      renderCustomers();
    }

    function renderDashboardHome() {
      const role = currentUser.role;
      const area = document.getElementById('contentArea');

      const roleMessages = {
        superadmin: 'You have full shop access, including inventory, sales, service, reports, and team permissions.',
        admin: 'You can manage shop operations and user rights, except Superadmin accounts.',
        user: 'You can use the shop modules assigned to you. Contact an Admin if you need additional access.'
      };

      const activeCustomers = getCustomers().filter(customer => !customer.isDeleted);
      const activeProducts = getProducts().filter(product => !product.isDeleted);
      const activeSales = getSales().filter(sale => !sale.isDeleted);
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthSales = activeSales.filter(sale => sale.salesDate.startsWith(currentMonth));
      const monthRevenue = monthSales.reduce((total, sale) => {
        const saleLines = getSDetails().filter(detail => detail.transNo === sale.transNo && !detail.isDeleted);
        return total + saleLines.reduce((saleTotal, detail) =>
          saleTotal + detail.quantity * latestUnitPrice(detail.prodCode, sale.salesDate), 0);
      }, 0);

      const stats = [
        canModule('customers') && { label: 'Total Customers', value: activeCustomers.length, note: `${getCustomers().length - activeCustomers.length} inactive` },
        canModule('products') && { label: 'Inventory Items', value: activeProducts.length, note: 'Active computer products' },
        canModule('sales') && { label: 'Shop Orders', value: activeSales.length, note: 'Active sales transactions' },
        canModule('sales') && { label: 'Revenue (MTD)', value: '$' + monthRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }), note: 'Based on active sales this month' }
      ].filter(Boolean);

      const quickActions = [
        { id: 'customers', icon: '👥', label: 'View Customers', allowed: canModule('customers') },
        { id: 'products', icon: '📦', label: 'Manage Inventory', allowed: canModule('products') },
        { id: 'hr', icon: '🧑‍💼', label: 'Manage Shop Team', allowed: canModule('hr') },
        { id: 'sales', icon: '🛠️', label: 'Sales & Repairs', allowed: canModule('sales') },
        { id: 'reports', icon: '📊', label: 'Reports', allowed: canModule('reports') },
        { id: 'users', icon: '🔐', label: 'Manage Users', allowed: role === 'superadmin' || role === 'admin' }
      ].filter(action => action.allowed);

      area.innerHTML = `
        <div class="welcome-msg">
          <h2>Welcome back, ${currentUser.firstName}!</h2>
          <p>${roleMessages[role]}</p>
        </div>

        <div class="stats-grid">
          ${stats.map(stat => `<div class="stat-card">
            <div class="label">${stat.label}</div>
            <div class="value">${stat.value}</div>
            <div class="change">${stat.note}</div>
          </div>`).join('') || '<div class="panel">No dashboard metrics are available for your assigned rights.</div>'}
        </div>

        <div class="panel">
          <h3>Quick Actions</h3>
          <div class="quick-actions">
            ${quickActions.map(action => `<button class="quick-btn" onclick="navigateTo('${action.id}')">${action.icon} ${action.label}</button>`).join('') || '<p class="text-muted">No modules are assigned to your account.</p>'}
          </div>
        </div>
      `;
    }

    // ========== PRODUCTS MODULE (PRODUCT + PRICEHIST) ==========
    const DEFAULT_PRODUCTS = [
      { prodCode: 'P-001', description: 'Apex 16 Gaming Laptop', unit: 'unit', isDeleted: false, stamp: 'CREATED system 2026-10-01 9:00 AM' },
      { prodCode: 'P-002', description: 'GeForce RTX 4070 Super Graphics Card', unit: 'unit', isDeleted: false, stamp: 'CREATED system 2026-10-02 10:00 AM' },
      { prodCode: 'P-003', description: '1TB NVMe SSD', unit: 'unit', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { prodCode: 'P-004', description: 'Mechanical RGB Keyboard', unit: 'unit', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
      { prodCode: 'P-005', description: 'Wireless Gaming Mouse', unit: 'unit', isDeleted: false, stamp: 'CREATED system 2026-10-05 3:00 PM' },
    ];

    const DEFAULT_PRICES = [
      { effDate: '2026-01-01', prodCode: 'P-001', unitPrice: 1249.99, isDeleted: false, stamp: 'CREATED system 2026-01-01 8:00 AM' },
      { effDate: '2026-06-01', prodCode: 'P-001', unitPrice: 1199.99, isDeleted: false, stamp: 'CREATED system 2026-06-01 8:00 AM' },
      { effDate: '2026-01-15', prodCode: 'P-002', unitPrice: 629.99, isDeleted: false, stamp: 'CREATED system 2026-01-15 9:00 AM' },
      { effDate: '2026-03-01', prodCode: 'P-002', unitPrice: 599.99, isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { effDate: '2026-02-01', prodCode: 'P-003', unitPrice: 99.99, isDeleted: false, stamp: 'CREATED system 2026-02-01 10:00 AM' },
      { effDate: '2026-04-01', prodCode: 'P-004', unitPrice: 89.99, isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
      { effDate: '2026-05-01', prodCode: 'P-005', unitPrice: 39.99, isDeleted: false, stamp: 'CREATED system 2026-05-01 11:00 AM' },
      { effDate: '2026-09-01', prodCode: 'P-005', unitPrice: 34.99, isDeleted: false, stamp: 'CREATED system 2026-09-01 11:00 AM' },
    ];

    let memoryProducts = null;
    let memoryPrices = null;
    let productFilter = 'active';
    let productSearch = '';
    let selectedProdCode = null;
    let priceFilter = 'active';

    function getProducts() {
      try {
        const stored = localStorage.getItem('hope_erp_products_v2');
        if (stored) return JSON.parse(stored);
        localStorage.setItem('hope_erp_products_v2', JSON.stringify(DEFAULT_PRODUCTS));
        return [...DEFAULT_PRODUCTS];
      } catch (e) {
        if (!memoryProducts) memoryProducts = [...DEFAULT_PRODUCTS];
        return memoryProducts;
      }
    }
    function saveProducts(list) {
      try { localStorage.setItem('hope_erp_products_v2', JSON.stringify(list)); }
      catch (e) { memoryProducts = list; }
    }

    function getPrices() {
      try {
        const stored = localStorage.getItem('hope_erp_prices_v2');
        if (stored) return JSON.parse(stored);
        localStorage.setItem('hope_erp_prices_v2', JSON.stringify(DEFAULT_PRICES));
        return [...DEFAULT_PRICES];
      } catch (e) {
        if (!memoryPrices) memoryPrices = [...DEFAULT_PRICES];
        return memoryPrices;
      }
    }
    function savePrices(list) {
      try { localStorage.setItem('hope_erp_prices_v2', JSON.stringify(list)); }
      catch (e) { memoryPrices = list; }
    }

    function priceKey(p) { return p.prodCode + '|' + p.effDate; }

    function renderProducts() {
      const area = document.getElementById('contentArea');
      const role = currentUser.role;
      const canRestore = role === 'superadmin' || role === 'admin';
      const canSeeDeleted = canRestore;

      let list = getProducts();
      if (!canSeeDeleted) list = list.filter(p => !p.isDeleted);
      else {
        if (productFilter === 'active') list = list.filter(p => !p.isDeleted);
        else if (productFilter === 'deleted') list = list.filter(p => p.isDeleted);
      }
      if (productSearch) {
        const q = productSearch.toLowerCase();
        list = list.filter(p =>
          p.prodCode.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q)
        );
      }

      const totalAll = getProducts().length;
      const totalActive = getProducts().filter(p => !p.isDeleted).length;
      const totalDeleted = getProducts().filter(p => p.isDeleted).length;

      // Latest active price per product (for quick view column)
      const allPrices = getPrices().filter(pr => !pr.isDeleted);
      function latestPrice(code) {
        const ps = allPrices.filter(pr => pr.prodCode === code).sort((a, b) => b.effDate.localeCompare(a.effDate));
        return ps.length ? '$' + Number(ps[0].unitPrice).toFixed(2) : '—';
      }

      const colCount = canSeeDeleted ? 7 : 5;

      let rows = '';
      if (list.length === 0) {
        rows = `<tr><td colspan="${colCount}"><div class="empty-state">No products found.</div></td></tr>`;
      } else {
        list.forEach(p => {
          let actions = '';
          if (p.isDeleted) {
            actions = canRestore
              ? `<button class="btn-restore" onclick="restoreProduct('${p.prodCode}')">Restore</button>`
              : '—';
          } else {
            actions = `
              <button class="btn-edit" onclick="openPriceHistory('${p.prodCode}')">Prices</button>
              <button class="btn-edit" onclick="openEditProduct('${p.prodCode}')">Edit</button>
              <button class="btn-del" onclick="softDeleteProduct('${p.prodCode}')">Delete</button>
            `;
          }
          const adminCols = canSeeDeleted ? `
              <td>${p.isDeleted
                ? '<span class="badge badge-deleted">Inactive</span>'
                : '<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${p.stamp || '—'}</div></td>
          ` : '';
          rows += `
            <tr class="${p.isDeleted ? 'deleted-row' : ''}">
              <td><strong>${p.prodCode}</strong></td>
              <td>${p.description}</td>
              <td>${p.unit}</td>
              <td>${latestPrice(p.prodCode)}</td>
              ${adminCols}
              <td><div class="action-btns">${actions}</div></td>
            </tr>`;
        });
      }

      const filterTabs = canSeeDeleted ? `
        <div class="filter-tabs">
          <button class="filter-tab ${productFilter === 'active' ? 'active' : ''}" onclick="setProductFilter('active')">Active (${totalActive})</button>
          <button class="filter-tab ${productFilter === 'deleted' ? 'active' : ''}" onclick="setProductFilter('deleted')">Inactive (${totalDeleted})</button>
          <button class="filter-tab ${productFilter === 'all' ? 'active' : ''}" onclick="setProductFilter('all')">All (${totalAll})</button>
        </div>` : '';

      const headerCols = canSeeDeleted
        ? `<th>Prod Code</th><th>Description</th><th>Unit</th><th>Current Price</th><th>Status</th><th>Stamp</th><th>Actions</th>`
        : `<th>Prod Code</th><th>Description</th><th>Unit</th><th>Current Price</th><th>Actions</th>`;

      area.innerHTML = `
        <div class="module-toolbar">
          <h3>Product Management</h3>
          <div class="toolbar-right">
            ${filterTabs}
            <input type="text" class="search-input" placeholder="Search products..." value="${productSearch}"
              oninput="productSearch=this.value; renderProducts();" />
            <button class="btn btn-primary btn-sm" onclick="openAddProduct()">+ Add Product</button>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>${headerCols}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    function setProductFilter(f) { productFilter = f; renderProducts(); }
    function setPriceFilter(f) { priceFilter = f; renderPriceHistoryContent(); }

    // --- Price History Modal UI ---
    function openPriceHistory(code) {
      selectedProdCode = code;
      const prod = getProducts().find(p => p.prodCode === code);
      document.getElementById('priceHistTitle').textContent = 'Price History — ' + code;
      document.getElementById('priceHistSub').textContent = prod
        ? prod.description + ' · Unit: ' + prod.unit
        : 'Manage unit prices by effective date';
      renderPriceHistoryContent();
      document.getElementById('priceHistModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closePriceHistModal() {
      document.getElementById('priceHistModal').classList.remove('active');
      document.body.style.overflow = '';
    }

    function renderPriceHistoryContent() {
      if (!selectedProdCode) return;
      const role = currentUser.role;
      const canRestore = role === 'superadmin' || role === 'admin';
      const canSeeDeleted = canRestore;
      const prod = getProducts().find(p => p.prodCode === selectedProdCode);

      let prices = getPrices().filter(pr => pr.prodCode === selectedProdCode);
      if (!canSeeDeleted) prices = prices.filter(pr => !pr.isDeleted);
      else {
        if (priceFilter === 'active') prices = prices.filter(pr => !pr.isDeleted);
        else if (priceFilter === 'deleted') prices = prices.filter(pr => pr.isDeleted);
      }
      prices.sort((a, b) => b.effDate.localeCompare(a.effDate));

      const pColCount = canSeeDeleted ? 5 : 3;

      let priceRows = '';
      if (prices.length === 0) {
        priceRows = `<tr><td colspan="${pColCount}"><div class="empty-state">No price history for this product.</div></td></tr>`;
      } else {
        prices.forEach(pr => {
          let pActions = '';
          if (pr.isDeleted) {
            pActions = canRestore
              ? `<button class="btn-restore" onclick="restorePrice('${pr.prodCode}','${pr.effDate}')">Restore</button>`
              : '—';
          } else {
            pActions = `
              <button class="btn-edit" onclick="openEditPrice('${pr.prodCode}','${pr.effDate}')">Edit</button>
              <button class="btn-del" onclick="softDeletePrice('${pr.prodCode}','${pr.effDate}')">Delete</button>
            `;
          }
          const adminCols = canSeeDeleted ? `
              <td>${pr.isDeleted
                ? '<span class="badge badge-deleted">Inactive</span>'
                : '<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${pr.stamp || '—'}</div></td>
          ` : '';
          priceRows += `
            <tr class="${pr.isDeleted ? 'deleted-row' : ''}">
              <td>${pr.effDate}</td>
              <td><strong>$${Number(pr.unitPrice).toFixed(2)}</strong></td>
              ${adminCols}
              <td><div class="action-btns">${pActions}</div></td>
            </tr>`;
        });
      }

      const priceFilterTabs = canSeeDeleted ? `
        <div class="filter-tabs">
          <button class="filter-tab ${priceFilter === 'active' ? 'active' : ''}" onclick="setPriceFilter('active')">Active</button>
          <button class="filter-tab ${priceFilter === 'deleted' ? 'active' : ''}" onclick="setPriceFilter('deleted')">Inactive</button>
          <button class="filter-tab ${priceFilter === 'all' ? 'active' : ''}" onclick="setPriceFilter('all')">All</button>
        </div>` : '';

      // Update table header based on role
      const histTable = document.querySelector('#priceHistModal .data-table thead tr');
      if (histTable) {
        histTable.innerHTML = canSeeDeleted
          ? `<th>Effective Date</th><th>Unit Price</th><th>Status</th><th>Stamp</th><th>Actions</th>`
          : `<th>Effective Date</th><th>Unit Price</th><th>Actions</th>`;
      }

      document.getElementById('priceHistToolbar').innerHTML = `
        ${priceFilterTabs}
        ${prod && !prod.isDeleted
          ? `<button class="btn btn-primary btn-sm" onclick="openAddPrice('${selectedProdCode}')">+ Add Price</button>`
          : ''}
      `;
      document.getElementById('priceHistBody').innerHTML = priceRows;
    }

    // --- Product CRUD ---
    function openAddProduct() {
      document.getElementById('productModalTitle').textContent = 'Add Product';
      document.getElementById('productModalSub').textContent = 'Enter new product details';
      document.getElementById('productSaveBtn').textContent = 'Save Product';
      document.getElementById('prodEditCode').value = '';
      document.getElementById('prodCode').value = '';
      document.getElementById('prodCode').readOnly = false;
      document.getElementById('prodDesc').value = '';
      document.getElementById('prodUnit').value = '';
      document.getElementById('productError').classList.remove('show');
      document.getElementById('productModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function openEditProduct(code) {
      const p = getProducts().find(x => x.prodCode === code);
      if (!p || p.isDeleted) return;
      document.getElementById('productModalTitle').textContent = 'Edit Product';
      document.getElementById('productModalSub').textContent = 'Update product details';
      document.getElementById('productSaveBtn').textContent = 'Update Product';
      document.getElementById('prodEditCode').value = p.prodCode;
      document.getElementById('prodCode').value = p.prodCode;
      document.getElementById('prodCode').readOnly = true;
      document.getElementById('prodDesc').value = p.description;
      document.getElementById('prodUnit').value = p.unit;
      document.getElementById('productError').classList.remove('show');
      document.getElementById('productModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeProductModal() {
      document.getElementById('productModal').classList.remove('active');
      document.body.style.overflow = '';
    }
    function saveProduct(e) {
      e.preventDefault();
      const errorEl = document.getElementById('productError');
      errorEl.classList.remove('show');
      const editCode = document.getElementById('prodEditCode').value;
      const prodCode = document.getElementById('prodCode').value.trim();
      const description = document.getElementById('prodDesc').value.trim();
      const unit = document.getElementById('prodUnit').value.trim();
      if (!prodCode || !description || !unit) {
        errorEl.textContent = 'All fields are required.';
        errorEl.classList.add('show');
        return;
      }
      const list = getProducts();
      if (editCode) {
        const idx = list.findIndex(p => p.prodCode === editCode);
        if (idx < 0) return;
        list[idx] = { ...list[idx], description, unit, stamp: makeStamp('EDITED') };
      } else {
        if (list.some(p => p.prodCode.toLowerCase() === prodCode.toLowerCase())) {
          errorEl.textContent = 'Product Code already exists.';
          errorEl.classList.add('show');
          return;
        }
        list.push({ prodCode, description, unit, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveProducts(list);
      closeProductModal();
      renderProducts();
    }
    function softDeleteProduct(code) {
      if (!confirm('Mark this product as inactive? Related prices stay in history.')) return;
      const list = getProducts();
      const idx = list.findIndex(p => p.prodCode === code);
      if (idx < 0) return;
      list[idx].isDeleted = true;
      list[idx].stamp = makeStamp('DELETED');
      saveProducts(list);
      if (selectedProdCode === code) selectedProdCode = null;
      renderProducts();
    }
    function restoreProduct(code) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getProducts();
      const idx = list.findIndex(p => p.prodCode === code);
      if (idx < 0) return;
      list[idx].isDeleted = false;
      list[idx].stamp = makeStamp('RESTORED');
      saveProducts(list);
      renderProducts();
    }

    // --- Price History CRUD ---
    function openAddPrice(prodCode) {
      document.getElementById('priceModalTitle').textContent = 'Add Price';
      document.getElementById('priceModalSub').textContent = 'Set a new effective unit price';
      document.getElementById('priceSaveBtn').textContent = 'Save Price';
      document.getElementById('priceEditKey').value = '';
      document.getElementById('priceProdCode').value = prodCode;
      document.getElementById('priceEffDate').value = '';
      document.getElementById('priceEffDate').readOnly = false;
      document.getElementById('priceUnitPrice').value = '';
      document.getElementById('priceError').classList.remove('show');
      document.getElementById('priceModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function openEditPrice(prodCode, effDate) {
      const pr = getPrices().find(p => p.prodCode === prodCode && p.effDate === effDate);
      if (!pr || pr.isDeleted) return;
      document.getElementById('priceModalTitle').textContent = 'Edit Price';
      document.getElementById('priceModalSub').textContent = 'Update unit price';
      document.getElementById('priceSaveBtn').textContent = 'Update Price';
      document.getElementById('priceEditKey').value = priceKey(pr);
      document.getElementById('priceProdCode').value = pr.prodCode;
      document.getElementById('priceEffDate').value = pr.effDate;
      document.getElementById('priceEffDate').readOnly = true;
      document.getElementById('priceUnitPrice').value = pr.unitPrice;
      document.getElementById('priceError').classList.remove('show');
      document.getElementById('priceModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closePriceModal() {
      document.getElementById('priceModal').classList.remove('active');
      document.body.style.overflow = '';
    }
    function savePrice(e) {
      e.preventDefault();
      const errorEl = document.getElementById('priceError');
      errorEl.classList.remove('show');
      const editKey = document.getElementById('priceEditKey').value;
      const prodCode = document.getElementById('priceProdCode').value.trim();
      const effDate = document.getElementById('priceEffDate').value;
      const unitPrice = parseFloat(document.getElementById('priceUnitPrice').value);
      if (!prodCode || !effDate || isNaN(unitPrice) || unitPrice < 0) {
        errorEl.textContent = 'All fields are required. Price must be 0 or greater.';
        errorEl.classList.add('show');
        return;
      }
      const list = getPrices();
      if (editKey) {
        const idx = list.findIndex(p => priceKey(p) === editKey);
        if (idx < 0) return;
        list[idx] = { ...list[idx], unitPrice, stamp: makeStamp('EDITED') };
      } else {
        if (list.some(p => p.prodCode === prodCode && p.effDate === effDate && !p.isDeleted)) {
          errorEl.textContent = 'A price for this product and effective date already exists.';
          errorEl.classList.add('show');
          return;
        }
        list.push({ effDate, prodCode, unitPrice, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      savePrices(list);
      closePriceModal();
      selectedProdCode = prodCode;
      renderPriceHistoryContent();
      renderProducts();
    }
    function softDeletePrice(prodCode, effDate) {
      if (!confirm('Mark this price entry as inactive?')) return;
      const list = getPrices();
      const idx = list.findIndex(p => p.prodCode === prodCode && p.effDate === effDate);
      if (idx < 0) return;
      list[idx].isDeleted = true;
      list[idx].stamp = makeStamp('DELETED');
      savePrices(list);
      renderPriceHistoryContent();
      renderProducts();
    }
    function restorePrice(prodCode, effDate) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getPrices();
      const idx = list.findIndex(p => p.prodCode === prodCode && p.effDate === effDate);
      if (idx < 0) return;
      list[idx].isDeleted = false;
      list[idx].stamp = makeStamp('RESTORED');
      savePrices(list);
      renderPriceHistoryContent();
      renderProducts();
    }

    // Close product/price modals on Escape / overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductModal();
        closePriceModal();
        closePriceHistModal();
      }
    });
    document.getElementById('productModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('productModal')) closeProductModal();
    });
    document.getElementById('priceModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('priceModal')) closePriceModal();
    });
    document.getElementById('priceHistModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('priceHistModal')) closePriceHistModal();
    });

    // ========== HUMAN RESOURCES MODULE ==========
    // EMPLOYEE, JOBHISTORY, JOB, DEPARTMENT
    const DEFAULT_JOBS = [
      { jobCode: 'J-001', jobDesc: 'Computer Sales Associate', isDeleted: false, stamp: 'CREATED system 2026-01-01 9:00 AM' },
      { jobCode: 'J-002', jobDesc: 'Computer Repair Technician', isDeleted: false, stamp: 'CREATED system 2026-01-01 9:00 AM' },
      { jobCode: 'J-003', jobDesc: 'Inventory Specialist', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { jobCode: 'J-004', jobDesc: 'Store Manager', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    ];
    const DEFAULT_DEPTS = [
      { deptCode: 'D-001', deptName: 'Sales Floor', isDeleted: false, stamp: 'CREATED system 2026-01-01 9:00 AM' },
      { deptCode: 'D-002', deptName: 'Repair & Service', isDeleted: false, stamp: 'CREATED system 2026-01-01 9:00 AM' },
      { deptCode: 'D-003', deptName: 'Inventory & Receiving', isDeleted: false, stamp: 'CREATED system 2026-01-01 9:00 AM' },
      { deptCode: 'D-004', deptName: 'Administration', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    ];
    const DEFAULT_EMPLOYEES = [
      { empNo: 'E-001', lastName: 'Santos', firstName: 'Maria', gender: 'F', birthDate: '1990-05-12', hireDate: '2020-03-01', sepDate: '', isDeleted: false, stamp: 'CREATED system 2026-01-15 10:00 AM' },
      { empNo: 'E-002', lastName: 'Reyes', firstName: 'Juan', gender: 'M', birthDate: '1988-11-03', hireDate: '2019-07-15', sepDate: '', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { empNo: 'E-003', lastName: 'Cruz', firstName: 'Ana', gender: 'F', birthDate: '1995-02-20', hireDate: '2021-01-10', sepDate: '', isDeleted: false, stamp: 'CREATED system 2026-02-01 9:00 AM' },
      { empNo: 'E-004', lastName: 'Garcia', firstName: 'Pedro', gender: 'M', birthDate: '1985-08-30', hireDate: '2018-05-01', sepDate: '2025-12-31', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    ];
    const DEFAULT_JOBHIST = [
      { empNo: 'E-001', jobCode: 'J-001', effDate: '2020-03-01', salary: 45000, deptCode: 'D-001', isDeleted: false, stamp: 'CREATED system 2020-03-01 9:00 AM' },
      { empNo: 'E-001', jobCode: 'J-001', effDate: '2023-01-01', salary: 52000, deptCode: 'D-001', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { empNo: 'E-002', jobCode: 'J-002', effDate: '2019-07-15', salary: 55000, deptCode: 'D-002', isDeleted: false, stamp: 'CREATED system 2019-07-15 9:00 AM' },
      { empNo: 'E-003', jobCode: 'J-003', effDate: '2021-01-10', salary: 38000, deptCode: 'D-003', isDeleted: false, stamp: 'CREATED system 2021-01-10 9:00 AM' },
      { empNo: 'E-004', jobCode: 'J-004', effDate: '2018-05-01', salary: 42000, deptCode: 'D-004', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    ];

    let memoryJobs = null, memoryDepts = null, memoryEmps = null, memoryJH = null;
    let hrTab = 'employees'; // employees | jobs | departments
    let empFilter = 'active', jobFilter = 'active', deptFilter = 'active', jhFilter = 'active';
    let empSearch = '', jobSearch = '', deptSearch = '';
    let selectedEmpNo = null;

    function storeGet(key, def, memRef) {
      try {
        const s = localStorage.getItem(key);
        if (s) return JSON.parse(s);
        localStorage.setItem(key, JSON.stringify(def));
        return [...def];
      } catch (e) {
        if (!memRef.v) memRef.v = [...def];
        return memRef.v;
      }
    }
    function storeSet(key, list, memRef) {
      try { localStorage.setItem(key, JSON.stringify(list)); }
      catch (e) { memRef.v = list; }
    }
    const _mJ = {}, _mD = {}, _mE = {}, _mH = {};
    function getJobs() { return storeGet('hope_erp_jobs_v2', DEFAULT_JOBS, _mJ); }
    function saveJobs(l) { storeSet('hope_erp_jobs_v2', l, _mJ); }
    function getDepts() { return storeGet('hope_erp_depts_v2', DEFAULT_DEPTS, _mD); }
    function saveDepts(l) { storeSet('hope_erp_depts_v2', l, _mD); }
    function getEmployees() { return storeGet('hope_erp_emps_v1', DEFAULT_EMPLOYEES, _mE); }
    function saveEmployees(l) { storeSet('hope_erp_emps_v1', l, _mE); }
    function getJobHist() { return storeGet('hope_erp_jh_v1', DEFAULT_JOBHIST, _mH); }
    function saveJobHist(l) { storeSet('hope_erp_jh_v1', l, _mH); }

    function jhKey(h) { return h.empNo + '|' + h.jobCode + '|' + h.effDate; }

    function renderHR() {
      const area = document.getElementById('contentArea');
      const tabs = `
        <div class="filter-tabs" style="margin-bottom:20px;">
          <button class="filter-tab ${hrTab==='employees'?'active':''}" onclick="hrTab='employees';renderHR()">Employees</button>
          <button class="filter-tab ${hrTab==='jobs'?'active':''}" onclick="hrTab='jobs';renderHR()">Jobs</button>
          <button class="filter-tab ${hrTab==='departments'?'active':''}" onclick="hrTab='departments';renderHR()">Departments</button>
        </div>`;
      if (hrTab === 'jobs') { area.innerHTML = tabs + renderJobsTable(); return; }
      if (hrTab === 'departments') { area.innerHTML = tabs + renderDeptsTable(); return; }
      area.innerHTML = tabs + renderEmployeesTable();
    }

    // ----- EMPLOYEES -----
    function renderEmployeesTable() {
      const role = currentUser.role;
      const canRestore = role === 'superadmin' || role === 'admin';
      const canSeeDeleted = canRestore;
      let list = getEmployees();
      if (!canSeeDeleted) list = list.filter(e => !e.isDeleted);
      else {
        if (empFilter === 'active') list = list.filter(e => !e.isDeleted);
        else if (empFilter === 'deleted') list = list.filter(e => e.isDeleted);
      }
      if (empSearch) {
        const q = empSearch.toLowerCase();
        list = list.filter(e => e.empNo.toLowerCase().includes(q) || e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q));
      }
      const tA = getEmployees().filter(e => !e.isDeleted).length;
      const tD = getEmployees().filter(e => e.isDeleted).length;
      const tAll = getEmployees().length;
      const colCount = canSeeDeleted ? 9 : 7;

      let rows = list.length === 0
        ? `<tr><td colspan="${colCount}"><div class="empty-state">No employees found.</div></td></tr>`
        : list.map(e => {
            let actions = e.isDeleted
              ? (canRestore ? `<button class="btn-restore" onclick="restoreEmp('${e.empNo}')">Restore</button>` : '—')
              : `<button class="btn-edit" onclick="openJobHistory('${e.empNo}')">History</button>
                 <button class="btn-edit" onclick="openEditEmp('${e.empNo}')">Edit</button>
                 <button class="btn-del" onclick="softDeleteEmp('${e.empNo}')">Delete</button>`;
            const adminCols = canSeeDeleted ? `
              <td>${e.isDeleted ? '<span class="badge badge-deleted">Inactive</span>' : '<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${e.stamp||'—'}</div></td>` : '';
            return `<tr class="${e.isDeleted?'deleted-row':''}">
              <td><strong>${e.empNo}</strong></td>
              <td>${e.lastName}</td><td>${e.firstName}</td>
              <td>${e.gender}</td><td>${e.birthDate}</td><td>${e.hireDate}</td>
              <td>${e.sepDate || '—'}</td>${adminCols}
              <td><div class="action-btns">${actions}</div></td></tr>`;
          }).join('');

      const filterTabs = canSeeDeleted ? `
        <div class="filter-tabs">
          <button class="filter-tab ${empFilter==='active'?'active':''}" onclick="empFilter='active';renderHR()">Active (${tA})</button>
          <button class="filter-tab ${empFilter==='deleted'?'active':''}" onclick="empFilter='deleted';renderHR()">Inactive (${tD})</button>
          <button class="filter-tab ${empFilter==='all'?'active':''}" onclick="empFilter='all';renderHR()">All (${tAll})</button>
        </div>` : '';

      const headers = canSeeDeleted
        ? '<th>Emp No</th><th>Last Name</th><th>First Name</th><th>Gender</th><th>Birth Date</th><th>Hire Date</th><th>Sep Date</th><th>Status</th><th>Stamp</th><th>Actions</th>'
        : '<th>Emp No</th><th>Last Name</th><th>First Name</th><th>Gender</th><th>Birth Date</th><th>Hire Date</th><th>Sep Date</th><th>Actions</th>';

      // fix colspan - admin has 10 cols
      const realCols = canSeeDeleted ? 10 : 8;

      return `
        <div class="module-toolbar">
          <h3>Employees</h3>
          <div class="toolbar-right">
            ${filterTabs}
            <input type="text" class="search-input" placeholder="Search employees..." value="${empSearch}"
              oninput="empSearch=this.value;renderHR();" />
            <button class="btn btn-primary btn-sm" onclick="openAddEmp()">+ Add Employee</button>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table"><thead><tr>${headers}</tr></thead>
          <tbody>${list.length===0?`<tr><td colspan="${realCols}"><div class="empty-state">No employees found.</div></td></tr>`:rows}</tbody>
          </table>
        </div>`;
    }

    function openAddEmp() {
      document.getElementById('empModalTitle').textContent = 'Add Employee';
      document.getElementById('empSaveBtn').textContent = 'Save Employee';
      document.getElementById('empEditNo').value = '';
      document.getElementById('empNo').value = ''; document.getElementById('empNo').readOnly = false;
      document.getElementById('empFirst').value = ''; document.getElementById('empLast').value = '';
      document.getElementById('empGender').value = 'M';
      document.getElementById('empBirth').value = ''; document.getElementById('empHire').value = '';
      document.getElementById('empSep').value = '';
      document.getElementById('empError').classList.remove('show');
      document.getElementById('empModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function openEditEmp(no) {
      const e = getEmployees().find(x => x.empNo === no); if (!e || e.isDeleted) return;
      document.getElementById('empModalTitle').textContent = 'Edit Employee';
      document.getElementById('empSaveBtn').textContent = 'Update Employee';
      document.getElementById('empEditNo').value = e.empNo;
      document.getElementById('empNo').value = e.empNo; document.getElementById('empNo').readOnly = true;
      document.getElementById('empFirst').value = e.firstName; document.getElementById('empLast').value = e.lastName;
      document.getElementById('empGender').value = e.gender;
      document.getElementById('empBirth').value = e.birthDate; document.getElementById('empHire').value = e.hireDate;
      document.getElementById('empSep').value = e.sepDate || '';
      document.getElementById('empError').classList.remove('show');
      document.getElementById('empModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function closeEmpModal() { document.getElementById('empModal').classList.remove('active'); document.body.style.overflow = ''; }
    function saveEmployee(ev) {
      ev.preventDefault();
      const err = document.getElementById('empError'); err.classList.remove('show');
      const editNo = document.getElementById('empEditNo').value;
      const empNo = document.getElementById('empNo').value.trim();
      const firstName = document.getElementById('empFirst').value.trim();
      const lastName = document.getElementById('empLast').value.trim();
      const gender = document.getElementById('empGender').value;
      const birthDate = document.getElementById('empBirth').value;
      const hireDate = document.getElementById('empHire').value;
      const sepDate = document.getElementById('empSep').value;
      if (!empNo || !firstName || !lastName || !birthDate || !hireDate) {
        err.textContent = 'Required fields missing.'; err.classList.add('show'); return;
      }
      const list = getEmployees();
      if (editNo) {
        const i = list.findIndex(x => x.empNo === editNo); if (i < 0) return;
        list[i] = { ...list[i], firstName, lastName, gender, birthDate, hireDate, sepDate, stamp: makeStamp('EDITED') };
      } else {
        if (list.some(x => x.empNo.toLowerCase() === empNo.toLowerCase())) {
          err.textContent = 'Employee No. already exists.'; err.classList.add('show'); return;
        }
        list.push({ empNo, firstName, lastName, gender, birthDate, hireDate, sepDate, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveEmployees(list); closeEmpModal(); renderHR();
    }
    function softDeleteEmp(no) {
      if (!confirm('Mark this employee as inactive?')) return;
      const list = getEmployees(); const i = list.findIndex(x => x.empNo === no); if (i < 0) return;
      list[i].isDeleted = true; list[i].stamp = makeStamp('DELETED'); saveEmployees(list); renderHR();
    }
    function restoreEmp(no) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getEmployees(); const i = list.findIndex(x => x.empNo === no); if (i < 0) return;
      list[i].isDeleted = false; list[i].stamp = makeStamp('RESTORED'); saveEmployees(list); renderHR();
    }

    // ----- JOBS -----
    function renderJobsTable() {
      const canSeeDeleted = currentUser.role === 'superadmin' || currentUser.role === 'admin';
      const canRestore = canSeeDeleted;
      let list = getJobs();
      if (!canSeeDeleted) list = list.filter(j => !j.isDeleted);
      else {
        if (jobFilter === 'active') list = list.filter(j => !j.isDeleted);
        else if (jobFilter === 'deleted') list = list.filter(j => j.isDeleted);
      }
      if (jobSearch) {
        const q = jobSearch.toLowerCase();
        list = list.filter(j => j.jobCode.toLowerCase().includes(q) || j.jobDesc.toLowerCase().includes(q));
      }
      const tA = getJobs().filter(j => !j.isDeleted).length, tD = getJobs().filter(j => j.isDeleted).length, tAll = getJobs().length;
      const cols = canSeeDeleted ? 4 : 2;
      let rows = list.length === 0 ? `<tr><td colspan="${cols+1}"><div class="empty-state">No jobs found.</div></td></tr>`
        : list.map(j => {
            let actions = j.isDeleted
              ? (canRestore ? `<button class="btn-restore" onclick="restoreJob('${j.jobCode}')">Restore</button>` : '—')
              : `<button class="btn-edit" onclick="openEditJob('${j.jobCode}')">Edit</button>
                 <button class="btn-del" onclick="softDeleteJob('${j.jobCode}')">Delete</button>`;
            const ac = canSeeDeleted ? `<td>${j.isDeleted?'<span class="badge badge-deleted">Inactive</span>':'<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${j.stamp||'—'}</div></td>` : '';
            return `<tr class="${j.isDeleted?'deleted-row':''}"><td><strong>${j.jobCode}</strong></td><td>${j.jobDesc}</td>${ac}<td><div class="action-btns">${actions}</div></td></tr>`;
          }).join('');
      const filterTabs = canSeeDeleted ? `<div class="filter-tabs">
        <button class="filter-tab ${jobFilter==='active'?'active':''}" onclick="jobFilter='active';renderHR()">Active (${tA})</button>
        <button class="filter-tab ${jobFilter==='deleted'?'active':''}" onclick="jobFilter='deleted';renderHR()">Inactive (${tD})</button>
        <button class="filter-tab ${jobFilter==='all'?'active':''}" onclick="jobFilter='all';renderHR()">All (${tAll})</button></div>` : '';
      const headers = canSeeDeleted
        ? '<th>Job Code</th><th>Description</th><th>Status</th><th>Stamp</th><th>Actions</th>'
        : '<th>Job Code</th><th>Description</th><th>Actions</th>';
      return `<div class="module-toolbar"><h3>Jobs</h3><div class="toolbar-right">${filterTabs}
        <input type="text" class="search-input" placeholder="Search jobs..." value="${jobSearch}" oninput="jobSearch=this.value;renderHR();" />
        <button class="btn btn-primary btn-sm" onclick="openAddJob()">+ Add Job</button></div></div>
        <div class="data-table-wrap"><table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    function openAddJob() {
      document.getElementById('jobModalTitle').textContent = 'Add Job'; document.getElementById('jobSaveBtn').textContent = 'Save Job';
      document.getElementById('jobEditCode').value = ''; document.getElementById('jobCode').value = ''; document.getElementById('jobCode').readOnly = false;
      document.getElementById('jobDesc').value = ''; document.getElementById('jobError').classList.remove('show');
      document.getElementById('jobModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function openEditJob(code) {
      const j = getJobs().find(x => x.jobCode === code); if (!j || j.isDeleted) return;
      document.getElementById('jobModalTitle').textContent = 'Edit Job'; document.getElementById('jobSaveBtn').textContent = 'Update Job';
      document.getElementById('jobEditCode').value = j.jobCode; document.getElementById('jobCode').value = j.jobCode; document.getElementById('jobCode').readOnly = true;
      document.getElementById('jobDesc').value = j.jobDesc; document.getElementById('jobError').classList.remove('show');
      document.getElementById('jobModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function closeJobModal() { document.getElementById('jobModal').classList.remove('active'); document.body.style.overflow = ''; }
    function saveJob(ev) {
      ev.preventDefault(); const err = document.getElementById('jobError'); err.classList.remove('show');
      const edit = document.getElementById('jobEditCode').value;
      const jobCode = document.getElementById('jobCode').value.trim();
      const jobDesc = document.getElementById('jobDesc').value.trim();
      if (!jobCode || !jobDesc) { err.textContent = 'All fields required.'; err.classList.add('show'); return; }
      const list = getJobs();
      if (edit) { const i = list.findIndex(x => x.jobCode === edit); if (i>=0) list[i] = {...list[i], jobDesc, stamp: makeStamp('EDITED')}; }
      else {
        if (list.some(x => x.jobCode.toLowerCase() === jobCode.toLowerCase())) { err.textContent = 'Job Code exists.'; err.classList.add('show'); return; }
        list.push({ jobCode, jobDesc, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveJobs(list); closeJobModal(); renderHR();
    }
    function softDeleteJob(code) {
      if (!confirm('Mark this job as inactive?')) return;
      const list = getJobs(); const i = list.findIndex(x => x.jobCode === code); if (i<0) return;
      list[i].isDeleted = true; list[i].stamp = makeStamp('DELETED'); saveJobs(list); renderHR();
    }
    function restoreJob(code) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getJobs(); const i = list.findIndex(x => x.jobCode === code); if (i<0) return;
      list[i].isDeleted = false; list[i].stamp = makeStamp('RESTORED'); saveJobs(list); renderHR();
    }

    // ----- DEPARTMENTS -----
    function renderDeptsTable() {
      const canSeeDeleted = currentUser.role === 'superadmin' || currentUser.role === 'admin';
      const canRestore = canSeeDeleted;
      let list = getDepts();
      if (!canSeeDeleted) list = list.filter(d => !d.isDeleted);
      else {
        if (deptFilter === 'active') list = list.filter(d => !d.isDeleted);
        else if (deptFilter === 'deleted') list = list.filter(d => d.isDeleted);
      }
      if (deptSearch) {
        const q = deptSearch.toLowerCase();
        list = list.filter(d => d.deptCode.toLowerCase().includes(q) || d.deptName.toLowerCase().includes(q));
      }
      const tA = getDepts().filter(d => !d.isDeleted).length, tD = getDepts().filter(d => d.isDeleted).length, tAll = getDepts().length;
      let rows = list.length === 0 ? `<tr><td colspan="5"><div class="empty-state">No departments found.</div></td></tr>`
        : list.map(d => {
            let actions = d.isDeleted
              ? (canRestore ? `<button class="btn-restore" onclick="restoreDept('${d.deptCode}')">Restore</button>` : '—')
              : `<button class="btn-edit" onclick="openEditDept('${d.deptCode}')">Edit</button>
                 <button class="btn-del" onclick="softDeleteDept('${d.deptCode}')">Delete</button>`;
            const ac = canSeeDeleted ? `<td>${d.isDeleted?'<span class="badge badge-deleted">Inactive</span>':'<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${d.stamp||'—'}</div></td>` : '';
            return `<tr class="${d.isDeleted?'deleted-row':''}"><td><strong>${d.deptCode}</strong></td><td>${d.deptName}</td>${ac}<td><div class="action-btns">${actions}</div></td></tr>`;
          }).join('');
      const filterTabs = canSeeDeleted ? `<div class="filter-tabs">
        <button class="filter-tab ${deptFilter==='active'?'active':''}" onclick="deptFilter='active';renderHR()">Active (${tA})</button>
        <button class="filter-tab ${deptFilter==='deleted'?'active':''}" onclick="deptFilter='deleted';renderHR()">Inactive (${tD})</button>
        <button class="filter-tab ${deptFilter==='all'?'active':''}" onclick="deptFilter='all';renderHR()">All (${tAll})</button></div>` : '';
      const headers = canSeeDeleted
        ? '<th>Dept Code</th><th>Department Name</th><th>Status</th><th>Stamp</th><th>Actions</th>'
        : '<th>Dept Code</th><th>Department Name</th><th>Actions</th>';
      return `<div class="module-toolbar"><h3>Departments</h3><div class="toolbar-right">${filterTabs}
        <input type="text" class="search-input" placeholder="Search departments..." value="${deptSearch}" oninput="deptSearch=this.value;renderHR();" />
        <button class="btn btn-primary btn-sm" onclick="openAddDept()">+ Add Department</button></div></div>
        <div class="data-table-wrap"><table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    function openAddDept() {
      document.getElementById('deptModalTitle').textContent = 'Add Department'; document.getElementById('deptSaveBtn').textContent = 'Save Department';
      document.getElementById('deptEditCode').value = ''; document.getElementById('deptCode').value = ''; document.getElementById('deptCode').readOnly = false;
      document.getElementById('deptName').value = ''; document.getElementById('deptError').classList.remove('show');
      document.getElementById('deptModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function openEditDept(code) {
      const d = getDepts().find(x => x.deptCode === code); if (!d || d.isDeleted) return;
      document.getElementById('deptModalTitle').textContent = 'Edit Department'; document.getElementById('deptSaveBtn').textContent = 'Update Department';
      document.getElementById('deptEditCode').value = d.deptCode; document.getElementById('deptCode').value = d.deptCode; document.getElementById('deptCode').readOnly = true;
      document.getElementById('deptName').value = d.deptName; document.getElementById('deptError').classList.remove('show');
      document.getElementById('deptModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function closeDeptModal() { document.getElementById('deptModal').classList.remove('active'); document.body.style.overflow = ''; }
    function saveDept(ev) {
      ev.preventDefault(); const err = document.getElementById('deptError'); err.classList.remove('show');
      const edit = document.getElementById('deptEditCode').value;
      const deptCode = document.getElementById('deptCode').value.trim();
      const deptName = document.getElementById('deptName').value.trim();
      if (!deptCode || !deptName) { err.textContent = 'All fields required.'; err.classList.add('show'); return; }
      const list = getDepts();
      if (edit) { const i = list.findIndex(x => x.deptCode === edit); if (i>=0) list[i] = {...list[i], deptName, stamp: makeStamp('EDITED')}; }
      else {
        if (list.some(x => x.deptCode.toLowerCase() === deptCode.toLowerCase())) { err.textContent = 'Dept Code exists.'; err.classList.add('show'); return; }
        list.push({ deptCode, deptName, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveDepts(list); closeDeptModal(); renderHR();
    }
    function softDeleteDept(code) {
      if (!confirm('Mark this department as inactive?')) return;
      const list = getDepts(); const i = list.findIndex(x => x.deptCode === code); if (i<0) return;
      list[i].isDeleted = true; list[i].stamp = makeStamp('DELETED'); saveDepts(list); renderHR();
    }
    function restoreDept(code) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getDepts(); const i = list.findIndex(x => x.deptCode === code); if (i<0) return;
      list[i].isDeleted = false; list[i].stamp = makeStamp('RESTORED'); saveDepts(list); renderHR();
    }

    // ----- JOB HISTORY -----
    function openJobHistory(empNo) {
      selectedEmpNo = empNo;
      const emp = getEmployees().find(e => e.empNo === empNo);
      document.getElementById('jhListTitle').textContent = 'Job History — ' + empNo;
      document.getElementById('jhListSub').textContent = emp ? (emp.firstName + ' ' + emp.lastName) : '';
      renderJhListContent();
      document.getElementById('jhListModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeJhListModal() { document.getElementById('jhListModal').classList.remove('active'); document.body.style.overflow = ''; }
    function renderJhListContent() {
      if (!selectedEmpNo) return;
      const canSeeDeleted = currentUser.role === 'superadmin' || currentUser.role === 'admin';
      const canRestore = canSeeDeleted;
      const emp = getEmployees().find(e => e.empNo === selectedEmpNo);
      let list = getJobHist().filter(h => h.empNo === selectedEmpNo);
      if (!canSeeDeleted) list = list.filter(h => !h.isDeleted);
      else {
        if (jhFilter === 'active') list = list.filter(h => !h.isDeleted);
        else if (jhFilter === 'deleted') list = list.filter(h => h.isDeleted);
      }
      list.sort((a, b) => b.effDate.localeCompare(a.effDate));
      const jobs = getJobs(), depts = getDepts();
      const jobName = c => { const j = jobs.find(x => x.jobCode === c); return j ? j.jobDesc : c; };
      const deptName = c => { const d = depts.find(x => x.deptCode === c); return d ? d.deptName : c; };

      document.getElementById('jhListHead').innerHTML = canSeeDeleted
        ? '<th>Eff Date</th><th>Job</th><th>Department</th><th>Salary</th><th>Status</th><th>Stamp</th><th>Actions</th>'
        : '<th>Eff Date</th><th>Job</th><th>Department</th><th>Salary</th><th>Actions</th>';

      let rows = list.length === 0
        ? `<tr><td colspan="${canSeeDeleted?7:5}"><div class="empty-state">No job history.</div></td></tr>`
        : list.map(h => {
            let actions = h.isDeleted
              ? (canRestore ? `<button class="btn-restore" onclick="restoreJH('${h.empNo}','${h.jobCode}','${h.effDate}')">Restore</button>` : '—')
              : `<button class="btn-edit" onclick="openEditJH('${h.empNo}','${h.jobCode}','${h.effDate}')">Edit</button>
                 <button class="btn-del" onclick="softDeleteJH('${h.empNo}','${h.jobCode}','${h.effDate}')">Delete</button>`;
            const ac = canSeeDeleted ? `<td>${h.isDeleted?'<span class="badge badge-deleted">Inactive</span>':'<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${h.stamp||'—'}</div></td>` : '';
            return `<tr class="${h.isDeleted?'deleted-row':''}">
              <td>${h.effDate}</td><td>${h.jobCode} — ${jobName(h.jobCode)}</td>
              <td>${h.deptCode} — ${deptName(h.deptCode)}</td>
              <td><strong>$${Number(h.salary).toLocaleString()}</strong></td>${ac}
              <td><div class="action-btns">${actions}</div></td></tr>`;
          }).join('');

      const filterTabs = canSeeDeleted ? `<div class="filter-tabs">
        <button class="filter-tab ${jhFilter==='active'?'active':''}" onclick="jhFilter='active';renderJhListContent()">Active</button>
        <button class="filter-tab ${jhFilter==='deleted'?'active':''}" onclick="jhFilter='deleted';renderJhListContent()">Inactive</button>
        <button class="filter-tab ${jhFilter==='all'?'active':''}" onclick="jhFilter='all';renderJhListContent()">All</button></div>` : '';

      document.getElementById('jhListToolbar').innerHTML = `${filterTabs}
        ${emp && !emp.isDeleted ? `<button class="btn btn-primary btn-sm" onclick="openAddJH('${selectedEmpNo}')">+ Add History</button>` : ''}`;
      document.getElementById('jhListBody').innerHTML = rows;
    }

    function fillJhSelects() {
      const jobs = getJobs().filter(j => !j.isDeleted);
      const depts = getDepts().filter(d => !d.isDeleted);
      document.getElementById('jhJobCode').innerHTML = jobs.map(j => `<option value="${j.jobCode}">${j.jobCode} — ${j.jobDesc}</option>`).join('');
      document.getElementById('jhDeptCode').innerHTML = depts.map(d => `<option value="${d.deptCode}">${d.deptCode} — ${d.deptName}</option>`).join('');
    }
    function openAddJH(empNo) {
      fillJhSelects();
      document.getElementById('jhFormTitle').textContent = 'Add Job History';
      document.getElementById('jhSaveBtn').textContent = 'Save';
      document.getElementById('jhEditKey').value = '';
      document.getElementById('jhEmpNo').value = empNo;
      document.getElementById('jhEffDate').value = ''; document.getElementById('jhEffDate').readOnly = false;
      document.getElementById('jhSalary').value = '';
      document.getElementById('jhError').classList.remove('show');
      document.getElementById('jhFormModal').classList.add('active');
    }
    function openEditJH(empNo, jobCode, effDate) {
      const h = getJobHist().find(x => x.empNo === empNo && x.jobCode === jobCode && x.effDate === effDate);
      if (!h || h.isDeleted) return;
      fillJhSelects();
      document.getElementById('jhFormTitle').textContent = 'Edit Job History';
      document.getElementById('jhSaveBtn').textContent = 'Update';
      document.getElementById('jhEditKey').value = jhKey(h);
      document.getElementById('jhEmpNo').value = h.empNo;
      document.getElementById('jhEffDate').value = h.effDate; document.getElementById('jhEffDate').readOnly = true;
      document.getElementById('jhSalary').value = h.salary;
      document.getElementById('jhJobCode').value = h.jobCode;
      document.getElementById('jhDeptCode').value = h.deptCode;
      document.getElementById('jhError').classList.remove('show');
      document.getElementById('jhFormModal').classList.add('active');
    }
    function closeJhFormModal() { document.getElementById('jhFormModal').classList.remove('active'); }
    function saveJobHistory(ev) {
      ev.preventDefault();
      const err = document.getElementById('jhError'); err.classList.remove('show');
      const editKey = document.getElementById('jhEditKey').value;
      const empNo = document.getElementById('jhEmpNo').value;
      const effDate = document.getElementById('jhEffDate').value;
      const salary = parseFloat(document.getElementById('jhSalary').value);
      const jobCode = document.getElementById('jhJobCode').value;
      const deptCode = document.getElementById('jhDeptCode').value;
      if (!empNo || !effDate || isNaN(salary) || !jobCode || !deptCode) {
        err.textContent = 'All fields required.'; err.classList.add('show'); return;
      }
      const list = getJobHist();
      if (editKey) {
        const i = list.findIndex(x => jhKey(x) === editKey); if (i < 0) return;
        list[i] = { ...list[i], salary, jobCode, deptCode, stamp: makeStamp('EDITED') };
      } else {
        if (list.some(x => x.empNo === empNo && x.jobCode === jobCode && x.effDate === effDate && !x.isDeleted)) {
          err.textContent = 'This job history entry already exists.'; err.classList.add('show'); return;
        }
        list.push({ empNo, jobCode, effDate, salary, deptCode, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveJobHist(list); closeJhFormModal(); renderJhListContent();
    }
    function softDeleteJH(empNo, jobCode, effDate) {
      if (!confirm('Mark this job history as inactive?')) return;
      const list = getJobHist();
      const i = list.findIndex(x => x.empNo === empNo && x.jobCode === jobCode && x.effDate === effDate);
      if (i < 0) return;
      list[i].isDeleted = true; list[i].stamp = makeStamp('DELETED'); saveJobHist(list); renderJhListContent();
    }
    function restoreJH(empNo, jobCode, effDate) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getJobHist();
      const i = list.findIndex(x => x.empNo === empNo && x.jobCode === jobCode && x.effDate === effDate);
      if (i < 0) return;
      list[i].isDeleted = false; list[i].stamp = makeStamp('RESTORED'); saveJobHist(list); renderJhListContent();
    }

    // HR modal close handlers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeEmpModal(); closeJobModal(); closeDeptModal(); closeJhFormModal(); closeJhListModal();
      }
    });
    ['empModal','jobModal','deptModal','jhFormModal','jhListModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', (e) => { if (e.target === el) el.classList.remove('active'); document.body.style.overflow = ''; });
    });

    // ========== SALES MODULE (SALES + SALESDETAIL) ==========
    const DEFAULT_SALES = [
      { transNo: 'T-001', salesDate: '2026-10-01', custNo: 'C-001', empNo: 'E-002', isDeleted: false, stamp: 'CREATED system 2026-10-01 10:00 AM' },
      { transNo: 'T-002', salesDate: '2026-10-05', custNo: 'C-002', empNo: 'E-001', isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { transNo: 'T-003', salesDate: '2026-10-08', custNo: 'C-003', empNo: 'E-002', isDeleted: false, stamp: 'CREATED system 2026-10-08 2:00 PM' },
      { transNo: 'T-004', salesDate: '2026-09-20', custNo: 'C-005', empNo: 'E-003', isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    ];
    const DEFAULT_SDETAILS = [
      { transNo: 'T-001', prodCode: 'P-001', quantity: 10, isDeleted: false, stamp: 'CREATED system 2026-10-01 10:00 AM' },
      { transNo: 'T-001', prodCode: 'P-002', quantity: 2, isDeleted: false, stamp: 'CREATED system 2026-10-01 10:00 AM' },
      { transNo: 'T-002', prodCode: 'P-003', quantity: 5, isDeleted: false, stamp: 'EDITED user1 2026-10-13 1:01 PM' },
      { transNo: 'T-003', prodCode: 'P-001', quantity: 20, isDeleted: false, stamp: 'CREATED system 2026-10-08 2:00 PM' },
      { transNo: 'T-003', prodCode: 'P-005', quantity: 100, isDeleted: false, stamp: 'CREATED system 2026-10-08 2:00 PM' },
      { transNo: 'T-004', prodCode: 'P-002', quantity: 1, isDeleted: true, stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    ];

    let _mS = {}, _mSD = {};
    let salesFilter = 'active', salesSearch = '', selectedTransNo = null, sdFilter = 'active';

    function getSales() { return storeGet('hope_erp_sales_v1', DEFAULT_SALES, _mS); }
    function saveSales(l) { storeSet('hope_erp_sales_v1', l, _mS); }
    function getSDetails() { return storeGet('hope_erp_sdetails_v1', DEFAULT_SDETAILS, _mSD); }
    function saveSDetails(l) { storeSet('hope_erp_sdetails_v1', l, _mSD); }
    function sdKey(d) { return d.transNo + '|' + d.prodCode; }

    function latestUnitPrice(prodCode, asOfDate) {
      let prices = getPrices().filter(p => p.prodCode === prodCode && !p.isDeleted);
      if (asOfDate) prices = prices.filter(p => p.effDate <= asOfDate);
      prices.sort((a, b) => b.effDate.localeCompare(a.effDate));
      return prices.length ? Number(prices[0].unitPrice) : 0;
    }

    function renderSales() {
      const area = document.getElementById('contentArea');
      const canSeeDeleted = currentUser.role === 'superadmin' || currentUser.role === 'admin';
      const canRestore = canSeeDeleted;

      let list = getSales();
      if (!canSeeDeleted) list = list.filter(s => !s.isDeleted);
      else {
        if (salesFilter === 'active') list = list.filter(s => !s.isDeleted);
        else if (salesFilter === 'deleted') list = list.filter(s => s.isDeleted);
      }
      if (salesSearch) {
        const q = salesSearch.toLowerCase();
        list = list.filter(s => s.transNo.toLowerCase().includes(q) || s.custNo.toLowerCase().includes(q) || s.empNo.toLowerCase().includes(q));
      }

      const customers = getCustomers();
      const employees = getEmployees();
      const custName = no => { const c = customers.find(x => x.custNo === no); return c ? c.custName : no; };
      const empName = no => { const e = employees.find(x => x.empNo === no); return e ? (e.firstName + ' ' + e.lastName) : no; };

      // Compute line totals for display
      function saleTotal(transNo, salesDate) {
        const details = getSDetails().filter(d => d.transNo === transNo && !d.isDeleted);
        return details.reduce((sum, d) => sum + d.quantity * latestUnitPrice(d.prodCode, salesDate), 0);
      }

      const tA = getSales().filter(s => !s.isDeleted).length;
      const tD = getSales().filter(s => s.isDeleted).length;
      const tAll = getSales().length;

      const colCount = canSeeDeleted ? 8 : 6;
      let rows = list.length === 0
        ? `<tr><td colspan="${colCount}"><div class="empty-state">No sales found.</div></td></tr>`
        : list.map(s => {
            let actions = s.isDeleted
              ? (canRestore ? `<button class="btn-restore" onclick="restoreSale('${s.transNo}')">Restore</button>` : '—')
              : `<button class="btn-edit" onclick="openSalesDetails('${s.transNo}')">Details</button>
                 <button class="btn-edit" onclick="openEditSale('${s.transNo}')">Edit</button>
                 <button class="btn-del" onclick="softDeleteSale('${s.transNo}')">Delete</button>`;
            const adminCols = canSeeDeleted ? `
              <td>${s.isDeleted ? '<span class="badge badge-deleted">Inactive</span>' : '<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${s.stamp || '—'}</div></td>` : '';
            return `<tr class="${s.isDeleted ? 'deleted-row' : ''}">
              <td><strong>${s.transNo}</strong></td>
              <td>${s.salesDate}</td>
              <td>${s.custNo} — ${custName(s.custNo)}</td>
              <td>${s.empNo} — ${empName(s.empNo)}</td>
              <td><strong>$${saleTotal(s.transNo, s.salesDate).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></td>
              ${adminCols}
              <td><div class="action-btns">${actions}</div></td></tr>`;
          }).join('');

      const filterTabs = canSeeDeleted ? `
        <div class="filter-tabs">
          <button class="filter-tab ${salesFilter==='active'?'active':''}" onclick="salesFilter='active';renderSales()">Active (${tA})</button>
          <button class="filter-tab ${salesFilter==='deleted'?'active':''}" onclick="salesFilter='deleted';renderSales()">Inactive (${tD})</button>
          <button class="filter-tab ${salesFilter==='all'?'active':''}" onclick="salesFilter='all';renderSales()">All (${tAll})</button>
        </div>` : '';

      const headers = canSeeDeleted
        ? '<th>Trans No</th><th>Sales Date</th><th>Customer</th><th>Employee</th><th>Total</th><th>Status</th><th>Stamp</th><th>Actions</th>'
        : '<th>Trans No</th><th>Sales Date</th><th>Customer</th><th>Employee</th><th>Total</th><th>Actions</th>';

      area.innerHTML = `
        <div class="module-toolbar">
          <h3>Sales Management</h3>
          <div class="toolbar-right">
            ${filterTabs}
            <input type="text" class="search-input" placeholder="Search sales..." value="${salesSearch}"
              oninput="salesSearch=this.value;renderSales();" />
            <button class="btn btn-primary btn-sm" onclick="openAddSale()">+ New Sale</button>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    function fillSalesSelects() {
      const custs = getCustomers().filter(c => !c.isDeleted);
      const emps = getEmployees().filter(e => !e.isDeleted);
      document.getElementById('salesCustNo').innerHTML = custs.map(c =>
        `<option value="${c.custNo}">${c.custNo} — ${c.custName}</option>`).join('');
      document.getElementById('salesEmpNo').innerHTML = emps.map(e =>
        `<option value="${e.empNo}">${e.empNo} — ${e.firstName} ${e.lastName}</option>`).join('');
    }
    function openAddSale() {
      fillSalesSelects();
      document.getElementById('salesModalTitle').textContent = 'New Sale';
      document.getElementById('salesSaveBtn').textContent = 'Save Sale';
      document.getElementById('salesEditNo').value = '';
      document.getElementById('salesTransNo').value = ''; document.getElementById('salesTransNo').readOnly = false;
      document.getElementById('salesDate').value = new Date().toISOString().slice(0, 10);
      document.getElementById('salesError').classList.remove('show');
      document.getElementById('salesModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function openEditSale(transNo) {
      const s = getSales().find(x => x.transNo === transNo); if (!s || s.isDeleted) return;
      fillSalesSelects();
      document.getElementById('salesModalTitle').textContent = 'Edit Sale';
      document.getElementById('salesSaveBtn').textContent = 'Update Sale';
      document.getElementById('salesEditNo').value = s.transNo;
      document.getElementById('salesTransNo').value = s.transNo; document.getElementById('salesTransNo').readOnly = true;
      document.getElementById('salesDate').value = s.salesDate;
      document.getElementById('salesCustNo').value = s.custNo;
      document.getElementById('salesEmpNo').value = s.empNo;
      document.getElementById('salesError').classList.remove('show');
      document.getElementById('salesModal').classList.add('active'); document.body.style.overflow = 'hidden';
    }
    function closeSalesModal() { document.getElementById('salesModal').classList.remove('active'); document.body.style.overflow = ''; }
    function saveSale(ev) {
      ev.preventDefault();
      const err = document.getElementById('salesError'); err.classList.remove('show');
      const editNo = document.getElementById('salesEditNo').value;
      const transNo = document.getElementById('salesTransNo').value.trim();
      const salesDate = document.getElementById('salesDate').value;
      const custNo = document.getElementById('salesCustNo').value;
      const empNo = document.getElementById('salesEmpNo').value;
      if (!transNo || !salesDate || !custNo || !empNo) {
        err.textContent = 'All fields are required.'; err.classList.add('show'); return;
      }
      const list = getSales();
      if (editNo) {
        const i = list.findIndex(x => x.transNo === editNo); if (i < 0) return;
        list[i] = { ...list[i], salesDate, custNo, empNo, stamp: makeStamp('EDITED') };
      } else {
        if (list.some(x => x.transNo.toLowerCase() === transNo.toLowerCase())) {
          err.textContent = 'Transaction No. already exists.'; err.classList.add('show'); return;
        }
        list.push({ transNo, salesDate, custNo, empNo, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveSales(list); closeSalesModal(); renderSales();
    }
    function softDeleteSale(transNo) {
      if (!confirm('Mark this sale as inactive? Line items remain in history.')) return;
      const list = getSales(); const i = list.findIndex(x => x.transNo === transNo); if (i < 0) return;
      list[i].isDeleted = true; list[i].stamp = makeStamp('DELETED'); saveSales(list); renderSales();
    }
    function restoreSale(transNo) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getSales(); const i = list.findIndex(x => x.transNo === transNo); if (i < 0) return;
      list[i].isDeleted = false; list[i].stamp = makeStamp('RESTORED'); saveSales(list); renderSales();
    }

    // --- Sales Details ---
    function openSalesDetails(transNo) {
      selectedTransNo = transNo;
      const s = getSales().find(x => x.transNo === transNo);
      const cust = s ? getCustomers().find(c => c.custNo === s.custNo) : null;
      document.getElementById('sdListTitle').textContent = 'Sale Details — ' + transNo;
      document.getElementById('sdListSub').textContent = s
        ? `${s.salesDate} · ${s.custNo}${cust ? ' — ' + cust.custName : ''}`
        : '';
      renderSdListContent();
      document.getElementById('sdListModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeSdListModal() { document.getElementById('sdListModal').classList.remove('active'); document.body.style.overflow = ''; }

    function renderSdListContent() {
      if (!selectedTransNo) return;
      const canSeeDeleted = currentUser.role === 'superadmin' || currentUser.role === 'admin';
      const canRestore = canSeeDeleted;
      const sale = getSales().find(s => s.transNo === selectedTransNo);
      let list = getSDetails().filter(d => d.transNo === selectedTransNo);
      if (!canSeeDeleted) list = list.filter(d => !d.isDeleted);
      else {
        if (sdFilter === 'active') list = list.filter(d => !d.isDeleted);
        else if (sdFilter === 'deleted') list = list.filter(d => d.isDeleted);
      }
      const products = getProducts();
      const prodName = code => { const p = products.find(x => x.prodCode === code); return p ? p.description : code; };
      const salesDate = sale ? sale.salesDate : '';

      document.getElementById('sdListHead').innerHTML = canSeeDeleted
        ? '<th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th>Status</th><th>Stamp</th><th>Actions</th>'
        : '<th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th>Actions</th>';

      let grandTotal = 0;
      let rows = list.length === 0
        ? `<tr><td colspan="${canSeeDeleted?7:5}"><div class="empty-state">No line items.</div></td></tr>`
        : list.map(d => {
            const up = latestUnitPrice(d.prodCode, salesDate);
            const line = d.quantity * up;
            if (!d.isDeleted) grandTotal += line;
            let actions = d.isDeleted
              ? (canRestore ? `<button class="btn-restore" onclick="restoreSD('${d.transNo}','${d.prodCode}')">Restore</button>` : '—')
              : `<button class="btn-edit" onclick="openEditSD('${d.transNo}','${d.prodCode}')">Edit</button>
                 <button class="btn-del" onclick="softDeleteSD('${d.transNo}','${d.prodCode}')">Delete</button>`;
            const ac = canSeeDeleted ? `<td>${d.isDeleted?'<span class="badge badge-deleted">Inactive</span>':'<span class="badge badge-active">Active</span>'}</td>
              <td><div class="stamp-text">${d.stamp||'—'}</div></td>` : '';
            return `<tr class="${d.isDeleted?'deleted-row':''}">
              <td><strong>${d.prodCode}</strong> — ${prodName(d.prodCode)}</td>
              <td>${d.quantity}</td>
              <td>$${up.toFixed(2)}</td>
              <td><strong>$${line.toFixed(2)}</strong></td>${ac}
              <td><div class="action-btns">${actions}</div></td></tr>`;
          }).join('');

      const filterTabs = canSeeDeleted ? `<div class="filter-tabs">
        <button class="filter-tab ${sdFilter==='active'?'active':''}" onclick="sdFilter='active';renderSdListContent()">Active</button>
        <button class="filter-tab ${sdFilter==='deleted'?'active':''}" onclick="sdFilter='deleted';renderSdListContent()">Inactive</button>
        <button class="filter-tab ${sdFilter==='all'?'active':''}" onclick="sdFilter='all';renderSdListContent()">All</button></div>` : '';

      document.getElementById('sdListToolbar').innerHTML = `${filterTabs}
        ${sale && !sale.isDeleted ? `<button class="btn btn-primary btn-sm" onclick="openAddSD('${selectedTransNo}')">+ Add Line</button>` : ''}`;
      document.getElementById('sdListBody').innerHTML = rows;
      document.getElementById('sdListTotal').textContent = 'Total: $' + grandTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    }

    function fillSdProductSelect() {
      const prods = getProducts().filter(p => !p.isDeleted);
      document.getElementById('sdProdCode').innerHTML = prods.map(p =>
        `<option value="${p.prodCode}">${p.prodCode} — ${p.description} (${p.unit})</option>`).join('');
    }
    function updateSdPriceHint() {
      const code = document.getElementById('sdProdCode').value;
      const sale = getSales().find(s => s.transNo === selectedTransNo);
      const up = latestUnitPrice(code, sale ? sale.salesDate : null);
      document.getElementById('sdPriceHint').textContent = code
        ? `Current unit price as of sale date: $${up.toFixed(2)}`
        : '';
    }
    function openAddSD(transNo) {
      fillSdProductSelect();
      document.getElementById('sdFormTitle').textContent = 'Add Line Item';
      document.getElementById('sdSaveBtn').textContent = 'Save Line';
      document.getElementById('sdEditKey').value = '';
      document.getElementById('sdTransNo').value = transNo;
      document.getElementById('sdProdCode').disabled = false;
      document.getElementById('sdQty').value = 1;
      document.getElementById('sdError').classList.remove('show');
      updateSdPriceHint();
      document.getElementById('sdFormModal').classList.add('active');
    }
    function openEditSD(transNo, prodCode) {
      const d = getSDetails().find(x => x.transNo === transNo && x.prodCode === prodCode);
      if (!d || d.isDeleted) return;
      fillSdProductSelect();
      document.getElementById('sdFormTitle').textContent = 'Edit Line Item';
      document.getElementById('sdSaveBtn').textContent = 'Update Line';
      document.getElementById('sdEditKey').value = sdKey(d);
      document.getElementById('sdTransNo').value = d.transNo;
      document.getElementById('sdProdCode').value = d.prodCode;
      document.getElementById('sdProdCode').disabled = true;
      document.getElementById('sdQty').value = d.quantity;
      document.getElementById('sdError').classList.remove('show');
      updateSdPriceHint();
      document.getElementById('sdFormModal').classList.add('active');
    }
    function closeSdFormModal() { document.getElementById('sdFormModal').classList.remove('active'); }
    function saveSalesDetail(ev) {
      ev.preventDefault();
      const err = document.getElementById('sdError'); err.classList.remove('show');
      const editKey = document.getElementById('sdEditKey').value;
      const transNo = document.getElementById('sdTransNo').value;
      const prodCode = document.getElementById('sdProdCode').value;
      const quantity = parseInt(document.getElementById('sdQty').value, 10);
      if (!transNo || !prodCode || !quantity || quantity < 1) {
        err.textContent = 'All fields required. Quantity must be at least 1.'; err.classList.add('show'); return;
      }
      const list = getSDetails();
      if (editKey) {
        const i = list.findIndex(x => sdKey(x) === editKey); if (i < 0) return;
        list[i] = { ...list[i], quantity, stamp: makeStamp('EDITED') };
      } else {
        if (list.some(x => x.transNo === transNo && x.prodCode === prodCode && !x.isDeleted)) {
          err.textContent = 'This product is already on this sale. Edit the existing line.'; err.classList.add('show'); return;
        }
        list.push({ transNo, prodCode, quantity, isDeleted: false, stamp: makeStamp('CREATED') });
      }
      saveSDetails(list); closeSdFormModal(); renderSdListContent(); renderSales();
    }
    function softDeleteSD(transNo, prodCode) {
      if (!confirm('Mark this line item as inactive?')) return;
      const list = getSDetails();
      const i = list.findIndex(x => x.transNo === transNo && x.prodCode === prodCode); if (i < 0) return;
      list[i].isDeleted = true; list[i].stamp = makeStamp('DELETED'); saveSDetails(list);
      renderSdListContent(); renderSales();
    }
    function restoreSD(transNo, prodCode) {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') return;
      const list = getSDetails();
      const i = list.findIndex(x => x.transNo === transNo && x.prodCode === prodCode); if (i < 0) return;
      list[i].isDeleted = false; list[i].stamp = makeStamp('RESTORED'); saveSDetails(list);
      renderSdListContent(); renderSales();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSalesModal(); closeSdFormModal(); closeSdListModal();
      }
    });
    ['salesModal','sdFormModal','sdListModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', (e) => { if (e.target === el) { el.classList.remove('active'); document.body.style.overflow = ''; } });
    });

    // ========== REPORTS MODULE ==========
    let reportId = 'topCustomers';
    let rptDateFrom = '';
    let rptDateTo = '';
    let rptTopN = 10;
    let rptEmpNo = '';

    function saleLineAmount(transNo, prodCode, quantity, salesDate) {
      return quantity * latestUnitPrice(prodCode, salesDate);
    }

    function getActiveSalesInRange(from, to) {
      return getSales().filter(s => {
        if (s.isDeleted) return false;
        if (from && s.salesDate < from) return false;
        if (to && s.salesDate > to) return false;
        return true;
      });
    }

    function renderReports() {
      const area = document.getElementById('contentArea');
      const reports = [
        { id: 'topCustomers', label: 'Top Customers', perm: 'reports.topCustomers' },
        { id: 'productMaster', label: 'Product Master List', perm: 'reports.productMaster' },
        { id: 'topProducts', label: 'Top Products', perm: 'reports.topProducts' },
        { id: 'activeEmployees', label: 'Active Employees', perm: 'reports.activeEmployees' },
        { id: 'allEmployees', label: 'All Employees', perm: 'reports.allEmployees' },
        { id: 'empJobHistory', label: 'Employee Job History', perm: 'reports.empJobHistory' },
        { id: 'topSales', label: 'Top Sales', perm: 'reports.topSales' },
      ].filter(r => can(r.perm) || currentUser.role === 'superadmin' || currentUser.role === 'admin');

      if (!reports.length) {
        area.innerHTML = '<div class="empty-state">No reports assigned to your account.</div>';
        return;
      }
      if (!reports.find(r => r.id === reportId)) reportId = reports[0].id;

      const tabs = `
        <div class="filter-tabs" style="margin-bottom:20px;flex-wrap:wrap;">
          ${reports.map(r => `
            <button class="filter-tab ${reportId === r.id ? 'active' : ''}"
              onclick="reportId='${r.id}';renderReports()">${r.label}</button>
          `).join('')}
        </div>`;

      let body = '';
      switch (reportId) {
        case 'topCustomers': body = reportTopCustomers(); break;
        case 'productMaster': body = reportProductMaster(); break;
        case 'topProducts': body = reportTopProducts(); break;
        case 'activeEmployees': body = reportActiveEmployees(); break;
        case 'allEmployees': body = reportAllEmployees(); break;
        case 'empJobHistory': body = reportEmpJobHistory(); break;
        case 'topSales': body = reportTopSales(); break;
        default: body = '<div class="empty-state">Select a report.</div>';
      }
      area.innerHTML = tabs + `<div class="report-print-area" id="reportPrintArea">${body}</div>`;
    }

    function reportActions() {
      return `
        <div class="report-actions">
          <button type="button" class="btn btn-secondary btn-sm" onclick="printReport()">🖨 Print</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="saveReportPdf()">📄 Save as PDF</button>
        </div>`;
    }

    function printReport() {
      window.print();
    }

    function saveReportPdf() {
      // Uses the browser print dialog — choose "Save as PDF" / "Microsoft Print to PDF"
      // as the destination. This works offline with no extra libraries.
      alert('In the print dialog, set Destination to "Save as PDF" (or "Microsoft Print to PDF"), then click Save.');
      setTimeout(() => window.print(), 100);
    }

    function reportDateFilters(showTopN) {
      return `
        <div class="toolbar-right" style="margin-bottom:16px;">
          <label style="font-size:0.85rem;color:var(--text-muted);">From
            <input type="date" class="search-input" style="min-width:140px;" value="${rptDateFrom}"
              onchange="rptDateFrom=this.value;renderReports();" />
          </label>
          <label style="font-size:0.85rem;color:var(--text-muted);">To
            <input type="date" class="search-input" style="min-width:140px;" value="${rptDateTo}"
              onchange="rptDateTo=this.value;renderReports();" />
          </label>
          ${showTopN ? `<label style="font-size:0.85rem;color:var(--text-muted);">Top N
            <input type="number" class="search-input" style="min-width:70px;width:70px;" min="1" max="100" value="${rptTopN}"
              onchange="rptTopN=parseInt(this.value,10)||10;renderReports();" />
          </label>` : ''}
          ${reportActions()}
        </div>`;
    }

    // 1. Top Customers
    function reportTopCustomers() {
      const sales = getActiveSalesInRange(rptDateFrom, rptDateTo);
      const details = getSDetails().filter(d => !d.isDeleted);
      const map = {};
      sales.forEach(s => {
        details.filter(d => d.transNo === s.transNo).forEach(d => {
          const amt = saleLineAmount(s.transNo, d.prodCode, d.quantity, s.salesDate);
          map[s.custNo] = (map[s.custNo] || 0) + amt;
        });
      });
      const customers = getCustomers();
      let rows = Object.entries(map)
        .map(([custNo, total]) => {
          const c = customers.find(x => x.custNo === custNo);
          return { custNo, name: c ? c.custName : custNo, total };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, rptTopN);

      const tableRows = rows.length === 0
        ? '<tr><td colspan="4"><div class="empty-state">No sales data for this period.</div></td></tr>'
        : rows.map((r, i) => `<tr>
            <td>${i + 1}</td>
            <td><strong>${r.custNo}</strong></td>
            <td>${r.name}</td>
            <td><strong>$${r.total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></td>
          </tr>`).join('');

      return `
        <div class="module-toolbar"><h3>Top Customers by Sales</h3></div>
        ${reportDateFilters(true)}
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Rank</th><th>Cust No</th><th>Customer Name</th><th>Total Sales</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>`;
    }

    // 2. Product Master List with current price
    function reportProductMaster() {
      const products = getProducts().filter(p => !p.isDeleted);
      const rows = products.length === 0
        ? '<tr><td colspan="4"><div class="empty-state">No active products.</div></td></tr>'
        : products.map(p => {
            const price = latestUnitPrice(p.prodCode, null);
            return `<tr>
              <td><strong>${p.prodCode}</strong></td>
              <td>${p.description}</td>
              <td>${p.unit}</td>
              <td><strong>$${price.toFixed(2)}</strong></td>
            </tr>`;
          }).join('');

      return `
        <div class="module-toolbar">
          <h3>Product Master List (Current Price)</h3>
          ${reportActions()}
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Prod Code</th><th>Description</th><th>Unit</th><th>Current Price</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    // 3. Top Products
    function reportTopProducts() {
      const sales = getActiveSalesInRange(rptDateFrom, rptDateTo);
      const details = getSDetails().filter(d => !d.isDeleted);
      const map = {}; // prodCode -> { qty, amount }
      sales.forEach(s => {
        details.filter(d => d.transNo === s.transNo).forEach(d => {
          if (!map[d.prodCode]) map[d.prodCode] = { qty: 0, amount: 0 };
          map[d.prodCode].qty += d.quantity;
          map[d.prodCode].amount += saleLineAmount(s.transNo, d.prodCode, d.quantity, s.salesDate);
        });
      });
      const products = getProducts();
      let rows = Object.entries(map)
        .map(([prodCode, v]) => {
          const p = products.find(x => x.prodCode === prodCode);
          return { prodCode, desc: p ? p.description : prodCode, qty: v.qty, amount: v.amount };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, rptTopN);

      const tableRows = rows.length === 0
        ? '<tr><td colspan="5"><div class="empty-state">No sales data for this period.</div></td></tr>'
        : rows.map((r, i) => `<tr>
            <td>${i + 1}</td>
            <td><strong>${r.prodCode}</strong></td>
            <td>${r.desc}</td>
            <td>${r.qty}</td>
            <td><strong>$${r.amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></td>
          </tr>`).join('');

      return `
        <div class="module-toolbar"><h3>Top Products by Sales Amount</h3></div>
        ${reportDateFilters(true)}
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Rank</th><th>Prod Code</th><th>Description</th><th>Qty Sold</th><th>Sales Amount</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>`;
    }

    // 4. Active Employees (no sepDate)
    function reportActiveEmployees() {
      const list = getEmployees().filter(e => !e.isDeleted && !e.sepDate);
      const rows = list.length === 0
        ? '<tr><td colspan="6"><div class="empty-state">No active employees.</div></td></tr>'
        : list.map(e => `<tr>
            <td><strong>${e.empNo}</strong></td>
            <td>${e.lastName}</td><td>${e.firstName}</td>
            <td>${e.gender}</td><td>${e.birthDate}</td><td>${e.hireDate}</td>
          </tr>`).join('');

      return `
        <div class="module-toolbar">
          <h3>Active Employees (Not Separated)</h3>
          ${reportActions()}
        </div>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">Employees with no separation date.</p>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Emp No</th><th>Last Name</th><th>First Name</th><th>Gender</th><th>Birth Date</th><th>Hire Date</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    // 5. All Employees (including separated)
    function reportAllEmployees() {
      const list = getEmployees().filter(e => !e.isDeleted);
      const rows = list.length === 0
        ? '<tr><td colspan="8"><div class="empty-state">No employees.</div></td></tr>'
        : list.map(e => `<tr>
            <td><strong>${e.empNo}</strong></td>
            <td>${e.lastName}</td><td>${e.firstName}</td>
            <td>${e.gender}</td><td>${e.birthDate}</td><td>${e.hireDate}</td>
            <td>${e.sepDate || '—'}</td>
            <td>${e.sepDate
              ? '<span class="badge badge-deleted">Separated</span>'
              : '<span class="badge badge-active">Active</span>'}</td>
          </tr>`).join('');

      return `
        <div class="module-toolbar">
          <h3>All Employees (Including Separated)</h3>
          ${reportActions()}
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Emp No</th><th>Last Name</th><th>First Name</th><th>Gender</th><th>Birth Date</th><th>Hire Date</th><th>Sep Date</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    // 6. Employee Job History
    function reportEmpJobHistory() {
      const emps = getEmployees().filter(e => !e.isDeleted);
      const options = emps.map(e =>
        `<option value="${e.empNo}" ${rptEmpNo === e.empNo ? 'selected' : ''}>${e.empNo} — ${e.firstName} ${e.lastName}</option>`
      ).join('');

      let table = '<div class="empty-state">Select an employee to view job history.</div>';
      if (rptEmpNo) {
        const jobs = getJobs(), depts = getDepts();
        const jobName = c => { const j = jobs.find(x => x.jobCode === c); return j ? j.jobDesc : c; };
        const deptName = c => { const d = depts.find(x => x.deptCode === c); return d ? d.deptName : c; };
        let list = getJobHist().filter(h => h.empNo === rptEmpNo && !h.isDeleted);
        list.sort((a, b) => b.effDate.localeCompare(a.effDate));
        const rows = list.length === 0
          ? '<tr><td colspan="4"><div class="empty-state">No job history for this employee.</div></td></tr>'
          : list.map(h => `<tr>
              <td>${h.effDate}</td>
              <td>${h.jobCode} — ${jobName(h.jobCode)}</td>
              <td>${h.deptCode} — ${deptName(h.deptCode)}</td>
              <td><strong>$${Number(h.salary).toLocaleString()}</strong></td>
            </tr>`).join('');
        table = `
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Eff Date</th><th>Job</th><th>Department</th><th>Salary</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
      }

      return `
        <div class="module-toolbar">
          <h3>Employee Job History</h3>
          ${reportActions()}
        </div>
        <div class="toolbar-right" style="margin-bottom:16px;">
          <label style="font-size:0.85rem;color:var(--text-muted);">Employee
            <select class="search-input" style="min-width:220px;" onchange="rptEmpNo=this.value;renderReports();">
              <option value="">— Select —</option>
              ${options}
            </select>
          </label>
        </div>
        ${table}`;
    }

    // 7. Top Sales with date selector
    function reportTopSales() {
      const sales = getActiveSalesInRange(rptDateFrom, rptDateTo);
      const details = getSDetails().filter(d => !d.isDeleted);
      const customers = getCustomers();
      const employees = getEmployees();

      let rows = sales.map(s => {
        const total = details.filter(d => d.transNo === s.transNo)
          .reduce((sum, d) => sum + saleLineAmount(s.transNo, d.prodCode, d.quantity, s.salesDate), 0);
        const c = customers.find(x => x.custNo === s.custNo);
        const e = employees.find(x => x.empNo === s.empNo);
        return {
          transNo: s.transNo,
          salesDate: s.salesDate,
          customer: c ? c.custName : s.custNo,
          employee: e ? (e.firstName + ' ' + e.lastName) : s.empNo,
          total
        };
      }).sort((a, b) => b.total - a.total).slice(0, rptTopN);

      const tableRows = rows.length === 0
        ? '<tr><td colspan="6"><div class="empty-state">No sales in this period.</div></td></tr>'
        : rows.map((r, i) => `<tr>
            <td>${i + 1}</td>
            <td><strong>${r.transNo}</strong></td>
            <td>${r.salesDate}</td>
            <td>${r.customer}</td>
            <td>${r.employee}</td>
            <td><strong>$${r.total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></td>
          </tr>`).join('');

      return `
        <div class="module-toolbar"><h3>Top Sales</h3></div>
        ${reportDateFilters(true)}
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Rank</th><th>Trans No</th><th>Date</th><th>Customer</th><th>Employee</th><th>Total</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>`;
    }

    // ========== USER MANAGEMENT ==========
    let umRightsEmail = null;
    let umRightsDraft = null;

    function renderUserManagement() {
      if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') {
        document.getElementById('contentArea').innerHTML = '<div class="empty-state">Access denied.</div>';
        return;
      }
      const isSuper = currentUser.role === 'superadmin';
      let list = getUsers();
      // Admin cannot see superadmin accounts
      if (!isSuper) list = list.filter(u => u.role !== 'superadmin');

      const statusBadge = s => {
        if (s === 'active') return '<span class="badge badge-active">Active</span>';
        if (s === 'blocked') return '<span class="badge badge-deleted">Blocked</span>';
        if (s === 'pending') return '<span class="badge" style="background:#fef3c7;color:#92400e;">Pending</span>';
        if (s === 'disapproved') return '<span class="badge badge-deleted">Disapproved</span>';
        return s || '—';
      };

      let rows = list.length === 0
        ? '<tr><td colspan="6"><div class="empty-state">No users.</div></td></tr>'
        : list.map(u => {
            const isSelf = u.email.toLowerCase() === currentUser.email.toLowerCase();
            let actions = '';
            // Rights: superadmin can edit anyone; admin can edit users only (not admin/superadmin)
            const canEditRights = isSuper || (u.role === 'user');
            const canEditUser = isSuper || (u.role === 'user');
            if (u.status === 'pending' && canEditUser) {
              actions += `<button class="btn-restore" onclick="umApprove('${u.email}')">Approve</button>`;
              actions += `<button class="btn-del" onclick="umDisapprove('${u.email}')">Disapprove</button>`;
            }
            if (canEditUser && !isSelf) {
              if (u.status === 'blocked') {
                actions += `<button class="btn-restore" onclick="umSetStatus('${u.email}','active')">Unblock</button>`;
              } else if (u.status === 'active') {
                actions += `<button class="btn-del" onclick="umSetStatus('${u.email}','blocked')">Block</button>`;
              }
            }
            if (canEditRights && u.role === 'user') {
              actions += `<button class="btn-edit" onclick="openUmRights('${u.email}')">Rights</button>`;
            }
            if (canEditUser) {
              actions += `<button class="btn-edit" onclick="openEditUmUser('${u.email}')">Edit</button>`;
            }
            if (!actions) actions = '—';
            return `<tr>
              <td><strong>${u.firstName} ${u.lastName || ''}</strong></td>
              <td>${u.email}</td>
              <td><span class="role-badge role-${u.role}" style="font-size:0.75rem;">${u.role}</span></td>
              <td>${statusBadge(u.status || 'active')}</td>
              <td><div class="action-btns">${actions}</div></td>
            </tr>`;
          }).join('');

      document.getElementById('contentArea').innerHTML = `
        <div class="module-toolbar">
          <h3>User Management</h3>
          <div class="toolbar-right">
            <button class="btn btn-primary btn-sm" onclick="openAddUmUser()">+ Add User</button>
          </div>
        </div>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">
          ${isSuper
            ? 'Superadmin: manage all accounts, assign Admin role, and set rights for Users.'
            : 'Admin: manage Users only. Superadmin accounts are hidden and cannot be modified.'}
        </p>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    function openAddUmUser() {
      const isSuper = currentUser.role === 'superadmin';
      document.getElementById('umUserTitle').textContent = 'Add User';
      document.getElementById('umEditEmail').value = '';
      document.getElementById('umFirst').value = '';
      document.getElementById('umLast').value = '';
      document.getElementById('umEmail').value = '';
      document.getElementById('umEmail').readOnly = false;
      document.getElementById('umStatus').value = 'active';
      document.getElementById('umRole').innerHTML = isSuper
        ? '<option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>'
        : '<option value="user">User</option>';
      document.getElementById('umUserError').classList.remove('show');
      document.getElementById('umUserModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function openEditUmUser(email) {
      const u = findUser(email); if (!u) return;
      const isSuper = currentUser.role === 'superadmin';
      if (!isSuper && u.role === 'superadmin') return;
      if (!isSuper && u.role === 'admin' && u.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        // Admin can only fully manage users; allow editing other admins only if we want — rule says admin cannot touch superadmin, can assign user rights
      }
      document.getElementById('umUserTitle').textContent = 'Edit User';
      document.getElementById('umEditEmail').value = u.email;
      document.getElementById('umFirst').value = u.firstName || '';
      document.getElementById('umLast').value = u.lastName || '';
      document.getElementById('umEmail').value = u.email;
      document.getElementById('umEmail').readOnly = true;
      document.getElementById('umStatus').value = u.status || 'active';
      if (isSuper) {
        document.getElementById('umRole').innerHTML =
          '<option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>';
      } else {
        // Admin cannot promote to admin/superadmin
        document.getElementById('umRole').innerHTML = '<option value="user">User</option>';
        if (u.role !== 'user') {
          document.getElementById('umRole').innerHTML = `<option value="${u.role}">${u.role}</option>`;
          document.getElementById('umRole').disabled = true;
        } else {
          document.getElementById('umRole').disabled = false;
        }
      }
      document.getElementById('umRole').value = u.role;
      document.getElementById('umUserError').classList.remove('show');
      document.getElementById('umUserModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeUmUserModal() {
      document.getElementById('umUserModal').classList.remove('active');
      document.getElementById('umRole').disabled = false;
      document.body.style.overflow = '';
    }
    function saveUmUser(ev) {
      ev.preventDefault();
      const err = document.getElementById('umUserError'); err.classList.remove('show');
      const isSuper = currentUser.role === 'superadmin';
      const editEmail = document.getElementById('umEditEmail').value;
      const firstName = document.getElementById('umFirst').value.trim();
      const lastName = document.getElementById('umLast').value.trim();
      const email = document.getElementById('umEmail').value.trim();
      const role = document.getElementById('umRole').value;
      const status = document.getElementById('umStatus').value;
      if (!firstName || !lastName || !email) {
        err.textContent = 'All fields required.'; err.classList.add('show'); return;
      }
      if (!isSuper && (role === 'admin' || role === 'superadmin') && !editEmail) {
        err.textContent = 'Admin can only create User accounts.'; err.classList.add('show'); return;
      }
      if (editEmail) {
        const u = findUser(editEmail); if (!u) return;
        if (!isSuper && u.role === 'superadmin') {
          err.textContent = 'Cannot modify Superadmin.'; err.classList.add('show'); return;
        }
        u.firstName = firstName; u.lastName = lastName; u.status = status;
        if (isSuper) u.role = role;
        if (role === 'superadmin' || role === 'admin') u.perms = fullPerms();
        upsertUser(u);
      } else {
        if (findUser(email)) {
          err.textContent = 'Email already exists.'; err.classList.add('show'); return;
        }
        const perms = (role === 'superadmin' || role === 'admin') ? fullPerms() : emptyPerms();
        upsertUser({ email, firstName, lastName, role, status, perms });
      }
      closeUmUserModal();
      renderUserManagement();
    }
    function umApprove(email) {
      const u = findUser(email); if (!u) return;
      if (currentUser.role === 'admin' && u.role !== 'user') return;
      u.status = 'active';
      if (!u.perms || Object.keys(u.perms).length === 0) u.perms = sampleUserPerms();
      upsertUser(u); renderUserManagement();
    }
    function umDisapprove(email) {
      const u = findUser(email); if (!u) return;
      if (currentUser.role === 'admin' && u.role !== 'user') return;
      u.status = 'disapproved'; upsertUser(u); renderUserManagement();
    }
    function umSetStatus(email, status) {
      const u = findUser(email); if (!u) return;
      if (currentUser.role === 'admin' && u.role === 'superadmin') return;
      if (email.toLowerCase() === currentUser.email.toLowerCase()) {
        alert('You cannot block your own account.'); return;
      }
      u.status = status; upsertUser(u); renderUserManagement();
    }

    function openUmRights(email) {
      const u = findUser(email); if (!u || u.role !== 'user') return;
      if (currentUser.role === 'admin' && u.role === 'superadmin') return;
      umRightsEmail = email;
      umRightsDraft = { ...(u.perms || emptyPerms()) };
      document.getElementById('umRightsTitle').textContent = 'Rights — ' + u.firstName + ' ' + (u.lastName || '');
      document.getElementById('umRightsSub').textContent = u.email;
      renderUmRightsForm();
      document.getElementById('umRightsModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeUmRightsModal() {
      document.getElementById('umRightsModal').classList.remove('active');
      document.body.style.overflow = '';
      umRightsEmail = null; umRightsDraft = null;
    }
    function renderUmRightsForm() {
      const body = document.getElementById('umRightsBody');
      body.innerHTML = PERM_GROUPS.map(g => {
        const viewOn = !!umRightsDraft[g.view];
        const items = g.items.map(k => `
          <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.9rem;${viewOn?'':'opacity:0.45;'}">
            <input type="checkbox" data-perm="${k}" ${umRightsDraft[k]?'checked':''} ${viewOn?'':'disabled'}
              onchange="umTogglePerm('${k}', this.checked)" />
            ${ALL_PERMS[k]}
          </label>`).join('');
        return `
          <div style="border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:12px;">
            <label style="display:flex;align-items:center;gap:10px;font-weight:600;margin-bottom:10px;">
              <input type="checkbox" data-perm="${g.view}" ${viewOn?'checked':''}
                onchange="umToggleView('${g.key}', this.checked)" />
              ${g.label}
              <button type="button" class="btn btn-secondary btn-sm" style="margin-left:auto;padding:4px 10px;font-size:0.75rem;"
                onclick="umSelectAllInGroup('${g.key}', true)">All</button>
              <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;font-size:0.75rem;"
                onclick="umSelectAllInGroup('${g.key}', false)">None</button>
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;padding-left:8px;">
              ${items}
            </div>
          </div>`;
      }).join('');
    }
    function umToggleView(groupKey, on) {
      const g = PERM_GROUPS.find(x => x.key === groupKey); if (!g) return;
      umRightsDraft[g.view] = on;
      if (!on) g.items.forEach(k => umRightsDraft[k] = false);
      renderUmRightsForm();
    }
    function umTogglePerm(key, on) {
      umRightsDraft[key] = on;
    }
    function umSelectAllInGroup(groupKey, on) {
      const g = PERM_GROUPS.find(x => x.key === groupKey); if (!g) return;
      umRightsDraft[g.view] = on;
      g.items.forEach(k => umRightsDraft[k] = on);
      renderUmRightsForm();
    }
    function saveUmRights() {
      if (!umRightsEmail || !umRightsDraft) return;
      const u = findUser(umRightsEmail); if (!u) return;
      u.perms = { ...umRightsDraft };
      upsertUser(u);
      closeUmRightsModal();
      renderUserManagement();
    }

    document.getElementById('umUserModal').addEventListener('click', e => {
      if (e.target.id === 'umUserModal') closeUmUserModal();
    });
    document.getElementById('umRightsModal').addEventListener('click', e => {
      if (e.target.id === 'umRightsModal') closeUmRightsModal();
    });

    // ========== SUPABASE CONNECTION SETTINGS ==========
    const SUPABASE_CONFIG_KEY = 'hope_shop_supabase_config_v1';
    let supabaseConnectionState = { type: 'idle', message: 'Not tested yet.' };

    function getSupabaseConfig() {
      try {
        return JSON.parse(localStorage.getItem(SUPABASE_CONFIG_KEY) || '{"url":"","key":""}');
      } catch (error) {
        return { url: '', key: '' };
      }
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
    }

    function renderDatabaseSettings() {
      if (!currentUser || !['superadmin', 'admin'].includes(currentUser.role)) {
        document.getElementById('contentArea').innerHTML = '<div class="empty-state">Access denied.</div>';
        return;
      }

      const config = getSupabaseConfig();
      const statusLabel = {
        idle: 'Not tested', loading: 'Testing connection…', success: 'API reachable', error: 'Connection failed'
      }[supabaseConnectionState.type] || 'Not tested';
      const statusMessage = supabaseConnectionState.message;

      document.getElementById('contentArea').innerHTML = `
        <div class="module-toolbar">
          <div>
            <h3>Supabase Database Connection</h3>
            <p class="connection-help">Configure this browser prototype to reach your Supabase project.</p>
          </div>
        </div>
        <section class="connection-card" aria-labelledby="supabaseConnectionHeading">
          <div class="connection-card-header">
            <div>
              <h3 id="supabaseConnectionHeading">Project configuration</h3>
              <p>Connection settings are stored in this browser only.</p>
            </div>
            <span id="supabaseConnectionStatus" class="connection-status status-${supabaseConnectionState.type}" role="status" aria-live="polite">${statusLabel}</span>
          </div>
          <form class="connection-form" id="supabaseConnectionForm" onsubmit="saveSupabaseConfig(event)">
            <div class="form-group">
              <label for="supabaseProjectUrl">Supabase project URL</label>
              <input type="url" id="supabaseProjectUrl" placeholder="https://your-project.supabase.co" autocomplete="url" value="${escapeHtml(config.url)}" required />
            </div>
            <div class="form-group">
              <label for="supabasePublicKey">Publishable / anon key</label>
              <input type="password" id="supabasePublicKey" placeholder="sb_publishable_… or legacy anon key" autocomplete="off" value="${escapeHtml(config.key)}" required />
            </div>
            <div class="connection-notice"><strong>Browser safety:</strong> Use only a Supabase publishable key (or legacy anon key) with Row Level Security enabled on every exposed table. Never enter a service-role or secret key here; browser code and local storage are visible to users.</div>
            <div class="connection-actions">
              <button type="submit" class="btn btn-primary">Save configuration</button>
              <button type="button" class="btn btn-outline" id="testSupabaseButton" onclick="testSupabaseConnection()" ${supabaseConnectionState.type === 'loading' ? 'disabled' : ''}>Test API connection</button>
              <button type="button" class="btn btn-secondary" onclick="clearSupabaseConfig()">Clear</button>
            </div>
            <div id="supabaseConnectionResult" class="alert ${supabaseConnectionState.type === 'error' ? 'alert-error show' : supabaseConnectionState.type === 'success' ? 'alert-success show' : 'alert-info'} connection-result" role="status" aria-live="polite">${escapeHtml(statusMessage)}</div>
          </form>
          <p class="connection-help"><strong>Prototype scope:</strong> Testing checks that Supabase's REST API endpoint responds. It does not migrate this app's localStorage data or configure database tables, authentication, or RLS policies.</p>
        </section>
      `;
    }

    function saveSupabaseConfig(event) {
      event.preventDefault();
      const urlInput = document.getElementById('supabaseProjectUrl');
      const key = document.getElementById('supabasePublicKey').value.trim();
      let url;
      try {
        url = new URL(urlInput.value.trim());
      } catch (error) {
        supabaseConnectionState = { type: 'error', message: 'Enter a valid project URL.' };
        renderDatabaseSettings();
        return;
      }
      if (url.protocol !== 'https:' || !key) {
        supabaseConnectionState = { type: 'error', message: 'Use an HTTPS project URL and provide the publishable/anon key.' };
        renderDatabaseSettings();
        return;
      }
      try {
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: url.origin, key }));
        supabaseConnectionState = { type: 'success', message: 'Configuration saved in this browser. Test the API connection to verify it.' };
      } catch (error) {
        supabaseConnectionState = { type: 'error', message: 'Could not save configuration in browser storage.' };
      }
      renderDatabaseSettings();
    }

    async function testSupabaseConnection() {
      const config = getSupabaseConfig();
      if (!config.url || !config.key) {
        supabaseConnectionState = { type: 'error', message: 'Save a project URL and publishable/anon key before testing.' };
        renderDatabaseSettings();
        return;
      }

      supabaseConnectionState = { type: 'loading', message: 'Contacting the Supabase REST API…' };
      renderDatabaseSettings();
      try {
        const response = await fetch(`${config.url.replace(/\/$/, '')}/auth/v1/health`, {
          method: 'GET',
          headers: { apikey: config.key, Accept: 'application/openapi+json, application/json' },
          signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
          const responseBody = await response.text();

          throw new Error(
            `Supabase REST API returned HTTP ${response.status}. ` +
            `Response: ${responseBody.slice(0, 300)}`
          );
        }
        supabaseConnectionState = { type: 'success', message: 'Supabase REST API responded successfully. This confirms API reachability, not table permissions or application data access.' };
      } catch (error) {
        supabaseConnectionState = {
          type: 'error',
          message: error.name === 'TimeoutError' ? 'Connection timed out. Check the project URL and network.'
            : error instanceof TypeError ? 'Could not reach the API. Verify the URL, network, and browser CORS access.'
            : error.message || 'Connection test failed.'
        };
      }
      renderDatabaseSettings();
    }

    function clearSupabaseConfig() {
      localStorage.removeItem(SUPABASE_CONFIG_KEY);
      supabaseConnectionState = { type: 'idle', message: 'Configuration cleared from this browser.' };
      renderDatabaseSettings();
    }

    function renderModulePlaceholder(page) {
      const area = document.getElementById('contentArea');
      const titles = {
        customers: 'Customer Management',
        products: 'Product Management',
        hr: 'Human Resources',
        sales: 'Sales Management',
        users: 'User Management',
        settings: 'Database Connection'
      };
      area.innerHTML = `
        <div class="panel">
          <h3>${titles[page] || page}</h3>
          <p style="color:var(--text-muted);margin-bottom:16px;">
            This module is ready for development. Here you will manage ${page} data.
          </p>
          <p style="font-size:0.9rem;color:var(--text-muted);">
            Current role: <strong>${currentUser.role}</strong> — access granted.
          </p>
        </div>
      `;
    }

    restoreSession();
