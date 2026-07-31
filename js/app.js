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
function bindExpenseModalEvents() {
  const modal = document.getElementById('addExpenseModal');
  const openBtns = document.querySelectorAll('.btn-open-add-expense');
  const closeBtn = document.getElementById('closeAddExpenseModal');
  const cancelBtn = document.getElementById('cancelAddExpenseModal');
  const form = document.getElementById('addExpenseForm');

  const openModal = () => {
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
      const splits = splitEqually(amount, members.map(({ id }) => id));

      stateManager.addExpense({
        title,
        amount,
        paidBy,
        category: selectedCategory,
        emoji: selectedEmoji,
        splitType: 'equal',
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
