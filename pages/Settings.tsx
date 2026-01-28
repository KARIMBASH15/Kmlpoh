
import React, { useState, useRef } from 'react';
import { UserPlus, Shield, Trash2, Download, Upload, RefreshCw, X, UserCog, Key, UserCheck, AlertOctagon } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface Props {
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  clearData: (password: string) => boolean;
  onImport: (data: any) => void;
}

const Settings: React.FC<Props> = ({ users, setUsers, clearData, onImport }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetPass, setResetPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: UserRole.ISSUER
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === newUser.username)) {
      alert('اسم المستخدم موجود مسبقاً');
      return;
    }
    setUsers([...users, { ...newUser, id: Date.now().toString() }]);
    setShowAddUser(false);
    setNewUser({ name: '', username: '', password: '', role: UserRole.ISSUER });
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      alert('لا يمكن حذف آخر مستخدم في النظام');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const exportData = () => {
    try {
      const data = {
        materials: JSON.parse(localStorage.getItem('inv_materials') || '[]'),
        entities: JSON.parse(localStorage.getItem('inv_entities') || '[]'),
        documents: JSON.parse(localStorage.getItem('inv_documents') || '[]'),
        users: JSON.parse(localStorage.getItem('inv_users') || '[]'),
        categories: JSON.parse(localStorage.getItem('inv_categories') || '[]'),
        units: JSON.parse(localStorage.getItem('inv_units') || '[]')
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e) {
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (window.confirm('سيتم استبدال البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
          onImport(json);
        }
      } catch (err) {
        alert('الملف المختار ليس ملف JSON صحيحاً');
      }
      // Reset input so the same file can be chosen again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (clearData(resetPass)) {
      setResetConfirm(false);
      setResetPass('');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة النظام والمستخدمين</h2>
          <p className="text-gray-500 text-sm">تحكم في الصلاحيات والنسخ الاحتياطي للبيانات</p>
        </div>
        <button 
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={20} /> إضافة مستخدم
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><UserCheck size={20} /> المستخدمون الحاليون</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">اسم المستخدم</th>
                  <th className="px-6 py-4">الصلاحية</th>
                  <th className="px-6 py-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{u.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role === UserRole.ADMIN ? 'bg-red-100 text-red-600' : u.role === UserRole.MANAGER ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {u.role === UserRole.ADMIN ? 'مدير عام' : u.role === UserRole.MANAGER ? 'مدير مخزن' : 'موظف صرف'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backup & System Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-4"><Download size={20} className="text-blue-500" /> النسخ الاحتياطي والتصدير</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={exportData} className="flex flex-col items-center justify-center p-6 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all gap-3 group">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Download className="text-blue-600" /></div>
                <span className="font-bold text-blue-700 text-sm">تصدير نسخة JSON</span>
              </button>
              
              <button onClick={handleImportClick} className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all gap-3 group">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Upload className="text-emerald-600" /></div>
                <span className="font-bold text-emerald-700 text-sm text-center">استيراد بيانات</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 space-y-4">
            <h3 className="font-bold text-red-600 flex items-center gap-2 border-b border-red-50 pb-4"><AlertOctagon size={20} /> منطقة الخطر</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
              سيتم حذف جميع السندات، المواد، والجهات. لا يمكن التراجع عن هذه الخطوة بعد التنفيذ.
            </p>
            {resetConfirm ? (
              <div className="space-y-3 animate-fade-in">
                <input 
                  type="password" 
                  placeholder="أدخل كلمة مرور الحذف (5511)" 
                  value={resetPass}
                  onChange={e => setResetPass(e.target.value)}
                  className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                />
                <div className="flex gap-2">
                  <button onClick={handleReset} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-black hover:bg-red-700 shadow-lg shadow-red-100">تأكيد المسح</button>
                  <button onClick={() => setResetConfirm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold">إلغاء</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setResetConfirm(true)} className="w-full py-4 border-2 border-dashed border-red-200 rounded-2xl text-red-500 font-black flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
                <RefreshCw size={20} /> حذف بيانات البرنامج والبدأ من جديد
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-scale-up overflow-hidden">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><UserPlus size={24} /> إضافة مستخدم جديد</h3>
              <button onClick={() => setShowAddUser(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">الاسم الثلاثي</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">اسم المستخدم</label>
                <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">كلمة المرور</label>
                <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">صلاحية المستخدم</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={UserRole.ADMIN}>مدير عام (Full Access)</option>
                  <option value={UserRole.MANAGER}>مدير مخزن (Reports & Materials)</option>
                  <option value={UserRole.ISSUER}>موظف صرف (Transactions Only)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-4">حفظ المستخدم</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
