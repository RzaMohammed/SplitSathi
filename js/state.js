/**
 * =========================================================
 * SplitSathi — State Management & Persistent LocalStorage
 * =========================================================
 */

const STORAGE_KEY = 'splitsathi_app_v2';

// Preset Group 1: Weekend Goa Trip
export const GOA_TRIP_DEMO = {
  id: 'group_goa_trip',
  name: 'Weekend Goa Trip 🌴',
  currency: '₹',
  members: [
    { id: 'm_raza', name: 'Rza Mohammed', avatarBg: '#7C3AED' },
    { id: 'm_aman', name: 'Aman Sharma', avatarBg: '#22C55E' },
    { id: 'm_priya', name: 'Priya Verma', avatarBg: '#EC4899' },
    { id: 'm_rahul', name: 'Rahul Singh', avatarBg: '#38BDF8' },
    { id: 'm_neha', name: 'Neha Gupta', avatarBg: '#F59E0B' }
  ],
  expenses: [
    {
      id: 'e_goa_0',
      title: '🏨 Beach Villa Stay',
      amount: 6000,
      date: '2026-07-27',
      category: 'housing',
      paidBy: 'm_raza',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 1200 },
        { memberId: 'm_aman', amount: 1200 },
        { memberId: 'm_priya', amount: 1200 },
        { memberId: 'm_rahul', amount: 1200 },
        { memberId: 'm_neha', amount: 1200 }
      ]
    },
    {
      id: 'e_goa_1',
      title: '🍛 Dinner at Barbeque Nation',
      amount: 4650,
      date: '2026-07-28',
      category: 'food',
      paidBy: 'm_priya',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 930 },
        { memberId: 'm_aman', amount: 930 },
        { memberId: 'm_priya', amount: 930 },
        { memberId: 'm_rahul', amount: 930 },
        { memberId: 'm_neha', amount: 930 }
      ]
    },
    {
      id: 'e_goa_2',
      title: '🛒 DMart Grocery & Drinks',
      amount: 2950,
      date: '2026-07-27',
      category: 'groceries',
      paidBy: 'm_aman',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 590 },
        { memberId: 'm_aman', amount: 590 },
        { memberId: 'm_priya', amount: 590 },
        { memberId: 'm_rahul', amount: 590 },
        { memberId: 'm_neha', amount: 590 }
      ]
    },
    {
      id: 'e_goa_3',
      title: '🎬 PVR Movie Tickets',
      amount: 1800,
      date: '2026-07-25',
      category: 'entertainment',
      paidBy: 'm_neha',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 360 },
        { memberId: 'm_aman', amount: 360 },
        { memberId: 'm_priya', amount: 360 },
        { memberId: 'm_rahul', amount: 360 },
        { memberId: 'm_neha', amount: 360 }
      ]
    },
    {
      id: 'e_goa_4',
      title: '⛽ Highway Fuel / Petrol',
      amount: 1400,
      date: '2026-07-29',
      category: 'fuel',
      paidBy: 'm_rahul',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 280 },
        { memberId: 'm_aman', amount: 280 },
        { memberId: 'm_priya', amount: 280 },
        { memberId: 'm_rahul', amount: 280 },
        { memberId: 'm_neha', amount: 280 }
      ]
    },
    {
      id: 'e_goa_5',
      title: '🍕 Domino\'s Pizza Feast',
      amount: 1250,
      date: '2026-07-29',
      category: 'food',
      paidBy: 'm_aman',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 250 },
        { memberId: 'm_aman', amount: 250 },
        { memberId: 'm_priya', amount: 250 },
        { memberId: 'm_rahul', amount: 250 },
        { memberId: 'm_neha', amount: 250 }
      ]
    },
    {
      id: 'e_goa_6',
      title: '🚕 Ola Cab to Airport',
      amount: 540,
      date: '2026-07-30',
      category: 'travel',
      paidBy: 'm_rahul',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 108 },
        { memberId: 'm_aman', amount: 108 },
        { memberId: 'm_priya', amount: 108 },
        { memberId: 'm_rahul', amount: 108 },
        { memberId: 'm_neha', amount: 108 }
      ]
    },
    {
      id: 'e_goa_7',
      title: '☕ Tapri Chai & Snacks',
      amount: 220,
      date: '2026-07-30',
      category: 'food',
      paidBy: 'm_raza',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 44 },
        { memberId: 'm_aman', amount: 44 },
        { memberId: 'm_priya', amount: 44 },
        { memberId: 'm_rahul', amount: 44 },
        { memberId: 'm_neha', amount: 44 }
      ]
    }
  ],
  settlements: []
};

