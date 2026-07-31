export const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const sumBy = (items, selector) =>
  items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);

export const groupBy = (items, selector) =>
  items.reduce((groups, item) => {
    const key = selector(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {});

export const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
})[character]);

export const splitEqually = (amount, memberIds) => {
  if (!memberIds.length) return [];

  const totalInPaise = Math.round((Number(amount) || 0) * 100);
  const baseAmount = Math.floor(totalInPaise / memberIds.length);
  const remainder = totalInPaise % memberIds.length;

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: (baseAmount + (index < remainder ? 1 : 0)) / 100
  }));
};
