/**
 * iCalendar (.ics) file generation utilities.
 * No external service required — generates RFC 5545 compliant .ics content.
 */

/** Format a Date to iCal YYYYMMDD */
function toIcalDate(dateStr) {
  // dateStr is expected to be ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Escape iCal text values (commas, semicolons, backslashes, newlines) */
function escapeIcal(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Generate a stable UID from event details */
function makeUid(title, date) {
  const slug = (title + date)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  return `${slug}@phd-match-de`;
}

/**
 * Build a single VEVENT block.
 * @param {string} summary  - Event title
 * @param {string} dateStr  - ISO date string (YYYY-MM-DD)
 * @param {string} [description] - Optional description
 * @param {string} [url] - Optional URL
 * @returns {string} VEVENT block (without VCALENDAR wrapper)
 */
function buildVEvent({ summary, dateStr, description = '', url = '' }) {
  const icalDate = toIcalDate(dateStr);
  if (!icalDate) return '';

  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = makeUid(summary, dateStr);

  const lines = [
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${icalDate}`,
    `DTEND;VALUE=DATE:${icalDate}`,
    `DTSTAMP:${dtStamp}`,
    `UID:${uid}`,
    `SUMMARY:${escapeIcal(summary)}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${escapeIcal(description)}`);
  }
  if (url) {
    lines.push(`URL:${url}`);
  }

  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Generate full .ics file content for one or more events.
 * @param {Array<{summary, dateStr, description?, url?}>} events
 * @returns {string} Complete iCalendar file contents
 */
export function buildIcs(events) {
  const vevents = events
    .filter((e) => e.dateStr)
    .map((e) => buildVEvent(e))
    .filter(Boolean)
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//phd-match-de//PHD Match//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Trigger a browser download of an .ics file.
 * @param {string} icsContent - Output of buildIcs()
 * @param {string} filename   - e.g. 'deadline.ics'
 */
export function downloadIcs(icsContent, filename = 'deadline.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

