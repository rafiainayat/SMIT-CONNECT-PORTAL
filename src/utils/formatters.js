export const formatDate = d =>
  !d ? '—' : new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const truncate = (s, n = 50) => s && s.length > n ? s.slice(0, n) + '…' : s