
import React, { useState } from 'react';
import { Package, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserAccount } from '../types';

interface Props {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<Props> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-8 bg-blue-600 text-white text-center">
          <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4">
            <Package size={48} />
          </div>
          <h1 className="text-3xl font-black">نظام مخزني</h1>
          <p className="text-blue-100 mt-2">نظام إدارة المخازن الاحترافي</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-shake">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-12 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            تسجيل الدخول
          </button>

          <div className="pt-4 border-t border-gray-100 text-center space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">تلميحات الدخول</p>
            <div className="flex flex-wrap justify-center gap-2">
              <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">أدمن: 8080</div>
              <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">مدير: 9090</div>
              <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">صرف: 7070</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
