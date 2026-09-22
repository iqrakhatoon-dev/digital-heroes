import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { Search, Edit2, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)

  const fetchUsers = async () => {
  setLoading(true)
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (data) {
    // charity names alag fetch karo
    const { data: charitiesData } = await supabaseAdmin
      .from('charities')
      .select('id, name')

    // har user mein charity name add karo
    const usersWithCharity = data.map(u => ({
      ...u,
      charityName: charitiesData?.find(c => c.id === u.charity_id)?.name || '—'
    }))

    setUsers(usersWithCharity)
  }
  setLoading(false)
}

  useEffect(() => { fetchUsers() }, [])

  const handleUpdate = async (id, updates) => {
    const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id)
    if (error) return toast.error('Update failed')
    toast.success('User updated')
    setEditUser(null)
    fetchUsers()
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email?.includes(search) || u.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.subscription_status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white">Users</h1>
        <p className="text-brand-muted text-sm mt-1">Manage member accounts and subscriptions.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input className="input-field pl-9 text-sm" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'active', 'inactive', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-brand-mint text-brand-black' : 'bg-white bg-opacity-5 text-brand-muted hover:text-white'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">No users found.</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white border-opacity-5">
                  <th className="text-left px-4 py-3 text-xs text-brand-muted font-medium">Member</th>
                  <th className="text-left px-4 py-3 text-xs text-brand-muted font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-brand-muted font-medium hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-xs text-brand-muted font-medium hidden lg:table-cell">Charity</th>
                  <th className="text-left px-4 py-3 text-xs text-brand-muted font-medium hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-white border-opacity-[0.04] hover:bg-white hover:bg-opacity-[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-green flex items-center justify-center text-xs font-bold text-brand-mint flex-shrink-0">
                          {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.full_name || '—'}</p>
                          <p className="text-xs text-brand-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        u.subscription_status === 'active' ? 'bg-brand-mint bg-opacity-20 text-brand-mint' :
                        u.subscription_status === 'cancelled' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                        'bg-white bg-opacity-10 text-brand-muted'
                      }`}>
                        {u.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-muted capitalize hidden md:table-cell">{u.subscription_plan || '—'}</td>
                    <td className="px-4 py-3 text-brand-muted hidden lg:table-cell">
                        {u.charities?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-brand-muted hidden md:table-cell text-xs">
                      {u.created_at ? format(new Date(u.created_at), 'dd MMM yy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditUser(u)}
                        className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 text-brand-muted hover:text-white transition-all">
                        <Edit2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white border-opacity-5 text-xs text-brand-muted">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-brand-slate border border-white border-opacity-10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Edit user</h3>
              <button onClick={() => setEditUser(null)} className="text-brand-muted hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input className="input-field" value={editUser.full_name || ''} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Subscription status</label>
                <select className="input-field" value={editUser.subscription_status || 'inactive'}
                  onChange={e => setEditUser({ ...editUser, subscription_status: e.target.value })}>
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="lapsed">Lapsed</option>
                </select>
              </div>
              <div>
                <label className="label">Plan</label>
                <select className="input-field" value={editUser.subscription_plan || ''}
                  onChange={e => setEditUser({ ...editUser, subscription_plan: e.target.value })}>
                  <option value="">None</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleUpdate(editUser.id, {
                  full_name: editUser.full_name,
                  subscription_status: editUser.subscription_status,
                  subscription_plan: editUser.subscription_plan,
                })} className="btn-primary flex-1 py-2.5 text-sm">
                  Save changes
                </button>
                <button onClick={() => setEditUser(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}