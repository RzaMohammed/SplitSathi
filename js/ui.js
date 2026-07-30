/**
 * SplitSathi - UI Renderer & Fintech DOM Controller
 */

import { store } from './state.js';
import { 
  calculateNetBalances, 
  calculateRawDebts, 
  calculateSimplifiedDebts, 
  getSimplificationStats 
} from './debtEngine.js';

// Categories Mapping with Indian Context
export const CATEGORIES = {
  food: { name: 'Food & Dining', icon: '🍕', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
  travel: { name: 'Travel & Cabs', icon: '🚕', bg: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' },
  fuel: { name: 'Fuel & Petrol', icon: '⛽', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
  groceries: { name: 'Groceries & DMart', icon: '🛒', bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' },
  entertainment: { name: 'Movies & Events', icon: '🎬', bg: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' },
  housing: { name: 'Hotel & Rent', icon: '🏨', bg: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' },
  utilities: { name: 'Bills & Utilities', icon: '⚡', bg: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' },
  misc: { name: 'Miscellaneous', icon: '📦', bg: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8' }
};

// Helper: Format Money in Indian Number Format (e.g. ₹18,760)
export function formatMoney(amount, symbol = '₹') {
  const num = Math.abs(Number(amount) || 0);
  const formatted = num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${symbol}${formatted}`;
}

// Helper: Toast Message
export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '⚡' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Confetti Celebration Trigger
export function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#22C55E', '#38BDF8', '#F59E0B']
    });
  }
}

// Main Render Dispatcher
export function renderApp() {
  const group = store.getActiveGroup();
  if (!group) return;

  const symbol = group.currency || '₹';
  const members = group.members || [];
  const expenses = group.expenses || [];
  const settlements = group.settlements || [];

  const netBalances = calculateNetBalances(members, expenses, settlements);
  const rawDebts = calculateRawDebts(members, expenses, settlements);
  const simplifiedDebts = calculateSimplifiedDebts(members, netBalances);
  const stats = getSimplificationStats(rawDebts, simplifiedDebts);

  renderHeader(group);
  renderDashboardStats(group, netBalances, simplifiedDebts, symbol);
  renderAIInsights(group, netBalances, simplifiedDebts, stats, symbol);
  renderSettlementsSection(group, netBalances, rawDebts, simplifiedDebts, stats, symbol);
  renderExpensesSection(group, symbol);
  renderMembersSection(group, netBalances, symbol);
  renderAnalyticsSection(group, symbol);
}

function renderHeader(group) {
  const groupSelect = document.getElementById('groupSelect');
  if (groupSelect) {
    groupSelect.innerHTML = store.state.groups.map(g => 
      `<option value="${g.id}" ${g.id === group.id ? 'selected' : ''}>${g.name}</option>`
    ).join('');
  }

  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) currencySelect.value = group.currency || '₹';

  const filterMember = document.getElementById('filterMember');
  if (filterMember) {
    const currentVal = filterMember.value;
    filterMember.innerHTML = '<option value="all">All Payers</option>' + group.members.map(m => 
      `<option value="${m.id}" ${m.id === currentVal ? 'selected' : ''}>Paid by ${m.name}</option>`
    ).join('');
  }
}

// Render 4 Stat Cards
function renderDashboardStats(group, netBalances, simplifiedDebts, symbol) {
  const expenses = group.expenses || [];
  const totalGroupExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const currentUserId = store.state.currentUserMemberId || (group.members[0] ? group.members[0].id : null);
  
  let youOwe = 0;
  let youReceive = 0;

  if (currentUserId) {
    const userBal = netBalances[currentUserId] || 0;
    if (userBal > 0) youReceive = userBal;
    if (userBal < 0) youOwe = Math.abs(userBal);
  }

  const elTotal = document.getElementById('statTotalExpense');
  if (elTotal) elTotal.textContent = formatMoney(totalGroupExpense, symbol);

  const elOwe = document.getElementById('statYouOwe');
  if (elOwe) elOwe.textContent = formatMoney(youOwe, symbol);

  const elReceive = document.getElementById('statYouReceive');
  if (elReceive) elReceive.textContent = formatMoney(youReceive, symbol);

  const elMembers = document.getElementById('statMembersCount');
  if (elMembers) elMembers.textContent = group.members.length;
}

// AI Insights Panel
function renderAIInsights(group, netBalances, simplifiedDebts, stats, symbol) {
  const container = document.getElementById('aiInsightsList');
  if (!container) return;

  const expenses = group.expenses || [];
  if (expenses.length === 0) {
    container.innerHTML = '<div class="ai-insight-card"><span class="icon">✨</span> Log your first expense to unlock AI Insights!</div>';
    return;
  }

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + (Number(e.amount) || 0); });
  const topCatKey = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0] || 'food';
  const topCatName = CATEGORIES[topCatKey] ? CATEGORIES[topCatKey].name : 'Food';
  const topCatPct = totalSpent > 0 ? Math.round((catTotals[topCatKey] / totalSpent) * 100) : 0;

  const memberPaid = {};
  group.members.forEach(m => { memberPaid[m.id] = 0; });
  expenses.forEach(e => { if (memberPaid[e.paidBy] !== undefined) memberPaid[e.paidBy] += Number(e.amount); });
  const topSpenderId = Object.keys(memberPaid).sort((a, b) => memberPaid[b] - memberPaid[a])[0];
  const topSpender = group.members.find(m => m.id === topSpenderId) || { name: 'Someone' };

  container.innerHTML = `
    <div class="ai-insight-card">
      <span class="icon">📊</span>
      <div><strong>${topCatName}</strong> accounted for <strong>${topCatPct}%</strong> of total group spending (${formatMoney(catTotals[topCatKey] || 0, symbol)}).</div>
    </div>

    <div class="ai-insight-card">
      <span class="icon">⚡</span>
      <div>Debt algorithm reduced transfers from <strong>${stats.rawCount}</strong> down to <strong>${stats.simplifiedCount}</strong> optimal payments (${stats.reductionPercentage}% savings).</div>
    </div>

    <div class="ai-insight-card">
      <span class="icon">🏆</span>
      <div><strong>${topSpender.name}</strong> paid the highest upfront amount (${formatMoney(memberPaid[topSpenderId] || 0, symbol)}).</div>
    </div>

    <div class="ai-insight-card">
      <span class="icon">💡</span>
      <div>Smart tip: Settling dues promptly maintains perfect credit score among friends!</div>
    </div>
  `;
}

// Settlements Section
function renderSettlementsSection(group, netBalances, rawDebts, simplifiedDebts, stats, symbol) {
  const isSimplifiedView = store.isViewSimplified();
  const currentDebts = isSimplifiedView ? simplifiedDebts : rawDebts;

  const elRawCount = document.getElementById('statOriginalTx');
  const elOptCount = document.getElementById('statOptimizedTx');
  const elSavings = document.getElementById('statSavingsPct');

  if (elRawCount) elRawCount.textContent = stats.rawCount;
  if (elOptCount) elOptCount.textContent = stats.simplifiedCount;
  if (elSavings) elSavings.textContent = `${stats.reductionPercentage}%`;

  const btnSimplified = document.getElementById('toggleSimplifiedView');
  const btnRaw = document.getElementById('toggleRawView');
  if (btnSimplified && btnRaw) {
    btnSimplified.classList.toggle('active', isSimplifiedView);
    btnRaw.classList.toggle('active', !isSimplifiedView);
  }

  const container = document.getElementById('settlementCardsGrid');
  if (!container) return;

  if (currentDebts.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
        <h3>All Debts Settled!</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">
          Everyone is even in ${group.name}. No pending transfers needed.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = currentDebts.map(debt => {
    const debtor = group.members.find(m => m.id === debt.from) || { name: 'Member', avatarBg: '#64748b' };
    const creditor = group.members.find(m => m.id === debt.to) || { name: 'Member', avatarBg: '#64748b' };

    return `
      <div class="settlement-card">
        <div class="settlement-flow">
          <div class="settlement-user">
            <div class="avatar" style="background: ${debtor.avatarBg}">${debtor.name.charAt(0)}</div>
            <div class="user-name">${debtor.name}</div>
          </div>

          <div class="settlement-arrow-box">
            <div style="font-size: 0.725rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Needs to Pay</div>
            <div class="settlement-amount-tag">${formatMoney(debt.amount, symbol)}</div>
            <div class="settlement-animated-arrow">➔</div>
          </div>

          <div class="settlement-user">
            <div class="avatar" style="background: ${creditor.avatarBg}">${creditor.name.charAt(0)}</div>
            <div class="user-name">${creditor.name}</div>
          </div>
        </div>

        <button class="btn btn-emerald btn-sm btn-settle-action" 
                data-from="${debt.from}" 
                data-to="${debt.to}" 
                data-amount="${debt.amount}"
                style="width: 100%; margin-top: 0.5rem;">
          🤝 Click to Settle Up (${formatMoney(debt.amount, symbol)})
        </button>
      </div>
    `;
  }).join('');
}

// Expenses Timeline Section with Detailed Participant Splits Breakdown
function renderExpensesSection(group, symbol) {
  const container = document.getElementById('expensesTimelineList');
  if (!container) return;

  const searchInput = document.getElementById('searchExpense');
  const catFilter = document.getElementById('filterCategory');
  const memberFilter = document.getElementById('filterMember');

  const search = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const cat = catFilter ? catFilter.value : 'all';
  const member = memberFilter ? memberFilter.value : 'all';

  let expenses = group.expenses || [];

  if (search) expenses = expenses.filter(e => e.title.toLowerCase().includes(search));
  if (cat !== 'all') expenses = expenses.filter(e => e.category === cat);
  if (member !== 'all') expenses = expenses.filter(e => e.paidBy === member);

  if (expenses.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧾</div>
        <h3>No Expenses Found</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem;">
          Log shared bills for Domino's, Ola, DMart, Fuel, or Movies.
        </p>
        <button class="btn btn-primary btn-open-add-expense">+ Add Your First Expense</button>
      </div>
    `;
    return;
  }

  container.innerHTML = expenses.map(e => {
    const categoryInfo = CATEGORIES[e.category] || CATEGORIES.misc;
    const payer = group.members.find(m => m.id === e.paidBy) || { name: 'Unknown' };

    let splitModeText = 'Equally';
    if (e.splitType === 'exact') splitModeText = 'Exact Rupee';
    if (e.splitType === 'percentage') splitModeText = '% Percentage';
    if (e.splitType === 'shares') splitModeText = 'Shares';

    const splitsPills = (e.splits || []).map(s => {
      const m = group.members.find(mem => mem.id === s.memberId);
      if (!m) return '';
      const pctExtra = (e.splitType === 'percentage' && s.value) ? ` (${s.value}%)` : '';
      return `<span style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.75rem;">👤 <strong>${m.name.split(' ')[0]}</strong>: ${formatMoney(s.amount, symbol)}${pctExtra}</span>`;
    }).filter(Boolean).join(' ');

    return `
      <div class="expense-item-card">
        <div class="expense-main-info" style="flex: 1;">
          <div class="cat-avatar" style="background: ${categoryInfo.bg}">
            ${categoryInfo.icon}
          </div>
          <div class="expense-details" style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <h4>${e.title}</h4>
              <span class="badge badge-purple" style="font-size: 0.7rem;">Split: ${splitModeText}</span>
            </div>

            <div class="expense-meta-row" style="margin-top: 0.2rem;">
              <span>Paid by <strong style="color:var(--text-main);">${payer.name}</strong></span>
              <span>•</span>
              <span>${e.date}</span>
              <span>•</span>
              <span class="badge badge-blue" style="font-size: 0.7rem;">${categoryInfo.name}</span>
            </div>

            ${splitsPills ? `
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <span style="font-size: 0.75rem; color: var(--text-secondary); align-self: center;">Breakdown:</span>
                ${splitsPills}
              </div>
            ` : ''}

            ${e.notes ? `<div style="font-size: 0.75rem; color: var(--text-secondary); font-style: italic; margin-top: 0.25rem;">Note: "${e.notes}"</div>` : ''}
          </div>
        </div>

        <div class="expense-price-box" style="margin-left: 1rem;">
          <div class="expense-price">${formatMoney(e.amount, symbol)}</div>
          <div style="display: flex; gap: 0.35rem; justify-content: flex-end; margin-top: 0.4rem;">
            <button class="btn btn-glass btn-sm btn-edit-expense" data-id="${e.id}">✏️ Edit</button>
            <button class="btn btn-danger-ghost btn-sm btn-delete-expense" data-id="${e.id}">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Members Section
function renderMembersSection(group, netBalances, symbol) {
  const container = document.getElementById('membersGridCards');
  if (!container) return;

  const members = group.members || [];

  container.innerHTML = members.map(m => {
    const bal = netBalances[m.id] || 0;
    
    let totalPaid = 0;
    let totalShare = 0;

    group.expenses.forEach(e => {
      if (e.paidBy === m.id) totalPaid += Number(e.amount || 0);
      if (e.splits) {
        const s = e.splits.find(sp => sp.memberId === m.id);
        if (s) totalShare += Number(s.amount || 0);
      }
    });

    let badgeText = 'Settled Up';
    let badgeClass = 'badge-blue';
    if (bal > 0.01) {
      badgeText = `Will Receive ${formatMoney(bal, symbol)}`;
      badgeClass = 'badge-emerald';
    } else if (bal < -0.01) {
      badgeText = `Needs to Pay ${formatMoney(Math.abs(bal), symbol)}`;
      badgeClass = 'badge-purple';
    }

    return `
      <div class="member-card-box">
        <div>
          <div class="member-card-header">
            <div class="member-info-group">
              <div class="avatar" style="background: ${m.avatarBg}">${m.name.charAt(0)}</div>
              <h4>${m.name}</h4>
            </div>
            <button class="btn btn-danger-ghost btn-sm btn-remove-member" data-id="${m.id}">🗑️</button>
          </div>

          <div class="member-paid-row">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Total Paid</div>
              <div style="font-size: 1rem; font-weight: 700; color: var(--primary);">${formatMoney(totalPaid, symbol)}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Fair Share</div>
              <div style="font-size: 1rem; font-weight: 700; color: var(--text-main);">${formatMoney(totalShare, symbol)}</div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">Status</span>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Analytics Section
function renderAnalyticsSection(group, symbol) {
  const catList = document.getElementById('analyticsCategoryList');
  const memberList = document.getElementById('analyticsMemberList');
  if (!catList || !memberList) return;

  const expenses = group.expenses || [];
  const totalGroupSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  if (totalGroupSpent === 0) {
    catList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No spending data recorded.</p>';
    memberList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No spending data recorded.</p>';
    return;
  }

  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount || 0);
  });

  const sortedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

  catList.innerHTML = sortedCats.map(catKey => {
    const cat = CATEGORIES[catKey] || CATEGORIES.misc;
    const amt = catTotals[catKey];
    const pct = Math.round((amt / totalGroupSpent) * 100);

    return `
      <div class="progress-container">
        <div class="progress-header">
          <span>${cat.icon} ${cat.name}</span>
          <span>${formatMoney(amt, symbol)} (${pct}%)</span>
        </div>
        <div class="progress-bg">
          <div class="progress-bar-fill" style="width: ${pct}%; background: ${cat.color};"></div>
        </div>
      </div>
    `;
  }).join('');

  const memberShares = {};
  group.members.forEach(m => { memberShares[m.id] = 0; });
  expenses.forEach(e => {
    if (e.splits) {
      e.splits.forEach(s => {
        if (memberShares[s.memberId] !== undefined) {
          memberShares[s.memberId] += Number(s.amount || 0);
        }
      });
    }
  });

  memberList.innerHTML = group.members.map(m => {
    const shareAmt = memberShares[m.id] || 0;
    const pct = totalGroupSpent > 0 ? Math.round((shareAmt / totalGroupSpent) * 100) : 0;

    return `
      <div class="progress-container">
        <div class="progress-header">
          <span>👤 ${m.name}</span>
          <span>${formatMoney(shareAmt, symbol)} (${pct}%)</span>
        </div>
        <div class="progress-bg">
          <div class="progress-bar-fill" style="width: ${pct}%; background: ${m.avatarBg};"></div>
        </div>
      </div>
    `;
  }).join('');
}
