/**
 * =========================================================
 * SplitSathi — State Management & Persistent LocalStorage
 * =========================================================
 */

const STORAGE_KEY = 'splitsathi_app_v3';

// Preset Group 1: Weekend Goa Trip
export const GOA_TRIP_DEMO = {
  id: 'group_goa_trip',
  name: 'Weekend Goa Trip 🌴',
  createdDate: '15 July',
  status: 'Active',
  currency: '₹',
  members: [
    { id: 'm_raza', name: 'Raza Mohammed', avatarBg: '#32C36C' },
    { id: 'm_aman', name: 'Aman Sharma', avatarBg: '#63A7FF' },
    { id: 'm_rahul', name: 'Rahul Singh', avatarBg: '#FFB800' },
    { id: 'm_priya', name: 'Priya Verma', avatarBg: '#EC4899' },
    { id: 'm_neha', name: 'Neha Gupta', avatarBg: '#A855F7' }
  ],
  expenses: [
    {
      id: 'e_goa_1',
      title: 'Domino\'s Pizza Feast',
      amount: 1250,
      date: '2026-07-30',
      timeAgo: 'Yesterday',
      category: 'food',
      emoji: '🍕',
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
      id: 'e_goa_2',
      title: 'Uber Ride to Beach',
      amount: 540,
      date: '2026-07-31',
      timeAgo: 'Today',
      category: 'travel',
      emoji: '🚕',
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
      id: 'e_goa_3',
      title: 'Tea & Snacks',
      amount: 220,
      date: '2026-07-31',
      timeAgo: 'Today',
      category: 'food',
      emoji: '☕',
      paidBy: 'm_raza',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 44 },
        { memberId: 'm_aman', amount: 44 },
        { memberId: 'm_priya', amount: 44 },
        { memberId: 'm_rahul', amount: 44 },
        { memberId: 'm_neha', amount: 44 }
      ]
    },
    {
      id: 'e_goa_4',
      title: 'Barbeque Nation Dinner',
      amount: 4650,
      date: '2026-07-28',
      timeAgo: '3 days ago',
      category: 'food',
      emoji: '🍛',
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
      id: 'e_goa_0',
      title: 'Beach Villa Stay',
      amount: 7500,
      date: '2026-07-27',
      timeAgo: '4 days ago',
      category: 'rent',
      emoji: '🏨',
      paidBy: 'm_raza',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 1500 },
        { memberId: 'm_aman', amount: 1500 },
        { memberId: 'm_priya', amount: 1500 },
        { memberId: 'm_rahul', amount: 1500 },
        { memberId: 'm_neha', amount: 1500 }
      ]
    },
    {
      id: 'e_goa_5',
      title: 'DMart Grocery Stockup',
      amount: 2950,
      date: '2026-07-27',
      timeAgo: '4 days ago',
      category: 'groceries',
      emoji: '🛒',
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
      id: 'e_goa_6',
      title: 'PVR Movie & Popcorn',
      amount: 1650,
      date: '2026-07-26',
      timeAgo: '5 days ago',
      category: 'entertainment',
      emoji: '🎬',
      paidBy: 'm_neha',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 330 },
        { memberId: 'm_aman', amount: 330 },
        { memberId: 'm_priya', amount: 330 },
        { memberId: 'm_rahul', amount: 330 },
        { memberId: 'm_neha', amount: 330 }
      ]
    }
  ],
  settlements: []
};

