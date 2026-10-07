import { useEffect, useRef, useState } from 'react'
import {
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Hash,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import useAuth from '../hooks/useAuth'
import { getMyProfile, updateMyProfile } from '../api/profile'
import { useToast } from '../components/ui/ToastProvider'

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024
const AVATAR_MAX_SIZE = 256

function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Image invalide'))
      image.onload = () => {
        const ratio = Math.min(1, AVATAR_MAX_SIZE / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { user, roleDisplayName, changePassword } = useAuth()
  const { showSuccess, showError } = useToast()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoUrlInput, setPhotoUrlInput] = useState('')

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await getMyProfile()
        if (ignore) return
        setProfile(data)
        setEmail(data.email ?? '')
        setTelephone(data.telephone ?? '')
        setAdresse(data.adresse ?? '')
        setPhoto(data.photoUrl ?? null)
        setPhotoUrlInput(data.photoUrl && data.photoUrl.startsWith('http') ? data.photoUrl : '')
      } catch {
        if (!ignore) showError('Impossible de charger votre profil.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [showError])

  const handleUrlChange = (value) => {
    setPhotoUrlInput(value)
    setPhoto(value.trim() ? value.trim() : null)
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showError('Veuillez sélectionner un fichier image.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      showError('Image trop volumineuse (3 Mo maximum).')
      return
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setPhoto(dataUrl)
      setPhotoUrlInput('')
    } catch {
      showError("Impossible de traiter l'image.")
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoUrlInput('')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const updated = await updateMyProfile({ email, telephone, adresse, photoUrl: photo ?? '' })
      setProfile(updated)
      setEmail(updated.email ?? '')
      setTelephone(updated.telephone ?? '')
      setAdresse(updated.adresse ?? '')
      setPhoto(updated.photoUrl ?? null)
      setPhotoUrlInput(updated.photoUrl && updated.photoUrl.startsWith('http') ? updated.photoUrl : '')
      showSuccess('Profil mis à jour avec succès.')
    } catch (err) {
      showError(err?.response?.data?.message || 'Erreur lors de la mise à jour du profil.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      showError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Les mots de passe ne correspondent pas.')
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showSuccess('Mot de passe modifié avec succès.')
    } catch (err) {
      showError(err?.response?.data?.message || 'Erreur lors du changement de mot de passe.')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </AppLayout>
    )
  }

  const fullName = `${profile?.prenom ?? ''} ${profile?.nom ?? ''}`.trim() || profile?.username || 'Mon profil'

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <ProfileHeader
            fullName={fullName}
            username={profile?.username}
            roleLabel={roleDisplayName()}
            profile={profile}
            photo={photo}
          />

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="p-6">
              <SectionTitle title="Informations personnelles" subtitle="Ces informations sont visibles par l'administration RH." />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Email" icon={Mail}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="prenom.nom@sigrh.com"
                  />
                </Field>
                <Field label="Téléphone" icon={Phone}>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className={inputClass}
                    placeholder="+225 07 00 00 00 00"
                  />
                </Field>
                <Field label="Adresse" icon={MapPin} full>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className={inputClass}
                    placeholder="Commune, ville"
                  />
                </Field>
              </div>

              <div className="mt-6">
                <SectionTitle title="Informations professionnelles" subtitle="Gérées par l'administration, non modifiables." />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ReadOnly icon={UserRound} label="Nom" value={profile?.nom} />
                  <ReadOnly icon={UserRound} label="Prénom" value={profile?.prenom} />
                  <ReadOnly icon={Hash} label="Matricule" value={profile?.matricule} />
                  <ReadOnly icon={Briefcase} label="Poste" value={profile?.poste} />
                  <ReadOnly icon={Building2} label="Département" value={profile?.departementNom} />
                  <ReadOnly icon={CalendarDays} label="Date d'embauche" value={formatDate(profile?.dateEmbauche)} />
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <SectionTitle title="Photo de profil" subtitle="Importez une image ou collez un lien." />
                <div className="mt-5 flex flex-col items-center gap-4">
                  <Avatar photo={photo} fullName={fullName} />
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Upload size={16} />
                      Importer
                    </button>
                    {photo && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Retirer
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="w-full">
                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Camera size={14} />
                      Lien de l'image
                    </label>
                    <input
                      type="text"
                      value={photoUrlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                    {photo && !photo.startsWith('http') && (
                      <p className="mt-2 text-xs font-medium text-emerald-600">Image importée prête à être enregistrée.</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <SectionTitle title="Compte" subtitle="Identifiant et rôle attribués." />
                <div className="mt-4 space-y-3">
                  <ReadOnly icon={UserRound} label="Nom d'utilisateur" value={profile?.username} />
                  <ReadOnly icon={ShieldCheck} label="Rôle" value={roleDisplayName()} />
                </div>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>

        <Card className="p-6">
          <SectionTitle title="Sécurité" subtitle="Modifiez votre mot de passe de connexion." />
          <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Mot de passe actuel" icon={Lock}>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className={inputClass}
                autoComplete="current-password"
                placeholder="••••••"
              />
            </Field>
            <Field label="Nouveau mot de passe" icon={KeyRound}>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className={inputClass}
                autoComplete="new-password"
                placeholder="6 caractères minimum"
              />
            </Field>
            <Field label="Confirmer" icon={KeyRound}>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className={inputClass}
                autoComplete="new-password"
                placeholder="Retapez le mot de passe"
              />
            </Field>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                {passwordLoading ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600/40 focus:ring-3 focus:ring-blue-600/10'

function ProfileHeader({ fullName, username, roleLabel, profile, photo }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-700 to-blue-500" />
      <div className="flex flex-col items-center gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
        <div className="-mt-12">
          <Avatar photo={photo} fullName={fullName} large />
        </div>
        <div className="flex-1 pt-2 text-center sm:pb-1 sm:text-left">
          <h1 className="text-2xl font-bold text-slate-950">{fullName}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {roleLabel}{profile?.poste ? ` · ${profile.poste}` : ''}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
          <ShieldCheck size={14} />
          {roleLabel}
        </span>
      </div>
    </Card>
  )
}

function Avatar({ photo, fullName, large = false }) {
  const sizeClass = large ? 'h-24 w-24 text-2xl rounded-3xl ring-4 ring-white' : 'h-24 w-24 text-2xl rounded-3xl ring-1 ring-slate-200'
  if (photo) {
    return <img src={photo} alt="" className={`${sizeClass} object-cover`} />
  }
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return (
    <div className={`${sizeClass} flex items-center justify-center bg-blue-50 font-bold text-blue-700`}>
      {initials || <UserRound size={28} />}
    </div>
  )
}

function Field({ label, icon: Icon, full = false, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
        {Icon && <Icon size={14} />}
        {label}
      </label>
      {children}
    </div>
  )
}

function ReadOnly({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Icon size={17} className="shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value || '—'}</p>
      </div>
    </div>
  )
}

function Card({ className = '', children }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}