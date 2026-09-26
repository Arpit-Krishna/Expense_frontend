import { BracketsCurly, DownloadSimple, FilePdf, FileCsv } from '../lib/icons';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '../lib/api';
import { CATEGORIES, expenseCategory, expenseNote } from '../lib/categories';
import { formatDate, money } from '../lib/format';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import Spinner, { InlineSpinner } from '../components/Spinner';

const FORMATS = [
  { key: 'csv', label: 'CSV', hint: 'Opens in Excel or Google Sheets', icon: FileCsv },
  { key: 'pdf', label: 'PDF', hint: 'A printable report', icon: FilePdf },
  { key: 'json', label: 'JSON', hint: 'For backups or other apps', icon: BracketsCurly },
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

  if (error) return <p className="card text-center text-bad-ink">{error}</p>;
  if (!all) return <Spinner />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Export" subtitle="Download your expenses for a date range." />

      <section className="card rise grid gap-5 sm:grid-cols-3" style={{ '--i': 1 }}>
        <div><label className="label" htmlFor="ex-from">From</label><input id="ex-from" type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label" htmlFor="ex-to">To</label><input id="ex-to" type="date" className="input" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
        <div>
          <label className="label" htmlFor="ex-cat">Category</label>
          <select id="ex-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.label || c.name}</option>)}
          </select>
        </div>
        <fieldset className="grid gap-2 sm:col-span-3 sm:grid-cols-3">
          <legend className="label">Format</legend>
          {FORMATS.map((f) => {
            const Icon = f.icon;
            const on = format === f.key;
            return (
              <button key={f.key} type="button" onClick={() => setFormat(f.key)} aria-pressed={on}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${on ? 'border-ink bg-subtle' : 'border-line hover:border-line-strong hover:bg-subtle'}`}>
                <Icon size={24} weight={on ? 'fill' : 'regular'} className={on ? 'text-ink' : 'text-muted'} />
                <span><span className="block text-sm font-semibold">{f.label}</span><span className="block text-xs text-muted">{f.hint}</span></span>
              </button>
            );
          })}
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 sm:col-span-3">
          <p className="text-sm text-muted"><span className="amount font-semibold text-ink">{rows.length}</span> expenses · <span className="amount font-semibold text-ink">{money(total)}</span></p>
          <button className="btn btn-primary h-10" onClick={run} disabled={busy || rows.length === 0}>
            {busy ? <><InlineSpinner /> Preparing…</> : <><DownloadSimple size={16} weight="bold" /> Download {format.toUpperCase()}</>}
          </button>
        </div>
      </section>

      <section className="card rise overflow-x-auto p-0 sm:p-0" style={{ '--i': 2 }}>
        <table className="min-w-full text-sm">
          <thead className="border-b border-line text-left">
            <tr className="[&>th]:text-[11px] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-muted [&>th]:px-5 [&>th]:py-3"><th>Date</th><th>Title</th><th>Category</th><th className="text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-muted">No expenses in this range.</td></tr>
            ) : rows.slice(0, 200).map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-subtle">
                <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(e.date)}</td>
                <td className="px-5 py-3 font-medium">{e.title}</td>
                <td className="px-5 py-3 text-muted">{expenseCategory(e)}</td>
                <td className="amount whitespace-nowrap px-5 py-3 text-right">{money(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 200 && <p className="border-t border-line px-5 py-3 text-xs text-muted">Showing the first 200 rows. The download includes all {rows.length}.</p>}
      </section>
    </div>
  );
}
