/**
 * =========================================================
 * SplitSathi — Application Controller & Interactive Event Handler
 * =========================================================
 */

import { stateManager } from './state.js';
import { renderApp, showToast, triggerConfetti, formatMoney } from './ui.js';
import { calculateNetBalances, calculateSimplifiedDebts } from './debtEngine.js';
import { splitEqually } from './utils.js';

let selectedCategory = 'food';
let selectedEmoji = '🍕';

document.addEventListener('DOMContentLoaded', () => {
  initHisaabApp();
});

function initHisaabApp() {
  // Apply Saved Theme
  document.documentElement.setAttribute('data-theme', stateManager.state.theme || 'light');
  updateThemeIcon();

  // Subscribe state manager to re-render UI on changes
  stateManager.subscribe(() => {
    renderApp();
  });

  // Initial render
  renderApp();

  // Bind Event Listeners
  bindNavigationEvents();
  bindHeaderEvents();
  bindExpenseModalEvents();
  bindSettleModalEvents();
  bindCategoryPicker();

  // Initial Lucide Icons Render
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* =========================================================
   NAVIGATION EVENT BINDING
   ========================================================= */
function bindNavigationEvents() {
  const allNavButtons = document.querySelectorAll('.sidebar-nav .nav-link, .mobile-bottom-nav .mobile-nav-item, [data-tab-nav]');

  allNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-tab') || btn.getAttribute('data-tab-nav');
      const targetView = document.getElementById(`view-${targetTab}`);
      if (!targetTab || !targetView) {
        showToast('This view is not available yet.', 'info');
        return;
      }

      // Update active nav styling
      document.querySelectorAll('.sidebar-nav .nav-link, .mobile-bottom-nav .mobile-nav-item').forEach(b => {
        if (b.getAttribute('data-tab') === targetTab) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Switch Tab Views
      document.querySelectorAll('.tab-view').forEach(view => {
        if (view === targetView) {
          view.style.display = 'block';
          view.classList.add('active');
        } else {
          view.style.display = 'none';
          view.classList.remove('active');
        }
      });

      // Re-trigger icon rendering & charts
      if (window.lucide) window.lucide.createIcons();
    });
  });
}

/* =========================================================
   HEADER EVENT BINDING
   ========================================================= */
function bindHeaderEvents() {
  const groupDropdown = document.getElementById('groupSelectDropdown');
  if (groupDropdown) {
    groupDropdown.addEventListener('change', (e) => {
      stateManager.setActiveGroup(e.target.value);
      showToast(`Switched group to ${stateManager.getActiveGroup().name}`, 'success');
    });
  }

  const themeBtn = document.getElementById('btnToggleTheme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      stateManager.toggleTheme();
      document.documentElement.setAttribute('data-theme', stateManager.state.theme);
      updateThemeIcon();
      showToast(`Switched to ${stateManager.state.theme} theme`, 'info');
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterExpensesAndMembers(query);
    });
  }
}

function updateThemeIcon() {
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', stateManager.state.theme === 'dark' ? 'sun' : 'moon');
    if (window.lucide) window.lucide.createIcons();
  }
}

function filterExpensesAndMembers(query) {
  const cards = document.querySelectorAll('.expense-card, .member-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/* =========================================================
   CATEGORY PICKER BINDING
   ========================================================= */
function bindCategoryPicker() {
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedCategory = chip.getAttribute('data-cat');
      selectedEmoji = chip.getAttribute('data-emoji');
    });
  });
}

/* =========================================================
   ADD EXPENSE MODAL BINDING
   ========================================================= */
let currentSplitType = 'equal';

function renderCustomSplitsFields() {
  const container = document.getElementById('customSplitsList');
  const group = stateManager.getActiveGroup();
  if (!container || !group) return;

  const totalAmount = Number(document.getElementById('expenseAmount').value) || 0;
  const members = group.members || [];
  const defaultShare = members.length > 0 ? Math.round((totalAmount / members.length) * 100) / 100 : 0;

  container.innerHTML = members.map(m => `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
      <span style="font-size: 13px; font-weight: 600; color: var(--text-primary); flex: 1;">${m.name}</span>
      <input type="number" class="form-control custom-member-share-input" data-member-id="${m.id}" value="${defaultShare}" min="0" step="any" style="width: 110px; padding: 6px 10px; font-size: 13px;">
    </div>
  `).join('');

  updateCustomSplitsSummary();

  container.querySelectorAll('.custom-member-share-input').forEach(input => {
    input.addEventListener('input', updateCustomSplitsSummary);
  });
}

function updateCustomSplitsSummary() {
  const totalAmount = Number(document.getElementById('expenseAmount').value) || 0;
  const inputs = document.querySelectorAll('.custom-member-share-input');
  let currentSum = 0;
  inputs.forEach(inp => {
    currentSum += Number(inp.value) || 0;
  });

  const msgEl = document.getElementById('customSplitsSummaryMsg');
  if (msgEl) {
    const diff = Math.round((totalAmount - currentSum) * 100) / 100;
    if (Math.abs(diff) < 0.01) {
      msgEl.textContent = `✓ Total matches expense amount (${formatMoney(totalAmount)})`;
      msgEl.style.color = 'var(--primary-green)';
    } else if (diff > 0) {
      msgEl.textContent = `⚠️ Remaining to allocate: ${formatMoney(diff)}`;
      msgEl.style.color = 'var(--warning-yellow)';
    } else {
      msgEl.textContent = `⚠️ Exceeds total by ${formatMoney(Math.abs(diff))}`;
      msgEl.style.color = 'var(--error)';
    }
  }
}

