import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../services/api.js';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const body = { name: name.trim() || undefined };
      if (newPassword) {
        if (!currentPassword) {
          setError('La contraseña actual es requerida');
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setError('La nueva contraseña debe tener al menos 6 caracteres');
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setSaving(false);
          return;
        }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const data = await updateProfile(body);
      setSuccess('Perfil actualizado correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Mi perfil</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded">{success}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input opacity-60 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">El email no se puede modificar.</p>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Cambiar contraseña</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repetir nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
