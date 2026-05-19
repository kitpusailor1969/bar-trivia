import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pb } from '@/lib/pb'
import { RequireAuth } from '@/lib/RequireAuth'

function AdsTab() {
  const [ads, setAds] = useState([])
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    pb.collection('advertisements').getList(1, 50, { sort: 'display_order' }).then(r => setAds(r.items))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!file) return
    setSaving(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('link_url', linkUrl)
    formData.append('image', file)
    formData.append('is_active', 'true')
    formData.append('display_order', String(ads.length))
    const ad = await pb.collection('advertisements').create(formData)
    setAds(prev => [...prev, ad])
    setTitle(''); setLinkUrl(''); setFile(null)
    setSaving(false)
  }

  async function toggleAd(ad) {
    const updated = await pb.collection('advertisements').update(ad.id, { is_active: !ad.is_active })
    setAds(prev => prev.map(a => a.id === ad.id ? updated : a))
  }

  async function deleteAd(ad) {
    if (!confirm('Delete this ad?')) return
    await pb.collection('advertisements').delete(ad.id)
    setAds(prev => prev.filter(a => a.id !== ad.id))
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="bg-gray-800 rounded-xl p-4 space-y-2">
        <p className="text-white font-medium text-sm">Add Advertisement</p>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none" />
        <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Link URL (optional)"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none" />
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
          className="text-gray-300 text-sm" />
        <button type="submit" disabled={saving || !file}
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded disabled:opacity-50 text-sm">
          {saving ? 'Saving...' : 'Add Ad'}
        </button>
      </form>

      <div className="space-y-2">
        {ads.map(ad => (
          <div key={ad.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              {ad.image && (
                <img src={pb.files.getUrl(ad, ad.image)} alt={ad.title} className="w-12 h-8 object-cover rounded" />
              )}
              <p className="text-white text-sm">{ad.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAd(ad)}
                className={`text-xs px-2 py-1 rounded-full font-medium ${ad.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {ad.is_active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => deleteAd(ad)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([])
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    pb.collection('announcements').getList(1, 50, { sort: '-priority,-created' }).then(r => setAnnouncements(r.items))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    const a = await pb.collection('announcements').create({ text: text.trim(), is_active: true, priority: 0 })
    setAnnouncements(prev => [a, ...prev])
    setText('')
    setSaving(false)
  }

  async function toggleAnnouncement(a) {
    const updated = await pb.collection('announcements').update(a.id, { is_active: !a.is_active })
    setAnnouncements(prev => prev.map(x => x.id === a.id ? updated : x))
  }

  async function deleteAnnouncement(a) {
    await pb.collection('announcements').delete(a.id)
    setAnnouncements(prev => prev.filter(x => x.id !== a.id))
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="bg-gray-800 rounded-xl p-4 space-y-2">
        <p className="text-white font-medium text-sm">Add Announcement</p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={2} placeholder="Announcement text..."
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none resize-none" />
        <button type="submit" disabled={saving || !text.trim()}
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded disabled:opacity-50 text-sm">
          {saving ? 'Saving...' : 'Add Announcement'}
        </button>
      </form>

      <div className="space-y-2">
        {announcements.map(a => (
          <div key={a.id} className="flex items-start justify-between bg-gray-800 rounded-xl px-4 py-3 gap-3">
            <p className="text-white text-sm flex-1">{a.text}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleAnnouncement(a)}
                className={`text-xs px-2 py-1 rounded-full font-medium ${a.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {a.is_active ? 'Live' : 'Off'}
              </button>
              <button onClick={() => deleteAnnouncement(a)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdManagerContent() {
  const [tab, setTab] = useState('ads')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="text-gray-400 hover:text-white text-sm">← Admin</Link>
        <h1 className="font-bold text-white">Ad Manager</h1>
        <div />
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {['ads', 'announcements'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}>{t}</button>
          ))}
        </div>

        {tab === 'ads' && <AdsTab />}
        {tab === 'announcements' && <AnnouncementsTab />}
      </div>
    </div>
  )
}

export default function AdManager() {
  return <RequireAuth role="admin"><AdManagerContent /></RequireAuth>
}