// Preset Group 2: Hostel Roommates
export const HOSTEL_DEMO = {
  id: 'group_hostel',
  name: 'Hostel Roommates 🏠',
  createdDate: '1 June',
  status: 'Active',
  currency: '₹',
  members: [
    { id: 'm_raza', name: 'Raza Mohammed', avatarBg: '#32C36C' },
    { id: 'm_aman', name: 'Aman Sharma', avatarBg: '#63A7FF' },
    { id: 'm_rahul', name: 'Rahul Singh', avatarBg: '#FFB800' }
  ],
  expenses: [
    {
      id: 'e_hostel_1',
      title: 'Hostel Rent & Maintenance',
      amount: 24000,
      date: '2026-07-01',
      timeAgo: '1 month ago',
      category: 'rent',
      emoji: '🏢',
      paidBy: 'm_raza',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 8000 },
        { memberId: 'm_aman', amount: 8000 },
        { memberId: 'm_rahul', amount: 8000 }
      ]
    },
    {
      id: 'e_hostel_2',
      title: 'WiFi & Electricity Bill',
      amount: 2100,
      date: '2026-07-05',
      timeAgo: '25 days ago',
      category: 'utilities',
      emoji: '⚡',
      paidBy: 'm_aman',
      splitType: 'equal',
      splits: [
        { memberId: 'm_raza', amount: 700 },
        { memberId: 'm_aman', amount: 700 },
        { memberId: 'm_rahul', amount: 700 }
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
        if (parsed && Array.isArray(parsed.groups)) {
          // Normalize names
          parsed.groups.forEach(g => {
            if (Array.isArray(g.members)) {
              g.members.forEach(m => {
                if (m.name === 'Rza Mohammed') m.name = 'Raza Mohammed';
              });
            }
          });

          // Ensure Goa trip demo group has all required fields
          const goaGroup = parsed.groups.find(g => g.id === 'group_goa_trip');
          if (goaGroup) {
            goaGroup.createdDate = goaGroup.createdDate || '15 July';
            goaGroup.status = goaGroup.status || 'Active';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load state, starting fresh', e);
    }

    return {
      activeGroupId: GOA_TRIP_DEMO.id,
      theme: 'light',
      viewSimplified: true,
      currentUserMemberId: 'm_raza',
      groups: [GOA_TRIP_DEMO, HOSTEL_DEMO]
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
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get Active Group
  getActiveGroup() {
    return this.state.groups.find(g => g.id === this.state.activeGroupId) || this.state.groups[0];
  }

  // Switch Active Group
  setActiveGroup(groupId) {
    if (this.state.groups.some(g => g.id === groupId)) {
      this.state.activeGroupId = groupId;
      this.saveState();
    }
  }

  // Toggle Theme
  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.saveState();
  }

  // Add Expense
  addExpense(expenseData) {
    const group = this.getActiveGroup();
    if (!group) return;

    const newExpense = {
      id: 'e_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      timeAgo: 'Just now',
      ...expenseData
    };

    group.expenses.unshift(newExpense);
    this.saveState();
    return newExpense;
  }

  // Delete Expense
  deleteExpense(expenseId) {
    const group = this.getActiveGroup();
    if (!group) return;
    group.expenses = group.expenses.filter(e => e.id !== expenseId);
    this.saveState();
  }

  // Record Settlement Payment
  recordSettlement(fromMemberId, toMemberId, amount) {
    const group = this.getActiveGroup();
    if (!group) return;

    if (!group.settlements) group.settlements = [];
    const newSettlement = {
      id: 's_' + Date.now(),
      from: fromMemberId,
      to: toMemberId,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      timeAgo: 'Just now'
    };

    group.settlements.unshift(newSettlement);
    this.saveState();
    return newSettlement;
  }

  recordSettlements(payments) {
    const group = this.getActiveGroup();
    if (!group || !payments.length) return [];

    group.settlements ??= [];
    const timestamp = Date.now();
    const settlements = payments.map(({ from, to, amount }, index) => ({
      id: `s_${timestamp}_${index}`,
      from,
      to,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      timeAgo: 'Just now'
    }));

    group.settlements.unshift(...settlements);
    this.saveState();
    return settlements;
  }

  // Create New Group
  createGroup(name, memberNames = []) {
    const newGroupId = 'group_' + Date.now();
    
    // Always include Raza Mohammed as current user
    const members = [
      { id: 'm_raza', name: 'Raza Mohammed', avatarBg: '#32C36C' }
    ];

    const bgColors = ['#63A7FF', '#FFB800', '#EC4899', '#A855F7', '#14B8A6'];
    memberNames.forEach((name, idx) => {
      const trimmed = name.trim();
      if (trimmed && trimmed.toLowerCase() !== 'raza mohammed') {
        members.push({
          id: 'm_' + Date.now() + '_' + idx,
          name: trimmed,
          avatarBg: bgColors[idx % bgColors.length]
        });
      }
    });

    const newGroup = {
      id: newGroupId,
      name: name || 'New Group',
      createdDate: 'Today',
      status: 'Active',
      currency: '₹',
      members,
      expenses: [],
      settlements: []
    };

    this.state.groups.push(newGroup);
    this.state.activeGroupId = newGroupId;
    this.saveState();
    return newGroup;
  }

  // Reset to Demo Data
  resetToDemo() {
    this.state.groups = [
      JSON.parse(JSON.stringify(GOA_TRIP_DEMO)),
      JSON.parse(JSON.stringify(HOSTEL_DEMO))
    ];
    this.state.activeGroupId = GOA_TRIP_DEMO.id;
    this.saveState();
  }
}

export const stateManager = new StateManager();
