/**
 * SplitSathi - Main Application Controller & Event Bindings
 */

import { store } from './state.js';
import { renderApp, showToast, formatMoney, triggerConfetti, CATEGORIES } from './ui.js';

let currentSplitMode = 'equal';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const theme = store.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeBtnText(theme);

  store.subscribe(() => {
    renderApp();
    renderDashboardFeeds();
  });

  renderApp();
  renderDashboardFeeds();

  bindNavTabEvents();
  bindHeaderEvents();
  bindOverviewEvents();
  bindExpenseModalEvents();
  bindMemberModalEvents();
  bindSettleModalEvents();
  bindDemoModalEvents();
  bindExportModalEvents();
  bindModalCloseHandlers();
  bindGuideEvents();
}

function bindGuideEvents() {
  const btnHide = document.getElementById('btnHideGuide');
  if (btnHide) {
    btnHide.addEventListener('click', () => {
      const banner = document.querySelector('.quick-start-banner');
      if (banner) banner.style.display = 'none';
    });
  }
}

// ----------------------------------------------------
// Navigation Tab Switcher
// ----------------------------------------------------
function bindNavTabEvents() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const navKey = item.getAttribute('data-nav');

      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = document.getElementById(`pane-${navKey}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function bindHeaderEvents() {
  const groupSelect = document.getElementById('groupSelect');
  if (groupSelect) {
    groupSelect.addEventListener('change', (e) => {
      store.setActiveGroup(e.target.value);
      showToast(`Active group set to ${store.getActiveGroup().name}`, 'info');
    });
  }

  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      store.setCurrency(e.target.value);
      showToast(`Currency updated to ${e.target.value}`, 'info');
    });
  }

  const btnTheme = document.getElementById('btnToggleTheme');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const current = store.getTheme();
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      store.setTheme(nextTheme);
      updateThemeBtnText(nextTheme);
    });
  }
}

function updateThemeBtnText(theme) {
  const btnTheme = document.getElementById('btnToggleTheme');
  if (btnTheme) btnTheme.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// Render Dashboard Feeds (Recent Expenses + Settlements)
function renderDashboardFeeds() {
  const group = store.getActiveGroup();
  if (!group) return;

  const symbol = group.currency || '₹';
  const feedExpenses = document.getElementById('dashExpensesFeed');
  const feedSettlements = document.getElementById('dashSettlementsFeed');

  if (feedExpenses) {
    const expenses = (group.expenses || []).slice(0, 5);
    if (expenses.length === 0) {
      feedExpenses.innerHTML = '<p style="color:var(--text-secondary); font-size:0.875rem;">No recent expenses.</p>';
    } else {
      feedExpenses.innerHTML = expenses.map(e => {
        const cat = CATEGORIES[e.category] || CATEGORIES.misc;
        const payer = group.members.find(m => m.id === e.paidBy) || { name: 'Member' };

        const splitsSummary = e.splits ? e.splits.map(s => {
          const m = group.members.find(mem => mem.id === s.memberId);
          return m ? `${m.name.split(' ')[0]}: ${formatMoney(s.amount, symbol)}` : '';
        }).filter(Boolean).join(' • ') : '';

        return `
          <div class="expense-item-card" style="padding: 0.85rem 1rem;">
            <div class="expense-main-info">
              <div class="cat-avatar" style="width: 38px; height: 38px; font-size: 1.1rem; background: ${cat.bg}">${cat.icon}</div>
              <div>
                <h4 style="font-size: 0.95rem;">${e.title}</h4>
                <div style="font-size: 0.775rem; color: var(--text-secondary);">Paid by ${payer.name} • ${e.date}</div>
                ${splitsSummary ? `<div style="font-size: 0.725rem; color: var(--emerald); margin-top: 0.2rem; font-weight:600;">Splits: ${splitsSummary}</div>` : ''}
              </div>
            </div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">${formatMoney(e.amount, symbol)}</div>
          </div>
        `;
      }).join('');
    }
  }

  if (feedSettlements) {
    feedSettlements.innerHTML = `
      <div style="background: var(--bg-card-solid); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Optimal Minimal Debt Transfers</div>
        <button class="btn btn-emerald btn-sm btn-nav-to-settlements" style="width: 100%;">
          ⚡ View Settlement Breakdown
        </button>
      </div>
    `;
  }
}

// Overview Events & Global Delegated Listeners
function bindOverviewEvents() {
  const btnSimplified = document.getElementById('toggleSimplifiedView');
  const btnRaw = document.getElementById('toggleRawView');

  if (btnSimplified) btnSimplified.addEventListener('click', () => store.setViewSimplified(true));
  if (btnRaw) btnRaw.addEventListener('click', () => store.setViewSimplified(false));

  document.addEventListener('click', (e) => {
    const settleBtn = e.target.closest('.btn-settle-action');
    if (settleBtn) {
      const fromId = settleBtn.getAttribute('data-from');
      const toId = settleBtn.getAttribute('data-to');
      const amount = settleBtn.getAttribute('data-amount');
      openSettleModal(fromId, toId, amount);
    }

    const navToSettlements = e.target.closest('.btn-nav-to-settlements');
    if (navToSettlements) {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const item = document.querySelector('[data-nav="settlements"]');
      if (item) item.classList.add('active');
      const pane = document.getElementById('pane-settlements');
      if (pane) pane.classList.add('active');
    }

    const addExpenseBtn = e.target.closest('.btn-open-add-expense');
    if (addExpenseBtn) openExpenseModal();

    const addMemberBtn = e.target.closest('.btn-open-add-member');
    if (addMemberBtn) openModal('modalMember');

    const deleteExpenseBtn = e.target.closest('.btn-delete-expense');
    if (deleteExpenseBtn) {
      const id = deleteExpenseBtn.getAttribute('data-id');
      if (confirm('Delete expense?')) {
        store.deleteExpense(id);
        showToast('Expense deleted', 'warning');
      }
    }

    const editExpenseBtn = e.target.closest('.btn-edit-expense');
    if (editExpenseBtn) {
      openExpenseModal(editExpenseBtn.getAttribute('data-id'));
    }

    const removeMemberBtn = e.target.closest('.btn-remove-member');
    if (removeMemberBtn) {
      const id = removeMemberBtn.getAttribute('data-id');
      if (confirm('Remove group member?')) {
        store.removeMember(id);
        showToast('Member removed', 'warning');
      }
    }
  });

  const searchInput = document.getElementById('searchExpense');
  const catFilter = document.getElementById('filterCategory');
  const memberFilter = document.getElementById('filterMember');

  if (searchInput) searchInput.addEventListener('input', () => renderApp());
  if (catFilter) catFilter.addEventListener('change', () => renderApp());
  if (memberFilter) memberFilter.addEventListener('change', () => renderApp());
}

// ----------------------------------------------------
// Custom Split Engine & Expense Modal
// ----------------------------------------------------
function bindExpenseModalEvents() {
  const formExpense = document.getElementById('formExpense');
  const amountInput = document.getElementById('expenseAmountInput');

  const splitTabBtns = document.querySelectorAll('.split-tab-btn');
  splitTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      splitTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSplitMode = btn.getAttribute('data-split');
      renderSplitMemberRows();
    });
  });

  if (amountInput) {
    amountInput.addEventListener('input', () => renderSplitMemberRows());
  }

  if (formExpense) {
    formExpense.addEventListener('submit', (e) => {
      e.preventDefault();
      saveExpenseForm();
    });
  }
}

function openExpenseModal(editExpenseId = null) {
  const group = store.getActiveGroup();
  if (!group || group.members.length === 0) {
    showToast('Add at least 1 member first!', 'warning');
    openModal('modalMember');
    return;
  }

  const form = document.getElementById('formExpense');
  form.reset();

  const editIdInput = document.getElementById('expenseEditId');
  const titleHeader = document.getElementById('modalExpenseTitle');
  const paidBySelect = document.getElementById('expensePaidBySelect');
  const dateInput = document.getElementById('expenseDateInput');

  paidBySelect.innerHTML = group.members.map(m => 
    `<option value="${m.id}">${m.name}</option>`
  ).join('');

  if (editExpenseId) {
    const expense = group.expenses.find(e => e.id === editExpenseId);
    if (expense) {
      editIdInput.value = expense.id;
      titleHeader.textContent = 'Edit Expense';
      document.getElementById('expenseTitleInput').value = expense.title;
      document.getElementById('expenseAmountInput').value = expense.amount;
      document.getElementById('expenseCategorySelect').value = expense.category;
      paidBySelect.value = expense.paidBy;
      dateInput.value = expense.date;
      if (document.getElementById('expenseNotesInput')) {
        document.getElementById('expenseNotesInput').value = expense.notes || '';
      }

      currentSplitMode = expense.splitType || 'equal';
      document.querySelectorAll('.split-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-split') === currentSplitMode);
      });

      renderSplitMemberRows(expense.splits);
    }
  } else {
    editIdInput.value = '';
    titleHeader.textContent = 'Log New Shared Expense';
    dateInput.value = new Date().toISOString().split('T')[0];
    currentSplitMode = 'equal';
    document.querySelectorAll('.split-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-split') === 'equal');
    });

    renderSplitMemberRows();
  }

  openModal('modalExpense');
}

function renderSplitMemberRows(existingSplits = null) {
  const group = store.getActiveGroup();
  if (!group) return;

  const container = document.getElementById('splitMembersList');
  const totalAmount = Number(document.getElementById('expenseAmountInput').value) || 0;
  const symbol = group.currency || '₹';
  const members = group.members;

  if (currentSplitMode === 'equal') {
    container.innerHTML = members.map(m => {
      const isChecked = existingSplits ? Boolean(existingSplits.find(s => s.memberId === m.id)) : true;
      return `
        <div class="split-member-row" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.5rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
          <label style="display:flex; align-items:center; gap:0.6rem; cursor:pointer;">
            <input type="checkbox" class="chk-equal-member" data-id="${m.id}" ${isChecked ? 'checked' : ''}>
            <div class="avatar" style="background: ${m.avatarBg}; width: 26px; height: 26px; font-size: 0.7rem;">${m.name.charAt(0)}</div>
            <span style="font-size: 0.85rem; font-weight: 600;">${m.name}</span>
          </label>
          <span class="preview-share" id="preview_equal_${m.id}" style="font-size: 0.85rem; color: var(--emerald); font-weight: 700;">
            ${symbol}0
          </span>
        </div>
      `;
    }).join('');

    updateEqualPreviews(totalAmount, symbol);
    container.querySelectorAll('.chk-equal-member').forEach(chk => {
      chk.addEventListener('change', () => updateEqualPreviews(totalAmount, symbol));
    });

  } else if (currentSplitMode === 'exact') {
    container.innerHTML = members.map(m => {
      const existing = existingSplits ? existingSplits.find(s => s.memberId === m.id) : null;
      const initialVal = existing ? existing.amount : (totalAmount / members.length).toFixed(0);
      return `
        <div class="split-member-row" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.4rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div class="avatar" style="background: ${m.avatarBg}; width: 26px; height: 26px; font-size: 0.7rem;">${m.name.charAt(0)}</div>
            <span style="font-size: 0.85rem; font-weight: 600;">${m.name}</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <input type="number" class="input-control split-exact-input" data-id="${m.id}" value="${initialVal}" style="width: 90px; padding: 0.35rem;" step="1" min="0">
          </div>
        </div>
      `;
    }).join('');

    updateExactValidation(totalAmount, symbol);
    container.querySelectorAll('.split-exact-input').forEach(inp => {
      inp.addEventListener('input', () => updateExactValidation(totalAmount, symbol));
    });

  } else if (currentSplitMode === 'percentage') {
    container.innerHTML = members.map(m => {
      const existing = existingSplits ? existingSplits.find(s => s.memberId === m.id) : null;
      const initialVal = existing && existing.value !== undefined ? existing.value : (100 / members.length).toFixed(0);
      return `
        <div class="split-member-row" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.4rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div class="avatar" style="background: ${m.avatarBg}; width: 26px; height: 26px; font-size: 0.7rem;">${m.name.charAt(0)}</div>
            <span style="font-size: 0.85rem; font-weight: 600;">${m.name}</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="display:flex; align-items:center; gap:0.2rem;">
              <input type="number" class="input-control split-pct-input" data-id="${m.id}" value="${initialVal}" style="width: 65px; padding: 0.35rem;" step="1" min="0" max="100">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">%</span>
            </div>
            <span id="preview_pct_${m.id}" style="font-size: 0.85rem; font-weight: 700; color: var(--emerald); min-width: 75px; text-align: right;">
              ${symbol}0
            </span>
          </div>
        </div>
      `;
    }).join('');

    updatePctValidation(totalAmount, symbol);
    container.querySelectorAll('.split-pct-input').forEach(inp => {
      inp.addEventListener('input', () => updatePctValidation(totalAmount, symbol));
    });

  } else if (currentSplitMode === 'shares') {
    container.innerHTML = members.map(m => {
      const existing = existingSplits ? existingSplits.find(s => s.memberId === m.id) : null;
      const initialVal = existing && existing.value !== undefined ? existing.value : 1;
      return `
        <div class="split-member-row" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.4rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div class="avatar" style="background: ${m.avatarBg}; width: 26px; height: 26px; font-size: 0.7rem;">${m.name.charAt(0)}</div>
            <span style="font-size: 0.85rem; font-weight: 600;">${m.name}</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <input type="number" class="input-control split-shares-input" data-id="${m.id}" value="${initialVal}" style="width: 65px; padding: 0.35rem;" step="1" min="0">
            <span id="preview_share_${m.id}" style="font-size: 0.85rem; font-weight: 700; color: var(--emerald); min-width: 75px; text-align: right;">
              ${symbol}0
            </span>
          </div>
        </div>
      `;
    }).join('');

    updateSharesValidation(totalAmount, symbol);
    container.querySelectorAll('.split-shares-input').forEach(inp => {
      inp.addEventListener('input', () => updateSharesValidation(totalAmount, symbol));
    });
  }
}

function updateEqualPreviews(totalAmount, symbol) {
  const chks = document.querySelectorAll('.chk-equal-member:checked');
  const alertEl = document.getElementById('splitValidationAlert');
  if (chks.length === 0) {
    alertEl.style.display = 'block';
    alertEl.className = 'badge badge-purple';
    alertEl.textContent = '⚠️ Select at least 1 member to split cost';
    return false;
  }

  const perPerson = totalAmount > 0 ? (totalAmount / chks.length) : 0;
  document.querySelectorAll('.chk-equal-member').forEach(chk => {
    const el = document.getElementById(`preview_equal_${chk.getAttribute('data-id')}`);
    if (el) el.textContent = chk.checked ? formatMoney(perPerson, symbol) : `${symbol}0`;
  });

  alertEl.style.display = 'block';
  alertEl.className = 'badge badge-emerald';
  alertEl.textContent = `✅ Equal split: ${formatMoney(perPerson, symbol)} each (${chks.length} members)`;
  return true;
}

function updateExactValidation(totalAmount, symbol) {
  const alertEl = document.getElementById('splitValidationAlert');
  let allocated = 0;
  document.querySelectorAll('.split-exact-input').forEach(i => { allocated += Number(i.value) || 0; });
  const diff = totalAmount - allocated;

  alertEl.style.display = 'block';
  if (Math.abs(diff) < 1) {
    alertEl.className = 'badge badge-emerald';
    alertEl.textContent = `✅ Exact sum matches total (${formatMoney(totalAmount, symbol)})`;
    return true;
  } else {
    alertEl.className = 'badge badge-purple';
    alertEl.textContent = `⚠️ Allocated ${formatMoney(allocated, symbol)} / ${formatMoney(totalAmount, symbol)}`;
    return false;
  }
}

function updatePctValidation(totalAmount, symbol) {
  const alertEl = document.getElementById('splitValidationAlert');
  let totalPct = 0;

  document.querySelectorAll('.split-pct-input').forEach(inp => {
    const id = inp.getAttribute('data-id');
    const pct = Number(inp.value) || 0;
    totalPct += pct;

    const calcAmount = totalAmount > 0 ? (totalAmount * (pct / 100)) : 0;
    const previewEl = document.getElementById(`preview_pct_${id}`);
    if (previewEl) {
      previewEl.textContent = `= ${formatMoney(calcAmount, symbol)}`;
    }
  });

  totalPct = Math.round(totalPct * 10) / 10;
  alertEl.style.display = 'block';

  if (Math.abs(totalPct - 100) < 0.5) {
    alertEl.className = 'badge badge-emerald';
    alertEl.textContent = `✅ Percentages sum to 100% (${formatMoney(totalAmount, symbol)})`;
    return true;
  } else {
    alertEl.className = 'badge badge-purple';
    alertEl.textContent = `⚠️ Total percentage is ${totalPct}% (must equal 100%)`;
    return false;
  }
}

function updateSharesValidation(totalAmount, symbol) {
  const alertEl = document.getElementById('splitValidationAlert');
  let totalShares = 0;

  document.querySelectorAll('.split-shares-input').forEach(i => { totalShares += Number(i.value) || 0; });

  document.querySelectorAll('.split-shares-input').forEach(inp => {
    const id = inp.getAttribute('data-id');
    const sh = Number(inp.value) || 0;
    const calcAmount = (totalAmount > 0 && totalShares > 0) ? (totalAmount * (sh / totalShares)) : 0;
    const previewEl = document.getElementById(`preview_share_${id}`);
    if (previewEl) {
      previewEl.textContent = `= ${formatMoney(calcAmount, symbol)}`;
    }
  });

  alertEl.style.display = 'block';
  if (totalShares > 0) {
    const valPerShare = totalAmount > 0 ? (totalAmount / totalShares) : 0;
    alertEl.className = 'badge badge-emerald';
    alertEl.textContent = `✅ ${totalShares} total shares (${formatMoney(valPerShare, symbol)} per share)`;
    return true;
  } else {
    alertEl.className = 'badge badge-purple';
    alertEl.textContent = `⚠️ Assign at least 1 total share`;
    return false;
  }
}

function saveExpenseForm() {
  const title = document.getElementById('expenseTitleInput').value;
  const amount = Number(document.getElementById('expenseAmountInput').value) || 0;
  const category = document.getElementById('expenseCategorySelect').value;
  const paidBy = document.getElementById('expensePaidBySelect').value;
  const date = document.getElementById('expenseDateInput').value;
  const notes = document.getElementById('expenseNotesInput') ? document.getElementById('expenseNotesInput').value : '';
  const editId = document.getElementById('expenseEditId').value;
  const group = store.getActiveGroup();
  const symbol = group.currency || '₹';

  if (amount <= 0) {
    showToast('Enter a valid amount', 'warning');
    return;
  }

  const splits = [];

  if (currentSplitMode === 'equal') {
    if (!updateEqualPreviews(amount, symbol)) return;
    const chks = document.querySelectorAll('.chk-equal-member:checked');
    const perPerson = amount / chks.length;
    chks.forEach(chk => splits.push({ memberId: chk.getAttribute('data-id'), amount: perPerson }));

  } else if (currentSplitMode === 'exact') {
    if (!updateExactValidation(amount, symbol)) return;
    document.querySelectorAll('.split-exact-input').forEach(inp => {
      splits.push({ memberId: inp.getAttribute('data-id'), amount: Number(inp.value) || 0 });
    });

  } else if (currentSplitMode === 'percentage') {
    if (!updatePctValidation(amount, symbol)) return;
    document.querySelectorAll('.split-pct-input').forEach(inp => {
      const pct = Number(inp.value) || 0;
      splits.push({ memberId: inp.getAttribute('data-id'), amount: amount * (pct / 100), value: pct });
    });

  } else if (currentSplitMode === 'shares') {
    if (!updateSharesValidation(amount, symbol)) return;
    let totalShares = 0;
    document.querySelectorAll('.split-shares-input').forEach(i => totalShares += Number(i.value) || 0);

    document.querySelectorAll('.split-shares-input').forEach(inp => {
      const sh = Number(inp.value) || 0;
      splits.push({ memberId: inp.getAttribute('data-id'), amount: totalShares > 0 ? (amount * (sh / totalShares)) : 0, value: sh });
    });
  }

  const payload = { title, amount, category, paidBy, date, splitType: currentSplitMode, splits, notes };

  if (editId) {
    store.updateExpense(editId, payload);
    showToast('Expense updated!', 'success');
  } else {
    store.addExpense(payload);
    showToast('New expense added!', 'success');
  }

  closeModal('modalExpense');
}

// Member & Settlement Modals
function bindMemberModalEvents() {
  const formMember = document.getElementById('formMember');
  if (formMember) {
    formMember.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('memberNameInput');
      if (input && input.value.trim()) {
        store.addMember(input.value.trim());
        input.value = '';
        closeModal('modalMember');
        showToast('Member added!', 'success');
      }
    });
  }
}

function bindSettleModalEvents() {
  const formSettle = document.getElementById('formSettle');
  if (formSettle) {
    formSettle.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = document.getElementById('settleFromSelect').value;
      const to = document.getElementById('settleToSelect').value;
      const amount = Number(document.getElementById('settleAmountInput').value) || 0;
      const notes = document.getElementById('settleNotesInput').value;

      if (from === to) {
        showToast('Payer and recipient cannot be the same', 'warning');
        return;
      }

      if (amount <= 0) {
        showToast('Enter valid settlement amount', 'warning');
        return;
      }

      store.addSettlement(from, to, amount, notes);
      closeModal('modalSettle');
      triggerConfetti();
      showToast('Settlement payment recorded! 🎉', 'success');
    });
  }
}

function openSettleModal(fromId = null, toId = null, defaultAmount = '') {
  const group = store.getActiveGroup();
  if (!group || group.members.length < 2) return;

  const fromSel = document.getElementById('settleFromSelect');
  const toSel = document.getElementById('settleToSelect');
  const amtInp = document.getElementById('settleAmountInput');

  fromSel.innerHTML = group.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  toSel.innerHTML = group.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

  if (fromId) fromSel.value = fromId;
  if (toId) toSel.value = toId;
  amtInp.value = defaultAmount || '';

  openModal('modalSettle');
}

// Preset Demo Modal
function bindDemoModalEvents() {
  const btn = document.getElementById('btnOpenDemoModal');
  if (btn) btn.addEventListener('click', () => openModal('modalDemo'));

  document.querySelectorAll('.btn-load-preset').forEach(b => {
    b.addEventListener('click', () => {
      const preset = b.getAttribute('data-preset');
      store.loadDemoScenario(preset);
      closeModal('modalDemo');
      showToast('Loaded Indian demo scenario!', 'success');
    });
  });
}

function bindExportModalEvents() {
  const btn = document.getElementById('btnOpenExportModal');
  if (btn) {
    btn.addEventListener('click', () => {
      const area = document.getElementById('jsonStorageArea');
      if (area) area.value = store.exportData();
      openModal('modalExport');
    });
  }

  const btnCopy = document.getElementById('btnCopyJson');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const area = document.getElementById('jsonStorageArea');
      if (area) {
        navigator.clipboard.writeText(area.value).then(() => showToast('JSON copied!', 'success'));
      }
    });
  }

  const btnImport = document.getElementById('btnImportJson');
  if (btnImport) {
    btnImport.addEventListener('click', () => {
      const area = document.getElementById('jsonStorageArea');
      if (area && store.importData(area.value)) {
        closeModal('modalExport');
        showToast('State imported!', 'success');
      }
    });
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function bindModalCloseHandlers() {
  document.querySelectorAll('.btn-close-modal').forEach(b => {
    b.addEventListener('click', () => {
      const m = b.closest('.modal-overlay');
      if (m) m.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });
}
