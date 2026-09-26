import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '../lib/api';
import { CATEGORIES, expenseCategory, expenseNote } from '../lib/categories';
import { formatDate, money } from '../lib/format';
import { useToast } from '../components/Toast';
import Spinner, { InlineSpinner } from '../components/Spinner';

const FORMATS = [
  { key: 'csv', label: 'CSV', hint: 'Opens in Excel or Google Sheets' },
  { key: 'pdf', label: 'PDF', hint: 'A printable report' },
  { key: 'json', label: 'JSON', hint: 'For backups or other apps' },
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const csvCell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

function download(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Export() {
  const toast = useToast();
  const [all, setAll] = useState(null);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('csv');
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/api/expense/summary').then((res) => setAll(res.data.expenses || [])).catch((err) => setError(errorMessage(err)));
  }, []);

  const rows = useMemo(() => (all || [])
    .filter((e) => (!from || !dayjs(e.date).isBefore(dayjs(from), 'day')) && (!to || !dayjs(e.date).isAfter(dayjs(to), 'day')))
    .filter((e) => !category || expenseCategory(e) === category)
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()), [all, from, to, category]);
  const total = rows.reduce((s, e) => s + e.amount, 0);
  const suffix = `${from || 'start'}_to_${to || 'today'}`;

  const run = async () => {
    setBusy(true);
    try {
      if (format === 'csv') {
        const lines = [['Date', 'Title', 'Category', 'Amount (INR)', 'Note'].join(',')].concat(
          rows.map((e) => [dayjs(e.date).format('YYYY-MM-DD'), csvCell(e.title), csvCell(expenseCategory(e)), e.amount.toFixed(2), csvCell(expenseNote(e))].join(',')));
        // The BOM makes Excel read the file as UTF-8.
        download('﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8', `expenses_${suffix}.csv`);
      } else if (format === 'json') {
        const data = rows.map((e) => ({ date: dayjs(e.date).format('YYYY-MM-DD'), title: e.title, category: expenseCategory(e), amount: e.amount, note: expenseNote(e) || undefined }));
        download(JSON.stringify(data, null, 2), 'application/json', `expenses_${suffix}.json`);
      } else {
        const { default: html2pdf } = await import('html2pdf.js');
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; color: #0f172a">
            <h1 style="margin: 0 0 4px">Expense report</h1>
            <p style="margin: 0; color: #64748b">${esc(formatDate(from))} to ${esc(formatDate(to))}${category ? ` · ${esc(category)}` : ''}</p>
            <p style="margin: 16px 0; font-size: 18px"><b>${rows.length}</b> expenses · <b>${esc(money(total))}</b></p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px">
              <thead><tr style="background: #0f172a; color: white; text-align: left">
                <th style="padding: 8px">Date</th><th style="padding: 8px">Title</th><th style="padding: 8px">Category</th><th style="padding: 8px; text-align: right">Amount</th>
              </tr></thead>
              <tbody>${rows.map((e) => `<tr style="border-bottom: 1px solid #e2e8f0">
                <td style="padding: 8px">${esc(formatDate(e.date))}</td><td style="padding: 8px">${esc(e.title)}</td>
                <td style="padding: 8px">${esc(expenseCategory(e))}</td><td style="padding: 8px; text-align: right">${esc(money(e.amount))}</td></tr>`).join('')}</tbody>
            </table>
          </div>`;
        await html2pdf().from(html).set({ margin: 0.4, filename: `expenses_${suffix}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4' } }).save();
      }
      toast('Export downloaded', 'success');
    } catch (err) {
      toast(`Export failed: ${err.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p className="card text-center text-red-600 dark:text-red-400">{error}</p>;
  if (!all) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-sm muted">Download your expenses for a date range.</p>
      </div>

      <div className="card grid gap-4 sm:grid-cols-3">
        <div><label className="label" htmlFor="ex-from">From</label><input id="ex-from" type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label" htmlFor="ex-to">To</label><input id="ex-to" type="date" className="input" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
        <div>
          <label className="label" htmlFor="ex-cat">Category</label>
          <select id="ex-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.label || c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          {FORMATS.map((f) => (
            <button key={f.key} type="button" onClick={() => setFormat(f.key)} aria-pressed={format === f.key}
              className={`flex-1 rounded-xl border px-4 py-3 text-left ${format === f.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15' : 'border-slate-200 dark:border-slate-700'}`}>
              <p className="font-semibold">{f.label}</p><p className="text-xs muted">{f.hint}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 sm:col-span-3">
          <p className="text-sm"><b>{rows.length}</b> expenses · <b>{money(total)}</b></p>
          <button className="btn btn-primary" onClick={run} disabled={busy || rows.length === 0}>
            {busy ? <><InlineSpinner /> Preparing…</> : `Download ${format.toUpperCase()}`}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide muted dark:bg-slate-800/60">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center muted">No expenses in this range.</td></tr>
            ) : rows.slice(0, 200).map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-4 py-2.5">{formatDate(e.date)}</td>
                <td className="px-4 py-2.5">{e.title}</td>
                <td className="px-4 py-2.5">{expenseCategory(e)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{money(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 200 && <p className="px-4 py-3 text-xs muted">Showing the first 200 rows. The download includes all {rows.length}.</p>}
      </div>
    </div>
  );
}
