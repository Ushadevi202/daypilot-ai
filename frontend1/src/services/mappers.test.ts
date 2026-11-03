import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from './mappers.ts';
import type { TaskDto, RoutineDto, OccurrenceDto, ApplicationDto, EventDto } from './dto.ts';

const taskDto = (over: Partial<TaskDto> = {}): TaskDto => ({
  id: 7, title: 'Stitch blouse', description: null, category: 'personal', priority: 'HIGH', status: 'PENDING',
  dueDate: '2026-11-02', scheduledTime: '18:30:00', estimatedMinutes: 45, notes: null, postponedCount: 0,
  overdue: false, completedAt: null, ...over,
});

const occ = (over: Partial<OccurrenceDto> = {}): OccurrenceDto => ({
  id: 1, routineId: 4, date: '2026-11-01', title: 'Morning run', description: null, startTime: '06:30:00',
  endTime: '07:00:00', estimatedMinutes: 30, status: 'PENDING', rescheduled: false, completedAt: null, ...over,
});

test('task: API shape maps to the UI shape', () => {
  const t = M.toTask(taskDto(), '2026-11-01');
  assert.equal(t.id, '7');
  assert.equal(t.priority, 'high');
  assert.equal(t.status, 'pending');
  assert.equal(t.scheduledTime, '18:30');
  assert.equal(t.durationMinutes, 45);
  assert.equal(t.category, 'personal');
});

test('task: unknown category falls back to general, missing due date falls back to today', () => {
  const t = M.toTask(taskDto({ category: 'weird', dueDate: null, scheduledTime: null, estimatedMinutes: null }), '2026-11-01');
  assert.equal(t.category, 'general');
  assert.equal(t.dueDate, '2026-11-01');
  assert.equal(t.durationMinutes, 30);
});

test('task request: a time without a due date is never sent (the API would reject it)', () => {
  const req = M.toTaskRequest({ title: ' X ', category: 'general', priority: 'low', scheduledTime: '10:00' });
  assert.equal(req.title, 'X');
  assert.equal(req.dueDate, null);
  assert.equal(req.scheduledTime, null);
  assert.equal(req.priority, 'LOW');
});

test('task request: duration is capped to the API limit', () => {
  const req = M.toTaskRequest({ title: 'X', category: 'general', priority: 'medium', durationMinutes: 99999 });
  assert.equal(req.estimatedMinutes, 1440);
});

test('routine day: statuses map and a missed day stays open', () => {
  assert.equal(M.toOccurrenceTask(occ({ status: 'COMPLETED' })).status, 'completed');
  assert.equal(M.toOccurrenceTask(occ({ status: 'SKIPPED' })).status, 'skipped');
  assert.equal(M.toOccurrenceTask(occ({ status: 'MISSED' })).status, 'pending');
  const item = M.toOccurrenceTask(occ());
  assert.equal(item.id, 'occ-1');
  assert.equal(item.isRoutineInstance, true);
  assert.equal(item.routineId, '4');
});

const routineDto = (over: Partial<RoutineDto> = {}): RoutineDto => ({
  id: 4, title: 'Run', description: null, startTime: '06:30:00', endTime: '07:00:00', estimatedMinutes: 30,
  recurrenceType: 'DAILY', daysOfWeek: [], startDate: '2026-10-28', endDate: null, active: true, ...over,
});
const noStats = { streak: 0, completions: 0 };

test('routine: frequency is detected from the weekdays', () => {
  assert.equal(M.toRoutine(routineDto(), noStats).frequency, 'daily');
  assert.equal(M.toRoutine(routineDto({ recurrenceType: 'WEEKLY', daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] }), noStats).frequency, 'weekdays');
  assert.equal(M.toRoutine(routineDto({ recurrenceType: 'WEEKLY', daysOfWeek: ['SATURDAY', 'SUNDAY'] }), noStats).frequency, 'weekends');
  const custom = M.toRoutine(routineDto({ recurrenceType: 'WEEKLY', daysOfWeek: ['MONDAY', 'FRIDAY'] }), noStats);
  assert.equal(custom.frequency, 'custom');
  assert.deepEqual(custom.daysOfWeek, [1, 5]);
});

test('routine request: UI frequency maps back to API weekdays', () => {
  const base = { title: 'Run', description: '', startTime: '06:30', endTime: '07:00', daysOfWeek: [] as number[] };
  assert.equal(M.toRoutineRequest({ ...base, frequency: 'daily' }, '2026-11-01', null).recurrenceType, 'DAILY');
  assert.deepEqual(M.toRoutineRequest({ ...base, frequency: 'weekends' }, '2026-11-01', null).daysOfWeek, ['SATURDAY', 'SUNDAY']);
  assert.deepEqual(M.toRoutineRequest({ ...base, frequency: 'custom', daysOfWeek: [5, 1] }, '2026-11-01', null).daysOfWeek, ['MONDAY', 'FRIDAY']);
});

