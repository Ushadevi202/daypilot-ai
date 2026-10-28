// Today's date as yyyy-mm-dd in the user's timezone
export function todayIn(timeZone) {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone })
  } catch {
    return new Date().toLocaleDateString('en-CA')
  }
}

export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA')
}

export function longDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// "06:30:00" -> "06:30"
export const hhmm = (t) => (t ? t.slice(0, 5) : '')