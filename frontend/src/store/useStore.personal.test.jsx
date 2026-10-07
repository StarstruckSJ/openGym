// @vitest-environment happy-dom
import { beforeEach, expect, it, vi } from 'vitest'
vi.hoisted(() => vi.stubEnv('VITE_LOCAL_ONLY', '1'))
vi.mock('../lib/api.js', () => ({ api: vi.fn() }))
vi.mock('./useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn() }) } }))
import { api } from '../lib/api.js'
import { useStore, freshState } from './useStore.js'
import { coachAvailable } from '../lib/coach.js'
beforeEach(() => {
  localStorage.clear()
  api.mockClear()
  useStore.setState({ S: freshState(), user: null, ready: false })
})
it('starts empty without a server or a simulated coach', async () => {
  await useStore.getState().boot()
  expect(useStore.getState().ready).toBe(true)
  expect(useStore.getState().isGuest()).toBe(true)
  expect(useStore.getState().S.workouts).toEqual([])
  expect(api).not.toHaveBeenCalled()
  expect(coachAvailable(null, null, { demo: true })).toBe(false)
})
it('preserves personal workouts on repeated boots and writes them to browser storage', async () => {
  await useStore.getState().boot()
  useStore.getState().update(s => { s.workouts.push({ id: 'personal-test', date: '2026-10-07', exercises: [] }) }, false)
  await useStore.getState().boot()
  expect(useStore.getState().S.workouts[0].id).toBe('personal-test')
  const saved = Array.from({ length: localStorage.length }, (_, i) => localStorage.getItem(localStorage.key(i)))
  expect(saved.some(v => v.includes('personal-test'))).toBe(true)
  expect(api).not.toHaveBeenCalled()
})