// Global Document-level Event Delegation for Split Type Toggle
document.addEventListener('click', (e) => {
  const btnCustom = e.target.closest('#btnSplitUnequal');
  const btnEqual = e.target.closest('#btnSplitEqual');

  if (btnCustom) {
    e.preventDefault();
    e.stopPropagation();
    currentSplitType = 'custom';
    const equalEl = document.getElementById('btnSplitEqual');
    const customEl = document.getElementById('btnSplitUnequal');
    const customBox = document.getElementById('customSplitsContainer');

    if (customEl) {
      customEl.classList.add('active', 'btn-secondary');
      customEl.classList.remove('btn-outline');
    }
    if (equalEl) {
      equalEl.classList.remove('active', 'btn-secondary');
      equalEl.classList.add('btn-outline');
    }
    if (customBox) {
      customBox.style.display = 'block';
    }
    renderCustomSplitsFields();
  }

  if (btnEqual) {
    e.preventDefault();
    e.stopPropagation();
    currentSplitType = 'equal';
    const equalEl = document.getElementById('btnSplitEqual');
    const customEl = document.getElementById('btnSplitUnequal');
    const customBox = document.getElementById('customSplitsContainer');

    if (equalEl) {
      equalEl.classList.add('active', 'btn-secondary');
      equalEl.classList.remove('btn-outline');
    }
    if (customEl) {
      customEl.classList.remove('active', 'btn-secondary');
      customEl.classList.add('btn-outline');
    }
    if (customBox) {
      customBox.style.display = 'none';
    }
  }
});

function bindExpenseModalEvents() {
  const modal = document.getElementById('addExpenseModal');
  const openBtns = document.querySelectorAll('.btn-open-add-expense');
  const closeBtn = document.getElementById('closeAddExpenseModal');
  const cancelBtn = document.getElementById('cancelAddExpenseModal');
  const form = document.getElementById('addExpenseForm');

  const btnEqual = document.getElementById('btnSplitEqual');
  const btnCustom = document.getElementById('btnSplitUnequal');
  const customBox = document.getElementById('customSplitsContainer');
  const expenseAmountInput = document.getElementById('expenseAmount');

  if (expenseAmountInput) {
    expenseAmountInput.addEventListener('input', () => {
      if (currentSplitType === 'custom') {
        renderCustomSplitsFields();
      }
    });
  }

  const openModal = () => {
    currentSplitType = 'equal';
    if (btnEqual) btnEqual.className = 'btn btn-secondary btn-sm active';
    if (btnCustom) btnCustom.className = 'btn btn-outline btn-sm';
    if (customBox) customBox.style.display = 'none';
    if (modal) modal.classList.add('active');
  };

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
  };

  openBtns.forEach(b => b.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('expenseTitle').value;
      const amount = Number(document.getElementById('expenseAmount').value);
      const paidBy = document.getElementById('expensePaidBy').value;

      if (!title || !amount || amount <= 0) {
        showToast('Please enter a valid description and amount', 'warning');
        return;
      }

      const group = stateManager.getActiveGroup();
      const members = group.members || [];
      let splits = [];

      if (currentSplitType === 'custom') {
        const inputs = document.querySelectorAll('.custom-member-share-input');
        splits = Array.from(inputs).map(inp => ({
          memberId: inp.getAttribute('data-member-id'),
          amount: Number(inp.value) || 0
        }));
      } else {
        const share = Math.round((amount / members.length) * 100) / 100;
        splits = members.map(m => ({
          memberId: m.id,
          amount: share
        }));
      }

      stateManager.addExpense({
        title,
        amount,
        paidBy,
        category: selectedCategory,
        emoji: selectedEmoji,
        splitType: currentSplitType,
        splits
      });

      closeModal();
      showToast(`Added expense: ${title} (${formatMoney(amount)})`, 'success');
    });
  }
}

/* =========================================================
   SETTLE UP MODAL BINDING
   ========================================================= */
function bindSettleModalEvents() {
  const modal = document.getElementById('settleModal');
  const heroBtn = document.getElementById('btnHeroSettleUp');
  const triggerBtn = document.getElementById('btnTriggerSettleModal');
  const closeBtn = document.getElementById('closeSettleModal');
  const cancelBtn = document.getElementById('cancelSettleModal');
  const confirmBtn = document.getElementById('btnConfirmSettle');

  const openSettleModal = () => {
    const group = stateManager.getActiveGroup();
    const modalBody = document.getElementById('settleModalBody');

    if (modalBody && group) {
      modalBody.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 12px;">💸</div>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Settle Group Balances</h4>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
          This will calculate all minimal cash transfers and mark pending group debts as settled via UPI.
        </p>
        <div style="display: flex; justify-content: center; gap: 12px; font-size: 13px; font-weight: 700; color: var(--primary-green);">
          <span>✓ GPay / PhonePe / Paytm Supported</span>
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  };

  const closeSettleModal = () => {
    if (modal) modal.classList.remove('active');
  };

  if (heroBtn) heroBtn.addEventListener('click', openSettleModal);
  if (triggerBtn) triggerBtn.addEventListener('click', openSettleModal);
  if (closeBtn) closeBtn.addEventListener('click', closeSettleModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeSettleModal);

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const group = stateManager.getActiveGroup();
      if (!group) return;

      const balances = calculateNetBalances(group.members, group.expenses, group.settlements);
      const payments = calculateSimplifiedDebts(group.members, balances);

      if (!payments.length) {
        closeSettleModal();
        showToast('This group is already settled up.', 'info');
        return;
      }

      stateManager.recordSettlements(payments);

      closeSettleModal();
      triggerConfetti();
      showToast(`Recorded ${payments.length} settlement payment${payments.length === 1 ? '' : 's'}.`, 'success');
    });
  }
}
