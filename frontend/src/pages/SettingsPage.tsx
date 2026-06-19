import React, { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Database, Lock, LogOut, Camera, Trash2, Save, Loader2, User, Globe, Info, Eye, EyeOff } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const SettingsPage = () => {
  const { user, logout, updateProfile, uploadProfileImage, deleteProfileImage, isUpdating, changePassword, isChangingPassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [activeTab, setActiveTab] = useState('profile');

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large (max 2MB)');
        return;
      }
      uploadProfileImage(file);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
    }
    changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }, {
        onSuccess: () => {
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    });
  };

  const sections = [
    { id: 'profile', name: 'Profile', icon: User, description: 'Personal info.', locked: false },
    { id: 'security', name: 'Security', icon: Shield, description: 'Account safety.', locked: false },
    { id: 'preferences', name: 'Preferences', icon: Globe, description: 'App settings.', locked: true },
    { id: 'system', name: 'System', icon: Database, description: 'App status.', locked: true }
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your workspace and profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation / Profile Card */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-6 flex flex-col items-center shadow-xl">
            <div className="relative group mb-6">
              <Avatar
                src={user?.profileImage}
                name={user?.name}
                size="xl"
                className="w-20 h-20 ring-2 ring-white/[0.05] ring-offset-4 ring-offset-[#0b0f1a]"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 rounded-full backdrop-blur-sm">
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-emerald-600 rounded-full text-white"><Camera size={14} /></button>
                 <button onClick={() => deleteProfileImage()} className="p-2 bg-rose-600 rounded-full text-white"><Trash2 size={14} /></button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="w-full space-y-1 text-center mb-6">
                <h2 className="text-sm font-bold text-white">{user?.name}</h2>
                <p className="text-[10px] text-slate-500 font-medium">{user?.email}</p>
            </div>

            <div className="w-full space-y-1">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        disabled={section.locked}
                        onClick={() => setActiveTab(section.id)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all",
                            activeTab === section.id
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                : "text-slate-400 hover:bg-white/[0.03]",
                            section.locked && "opacity-40 cursor-not-allowed grayscale"
                        )}
                    >
                        <section.icon size={16} />
                        {section.name}
                        {section.locked && <Lock size={12} className="ml-auto opacity-50" />}
                    </button>
                ))}
            </div>

            <button
                onClick={() => logout()}
                className="w-full mt-6 flex items-center justify-center p-3.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
                <LogOut size={14} className="mr-2" /> Log Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
            <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Profile Information</h3>
                            <p className="text-xs text-slate-500">Update your account details and display name.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                        placeholder="Enter your name"
                                    />
                                    <button
                                        disabled={isUpdating || name === user?.name}
                                        onClick={() => updateProfile({ name })}
                                        className="px-6 py-3 sm:py-0 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                                    >
                                        {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Role</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">Administrator</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'security' && (
                    <motion.div
                        key="security"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Security Credentials</h3>
                            <p className="text-xs text-slate-500">Update your password to keep your account secure.</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            required
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium pr-12"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            required
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium pr-12"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-600/5 border border-emerald-500/10 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Info size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Password Requirements</span>
                                </div>
                                <ul className="text-[10px] text-slate-500 space-y-1 ml-5 list-disc">
                                    <li>At least 8 characters long</li>
                                    <li>Must contain both letters and numbers</li>
                                    <li>Cannot be the same as your current password</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-[2px] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20"
                            >
                                {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                Update Password
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
