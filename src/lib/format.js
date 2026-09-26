import dayjs from 'dayjs';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const inrShort = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const money = (n) => inr.format(Number(n) || 0);
export const moneyShort = (n) => inrShort.format(Number(n) || 0);

export const formatDate = (d) => (d ? dayjs(d).format('D MMM YYYY') : '—');
export const formatDateTime = (d) => (d ? dayjs(d).format('D MMM YYYY, h:mm A') : '—');

/** Local date-time without a zone, which is how the API stores dates. */
export const toApiDateTime = (dateStr) => {
  const now = dayjs();
  const d = dateStr ? dayjs(dateStr) : now;
  return d.hour(now.hour()).minute(now.minute()).second(now.second()).format('YYYY-MM-DDTHH:mm:ss');
};

export const today = () => dayjs().format('YYYY-MM-DD');
export const currentMonth = () => dayjs().format('YYYY-MM');
export const monthLabel = (ym) => dayjs(`${ym}-01`).format('MMMM YYYY');
export const monthRange = (ym) => {
  const start = dayjs(`${ym}-01`);
  return { from: start.format('YYYY-MM-DD'), to: start.endOf('month').format('YYYY-MM-DD') };
};