// Preset Group 2: Flat 302 Roommates
export const FLAT_302_DEMO = {
  id: 'group_flat_302',
  name: 'Flat 302 Roommates 🏠',
  currency: '₹',
  members: [
    { id: 'm_raza', name: 'Rza Mohammed', avatarBg: '#7C3AED' },
    { id: 'm_aman', name: 'Aman Sharma', avatarBg: '#22C55E' },
    { id: 'm_rahul', name: 'Rahul Singh', avatarBg: '#38BDF8' }
  ],
  expenses: [
    {
      id: 'e_flat_1',
      title: '🏢 Monthly Apartment Rent',
      amount: 36000,
      date: '2026-07-01',
      category: 'housing',
      paidBy: 'm_raza',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 12000 },
        { memberId: 'm_aman', amount: 12000 },
        { memberId: 'm_rahul', amount: 12000 }
      ]
    },
    {
      id: 'e_flat_2',
      title: '⚡ Electricity & Broadband Bill',
      amount: 2400,
      date: '2026-07-05',
      category: 'utilities',
      paidBy: 'm_aman',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 800 },
        { memberId: 'm_aman', amount: 800 },
        { memberId: 'm_rahul', amount: 800 }
      ]
    }
  ],
  settlements: []
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean up any member name spelling from Raza to Rza in saved state as well!
        if (parsed && Array.isArray(parsed.groups)) {
          parsed.groups.forEach(g => {
            if (Array.isArray(g.members)) {
              g.members.forEach(m => {
                if (m.name.includes('Raza')) {
                  m.name = m.name.replace('Raza', 'Rza');
                }
              });
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }

    return {
      activeGroupId: GOA_TRIP_DEMO.id,
      theme: 'dark',
      viewSimplified: true,
      currentUserMemberId: 'm_raza',
      groups: [GOA_TRIP_DEMO, FLAT_302_DEMO]
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  getActiveGroup() {
    const group = this.state.groups.find(g => g.id === this.state.activeGroupId);
    return group || this.state.groups[0];
  }

  getTheme() {
    return this.state.theme || 'dark';
  }

  isViewSimplified() {
    return this.state.viewSimplified !== false;
  }

  setActiveGroup(groupId) {
    this.state.activeGroupId = groupId;
    this.saveState();
  }

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.saveState();
  }

  setCurrency(currency) {
    const group = this.getActiveGroup();
    if (group) {
      group.currency = currency;
      this.saveState();
    }
  }

  setViewSimplified(simplified) {
    this.state.viewSimplified = Boolean(simplified);
    this.saveState();
  }

  createGroup(name, currency = '₹') {
    const newGroup = {
      id: 'group_' + Date.now(),
      name,
      currency,
      members: [
        { id: 'm_user', name: 'Rza Mohammed', avatarBg: '#7C3AED' }
      ],
      expenses: [],
      settlements: []
    };
    this.state.groups.push(newGroup);
    this.state.activeGroupId = newGroup.id;
    this.saveState();
    return newGroup;
  }

  addMember(name) {
    const group = this.getActiveGroup();
    if (!group) return null;

    const colors = ['#7C3AED', '#22C55E', '#EC4899', '#38BDF8', '#F59E0B', '#8B5CF6'];
    const color = colors[group.members.length % colors.length];

    const newMember = {
      id: 'm_' + Date.now(),
      name: name.trim(),
      avatarBg: color
    };

    group.members.push(newMember);
    this.saveState();
    return newMember;
  }

  removeMember(id) {
    const group = this.getActiveGroup();
    if (!group) return;

    group.members = group.members.filter(m => m.id !== id);
    group.expenses = group.expenses.filter(e => e.paidBy !== id);
    group.expenses.forEach(e => {
      e.splits = e.splits.filter(s => s.memberId !== id);
    });
    group.settlements = group.settlements.filter(s => s.from !== id && s.to !== id);

    this.saveState();
  }

  addExpense(data) {
    const group = this.getActiveGroup();
    if (!group) return null;

    const newExpense = {
      id: 'e_' + Date.now(),
      title: data.title.trim(),
      amount: Number(data.amount),
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'food',
      paidBy: data.paidBy,
      splitType: data.splitType,
      splits: data.splits,
      notes: data.notes || ''
    };

    group.expenses.unshift(newExpense);
    this.saveState();
    return newExpense;
  }

  updateExpense(id, data) {
    const group = this.getActiveGroup();
    if (!group) return;

    const idx = group.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      group.expenses[idx] = { ...group.expenses[idx], ...data };
      this.saveState();
    }
  }

  deleteExpense(id) {
    const group = this.getActiveGroup();
    if (!group) return;

    group.expenses = group.expenses.filter(e => e.id !== id);
    this.saveState();
  }

  addSettlement(from, to, amount, notes = '') {
    const group = this.getActiveGroup();
    if (!group) return null;

    const newSettlement = {
      id: 's_' + Date.now(),
      from,
      to,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      notes
    };

    group.settlements.unshift(newSettlement);
    this.saveState();
    return newSettlement;
  }

  loadDemoScenario(presetKey) {
    let presetGroup = null;
    if (presetKey === 'goa') {
      presetGroup = JSON.parse(JSON.stringify(GOA_TRIP_DEMO));
    } else if (presetKey === 'flat') {
      presetGroup = JSON.parse(JSON.stringify(FLAT_302_DEMO));
    }

    if (presetGroup) {
      presetGroup.id = 'group_' + Date.now();
      this.state.groups.push(presetGroup);
      this.state.activeGroupId = presetGroup.id;
      this.saveState();
    }
  }

  exportData() {
    return JSON.stringify(this.state, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.groups)) {
        this.state = parsed;
        this.saveState();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}

export const store = new StateManager();
