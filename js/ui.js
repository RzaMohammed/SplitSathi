/**
 * =========================================================
 * SplitSathi — Premium UI Renderer & View Engine
 * =========================================================
 */

import { stateManager } from './state.js';
import { 
  calculateNetBalances, 
  calculateRawDebts, 
  calculateSimplifiedDebts, 
  getSimplificationStats 
} from './debtEngine.js';
import { escapeHtml, groupBy, sumBy } from './utils.js';

export function formatMoney(amount, symbol = '₹') {
  const num = Math.abs(Number(amount) || 0);
  const formatted = num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${symbol}${formatted}`;
}

export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '⚡' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span aria-hidden="true">${icon}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#32C36C', '#63A7FF', '#FFB800', '#EC4899']
    });
  }
}

let miniPieChartInstance = null;
let analyticsChartInstance = null;

// Main Render Function
export function renderApp() {
  const group = stateManager.getActiveGroup();
  if (!group) return;

  const symbol = group.currency || '₹';
  const members = group.members || [];
  const expenses = group.expenses || [];
  const settlements = group.settlements || [];

  const netBalances = calculateNetBalances(members, expenses, settlements);
  const rawDebts = calculateRawDebts(members, expenses, settlements);
  const simplifiedDebts = calculateSimplifiedDebts(members, netBalances);
  const stats = getSimplificationStats(rawDebts, simplifiedDebts);

  renderDropdowns(group);
  renderHero(group);
  renderSummaryCards(group, netBalances, symbol);
  renderPaymentFlow(group, simplifiedDebts, stats, symbol);
  renderRecentExpenses(group, symbol);
  renderMembers(group, netBalances, expenses, symbol);
  renderRightPanel(group, netBalances, symbol);
  renderAnalytics(group, symbol);
  renderGroups(symbol);

  // Refresh Lucide Icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderDropdowns(group) {
  const dropdown = document.getElementById('groupSelectDropdown');
  if (dropdown) {
    dropdown.innerHTML = stateManager.state.groups.map(g => 
      `<option value="${escapeHtml(g.id)}" ${g.id === group.id ? 'selected' : ''}>${escapeHtml(g.name)}</option>`
    ).join('');
  }

  const paidBySelect = document.getElementById('expensePaidBy');
  if (paidBySelect) {
    paidBySelect.innerHTML = group.members.map(m =>
      `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)}</option>`
    ).join('');
  }
}

function renderHero(group) {
  const heroName = document.getElementById('heroGroupName');
  if (heroName) {
    heroName.innerHTML = `${escapeHtml(group.name)} <span class="status-badge"><span class="dot"></span> ${escapeHtml(group.status || 'Active')}</span>`;
  }

  const memberCount = document.getElementById('heroMemberCount');
  if (memberCount) memberCount.textContent = group.members.length;

  const createdDate = document.getElementById('heroCreatedDate');
  if (createdDate) createdDate.textContent = group.createdDate || '15 July';
}

function renderSummaryCards(group, netBalances, symbol) {
  const expenses = group.expenses || [];
  const totalExpense = sumBy(expenses, ({ amount }) => amount);

  const currentUserId = stateManager.state.currentUserMemberId || 'm_raza';
  
  let youPaid = 0;
  youPaid = sumBy(expenses.filter(({ paidBy }) => paidBy === currentUserId), ({ amount }) => amount);

  let youOwe = 0;
  let youReceive = 0;
  const userBal = netBalances[currentUserId] || 0;
  if (userBal > 0) youReceive = userBal;
  if (userBal < 0) youOwe = Math.abs(userBal);

  animateValue('statTotalExpense', totalExpense, symbol);
  animateValue('statYouPaid', youPaid, symbol);
  animateValue('statYouOwe', youOwe, symbol);
  animateValue('statYouReceive', youReceive, symbol);
}

function animateValue(elementId, targetValue, symbol) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = formatMoney(targetValue, symbol);
}

function renderPaymentFlow(group, simplifiedDebts, stats, symbol) {
  const container = document.getElementById('paymentFlowContainer');
  if (!container) return;

  const origEl = document.getElementById('metricOriginal');
  const optEl = document.getElementById('metricOptimized');
  const redEl = document.getElementById('metricReduction');

  if (origEl) origEl.textContent = stats.rawCount;
  if (optEl) optEl.textContent = stats.simplifiedCount;
  if (redEl) redEl.textContent = `${stats.reductionPercentage}%`;

  if (simplifiedDebts.length === 0) {
    container.innerHTML = `
      <div class="empty-state empty-state-success">
        🎉 Everyone is completely settled up! No pending debts.
      </div>
    `;
    return;
  }

  container.innerHTML = simplifiedDebts.map(debt => {
    const debtor = group.members.find(m => m.id === debt.from) || { name: 'Member', avatarBg: '#63A7FF' };
    const creditor = group.members.find(m => m.id === debt.to) || { name: 'Member', avatarBg: '#32C36C' };

    return `
      <div class="payment-flow-card">
        <div class="flow-user">
          <div class="avatar" style="background: ${escapeHtml(debtor.avatarBg)}">${escapeHtml(debtor.name.charAt(0))}</div>
          <div class="name">${escapeHtml(debtor.name)}</div>
        </div>

        <div class="flow-center">
          <div class="flow-amount-badge">Pay ${formatMoney(debt.amount, symbol)}</div>
          <div class="flow-arrow-animated">➔ ➔ ➔</div>
        </div>

        <div class="flow-user">
          <div class="avatar" style="background: ${escapeHtml(creditor.avatarBg)}">${escapeHtml(creditor.name.charAt(0))}</div>
          <div class="name">${escapeHtml(creditor.name)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentExpenses(group, symbol) {
  const dashboardContainer = document.getElementById('recentExpensesContainer');
  const allExpensesContainer = document.getElementById('allExpensesContainer');

  const expenses = group.expenses || [];

  const renderList = (items) => {
    if (items.length === 0) {
      return '<div class="empty-state">No expenses recorded yet.</div>';
    }

    return items.map(e => {
      const payer = group.members.find(m => m.id === e.paidBy) || { name: 'Member' };
      const splitCount = e.splits ? e.splits.length : group.members.length;

      return `
        <div class="expense-card">
          <div class="expense-left">
            <div class="expense-emoji">${e.emoji || '🍕'}</div>
            <div class="expense-info">
              <h4>${escapeHtml(e.title)}</h4>
              <p>Paid by <strong>${escapeHtml(payer.name)}</strong> • Split among ${splitCount}</p>
            </div>
          </div>
          <div class="expense-right">
            <div class="expense-amount">${formatMoney(e.amount, symbol)}</div>
            <div class="expense-date">${e.timeAgo || e.date}</div>
          </div>
        </div>
      `;
    }).join('');
  };

  if (dashboardContainer) dashboardContainer.innerHTML = renderList(expenses.slice(0, 5));
  if (allExpensesContainer) allExpensesContainer.innerHTML = renderList(expenses);
}

function renderMembers(group, netBalances, expenses, symbol) {
  const container = document.getElementById('membersGridContainer');
  if (!container) return;

  const members = group.members || [];

  container.innerHTML = members.map(m => {
    const bal = netBalances[m.id] || 0;
    
    // Calculate paid amount
    let paidTotal = 0;
    expenses.forEach(e => {
      if (e.paidBy === m.id) paidTotal += Number(e.amount) || 0;
    });

    const isPositive = bal > 0.01;
    const isNegative = bal < -0.01;
    const badgeColor = isPositive ? 'var(--secondary-green)' : isNegative ? 'var(--error-bg)' : 'var(--bg-main)';
    const textColor = isPositive ? 'var(--primary-green)' : isNegative ? 'var(--error)' : 'var(--text-secondary)';
    const statusText = isPositive ? 'Receive' : isNegative ? 'Needs to Pay' : 'Settled';

    return `
      <div class="member-card">
        <div class="member-avatar" style="background: ${escapeHtml(m.avatarBg)}">${escapeHtml(m.name.charAt(0))}</div>
        <div class="member-name">${escapeHtml(m.name)}</div>
        <div class="member-paid">Paid: <strong>${formatMoney(paidTotal, symbol)}</strong></div>

        <div class="member-balance-box" style="background: ${badgeColor}; color: ${textColor};">
          <span>Balance:</span>
          <strong>${isPositive ? '+' : ''}${formatMoney(bal, symbol)}</strong>
        </div>
        <span class="status-badge" style="margin-top: 8px; background: ${badgeColor}; color: ${textColor};">
          ${statusText}
        </span>
      </div>
    `;
  }).join('');
}

function renderRightPanel(group, netBalances, symbol) {
  const currentUserId = stateManager.state.currentUserMemberId || 'm_raza';
  const userBal = netBalances[currentUserId] || 0;

  const quickBal = document.getElementById('quickNetBalance');
  if (quickBal) {
    quickBal.textContent = `${userBal >= 0 ? '+' : '-'}${formatMoney(userBal, symbol)}`;
    quickBal.style.color = userBal >= 0 ? 'var(--primary-green)' : 'var(--error)';
  }

  // Mini Chart
  const miniCtx = document.getElementById('miniPieChart');
  if (miniCtx && window.Chart) {
    if (miniPieChartInstance) miniPieChartInstance.destroy();

    const categoryTotals = groupBy(group.expenses || [], ({ category = 'other' }) => category);
    const categoriesCount = Object.fromEntries(
      Object.entries(categoryTotals).map(([category, expenses]) => [category, sumBy(expenses, ({ amount }) => amount)])
    );
    miniPieChartInstance = new window.Chart(miniCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoriesCount),
        datasets: [{
          data: Object.values(categoriesCount),
          backgroundColor: ['#32C36C', '#63A7FF', '#A855F7', '#FFB800'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%'
      }
    });
  }
}

function renderAnalytics(group, symbol) {
  const analyticsCtx = document.getElementById('analyticsChart');
  const expenses = group.expenses || [];
  const categoryTotals = Object.fromEntries(
    Object.entries(groupBy(expenses, ({ category = 'other' }) => category))
      .map(([category, items]) => [category, sumBy(items, ({ amount }) => amount)])
  );
  const payerTotals = Object.fromEntries(
    Object.entries(groupBy(expenses, ({ paidBy = '' }) => paidBy))
      .map(([memberId, items]) => [memberId, sumBy(items, ({ amount }) => amount)])
  );
  const total = sumBy(expenses, ({ amount }) => amount);
  const [topCategory = '—', topCategoryTotal = 0] = Object.entries(categoryTotals)
    .sort(([, first], [, second]) => second - first)[0] || [];
  const [topPayerId] = Object.entries(payerTotals)
    .sort(([, first], [, second]) => second - first)[0] || [];
  const topPayer = group.members.find(({ id }) => id === topPayerId);

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('analyticsMonthlySpending', formatMoney(total, symbol));
  setText('analyticsTopCategory', topCategoryTotal ? `${topCategory} (${Math.round((topCategoryTotal / total) * 100)}%)` : '—');
  setText('analyticsTopContributor', topPayer?.name || '—');
  setText('analyticsAverageExpense', formatMoney(expenses.length ? total / expenses.length : 0, symbol));

  if (analyticsCtx && window.Chart) {
    if (analyticsChartInstance) analyticsChartInstance.destroy();

    analyticsChartInstance = new window.Chart(analyticsCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          label: `Spending (${symbol})`,
          data: Object.values(categoryTotals),
          backgroundColor: '#32C36C',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#ECECEC' } }
        }
      }
    });
  }
}

function renderGroups(symbol) {
  const container = document.getElementById('allGroupsGrid');
  if (!container) return;

  container.innerHTML = stateManager.state.groups.map((group) => {
    const total = sumBy(group.expenses || [], ({ amount }) => amount);
    return `
      <button class="member-card group-card" type="button" data-group-id="${escapeHtml(group.id)}">
        <div class="member-avatar">${escapeHtml(group.name.charAt(0))}</div>
        <div class="member-name">${escapeHtml(group.name)}</div>
        <div class="member-paid">${group.members.length} members · ${group.expenses.length} expenses</div>
        <div class="member-balance-box"><span>Total spent:</span><strong>${formatMoney(total, symbol)}</strong></div>
      </button>`;
  }).join('');

  container.querySelectorAll('[data-group-id]').forEach((card) => {
    card.addEventListener('click', () => stateManager.setActiveGroup(card.dataset.groupId));
  });
}