test('routine stats: streak and reliability come from real days only', () => {
  const days = [
    occ({ id: 1, date: '2026-10-29', status: 'COMPLETED' }),
    occ({ id: 2, date: '2026-10-30', status: 'COMPLETED' }),
    occ({ id: 3, date: '2026-10-31', status: 'COMPLETED' }),
    occ({ id: 4, date: '2026-11-01', status: 'PENDING' }), // today, still open
    occ({ id: 5, date: '2026-10-28', status: 'MISSED' }),
  ];
  const stats = M.routineStats(4, days, '2026-11-01');
  assert.equal(stats.streak, 3);
  assert.equal(stats.completions, 3);
  assert.equal(stats.reliabilityPct, 75);
  assert.equal(M.routineStats(4, [], '2026-11-01').reliabilityPct, undefined);
});

test('routine stats: a skipped day breaks the streak', () => {
  const days = [
    occ({ id: 1, date: '2026-10-31', status: 'SKIPPED' }),
    occ({ id: 2, date: '2026-10-30', status: 'COMPLETED' }),
  ];
  assert.equal(M.routineStats(4, days, '2026-11-01').streak, 0);
});

const appDto = (over: Partial<ApplicationDto> = {}): ApplicationDto => ({
  id: 3, company: 'Example Technologies', jobTitle: 'Java Developer', jobUrl: null, location: null,
  employmentType: 'FULL_TIME', source: 'LinkedIn', status: 'OFFER', statusChangedAt: '2026-11-01T05:00:00Z',
  appliedDate: '2026-10-27', resumeNotes: 'v2', contactName: null, contactEmail: null, nextAction: null,
  followUpDate: null, followUpDue: false, notes: null, ...over,
});
const ev = (over: Partial<EventDto> = {}): EventDto => ({
  id: 1, type: 'INTERVIEW_ROUND_1', eventDate: '2026-11-04', eventTime: '11:00:00', details: 'Video call',
  source: 'MANUAL', createdAt: '2026-11-01T05:00:00Z', ...over,
});

test('application: the API offer status is shown as "selected" and counts come from events', () => {
  const app = M.toApplication(appDto(), [ev(), ev({ id: 2, type: 'ASSESSMENT_DEADLINE' }), ev({ id: 3, type: 'STATUS_CHANGE', eventDate: null, eventTime: null, details: 'APPLIED -> OFFER' })],
    { locationType: 'remote', salaryRange: '10 LPA' });
  assert.equal(app.currentStatus, 'selected');
  assert.equal(app.interviewsCount, 1);
  assert.equal(app.assessmentsCount, 1);
  assert.equal(app.locationType, 'remote');
  assert.equal(app.salaryRange, '10 LPA');
  assert.equal(app.timeline[2].description, 'APPLIED -> SELECTED');
  assert.equal(app.timeline[2].date, '2026-11-01');
});

test('application: a status round trip keeps every value', () => {
  for (const s of ['interested', 'applied', 'assessment', 'interview', 'selected', 'rejected', 'withdrawn', 'on_hold'] as const) {
    const api = M.statusToApi(s);
    assert.equal(M.toApplication(appDto({ status: api }), []).currentStatus, s);
  }
});

test('application request: blanks become null and the status is only sent on create', () => {
  const app = M.toApplication(appDto(), []);
  const update = M.toApplicationRequest({ ...app, location: '  ' });
  assert.equal(update.location, null);
  assert.equal('status' in update, false);
  assert.equal(M.toApplicationRequest(app, 'APPLIED').status, 'APPLIED');
});

test('timeline events: UI types map to API types, status changes are never sent', () => {
  const base = { date: '2026-11-04', title: 'Round', description: 'Zoom' };
  assert.equal(M.toEventRequest({ ...base, type: 'interview', roundNumber: 2 }, 'x')?.type, 'INTERVIEW_ROUND_2');
  assert.equal(M.toEventRequest({ ...base, type: 'interview', roundNumber: 5 }, 'x')?.type, 'INTERVIEW_FURTHER');
  assert.equal(M.toEventRequest({ ...base, type: 'interview' }, 'x')?.type, 'INTERVIEW_ROUND_1');
  assert.equal(M.toEventRequest({ ...base, type: 'assessment' }, 'x')?.type, 'ASSESSMENT_DEADLINE');
  assert.equal(M.toEventRequest({ ...base, type: 'status_change' }, 'x'), null);
  assert.equal(M.toEventRequest({ ...base, date: '', type: 'note' }, '2026-11-01')?.eventDate, '2026-11-01');
});

test('time helpers', () => {
  assert.equal(M.addMinutesToTime('06:30', 30), '07:00');
  assert.equal(M.addMinutesToTime('23:50', 120), '23:59');
  assert.equal(M.nextDay('2026-11-30'), '2026-12-01');
  assert.equal(M.nextDay('2026-12-31'), '2027-01-01');
});
