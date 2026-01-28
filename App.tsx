
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  FileText, 
  Users,
  Search,
  Menu,
  X,
  AlertTriangle,
  Settings as SettingsIcon,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Document, Material, TransactionType, MaterialReport, Entity, EntityType, Transaction, UserRole, UserAccount } from './types';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Transactions from './pages/Transactions';
import MovementLog from './pages/MovementLog';
import Reports from './pages/Reports';
import Entities from './pages/Entities';
import MaterialHistory from './pages/MaterialHistory';
import DocumentPrint from './pages/DocumentPrint';
import LowStockReport from './pages/LowStockReport';
import Login from './pages/Login';
import Settings from './pages/Settings';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('inv_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('inv_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', password: '8080', role: UserRole.ADMIN, name: 'مدير النظام' },
      { id: '2', username: 'manager', password: '9090', role: UserRole.MANAGER, name: 'مدير مخزن' },
      { id: '3', username: 'issuer', password: '7070', role: UserRole.ISSUER, name: 'موظف صرف' },
    ];
  });

  // --- APP DATA STATE ---
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('inv_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem('inv_entities');
    return saved ? JSON.parse(saved) : [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('inv_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('inv_categories');
    return saved ? JSON.parse(saved) : ['بناء', 'كهرباء', 'سباكة'];
  });

  const [units, setUnits] = useState<string[]>(() => {
    const saved = localStorage.getItem('inv_units');
    return saved ? JSON.parse(saved) : ['كيس', 'طن', 'لتر', 'متر', 'قطعة'];
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('inv_materials', JSON.stringify(materials));
    localStorage.setItem('inv_entities', JSON.stringify(entities));
    localStorage.setItem('inv_documents', JSON.stringify(documents));
    localStorage.setItem('inv_categories', JSON.stringify(categories));
    localStorage.setItem('inv_units', JSON.stringify(units));
    localStorage.setItem('inv_users', JSON.stringify(users));
  }, [materials, entities, documents, categories, units, users]);

  // --- ACTIONS ---
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('inv_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('inv_user_session');
  };

  const clearAllData = (password: string) => {
    if (password === '5511') {
      setMaterials([]);
      setEntities([]);
      setDocuments([]);
      setCategories(['بناء', 'كهرباء', 'سباكة']);
      setUnits(['كيس', 'طن', 'لتر', 'متر', 'قطعة']);
      alert('تم حذف جميع البيانات بنجاح.');
      return true;
    }
    alert('كلمة مرور الحذف غير صحيحة!');
    return false;
  };

  const handleImport = (data: any) => {
    try {
      if (data.materials) setMaterials(data.materials);
      if (data.entities) setEntities(data.entities);
      if (data.documents) setDocuments(data.documents);
      if (data.categories) setCategories(data.categories);
      if (data.units) setUnits(data.units);
      if (data.users) setUsers(data.users);
      alert('تم استيراد البيانات بنجاح');
    } catch (e) {
      alert('حدث خطأ أثناء استيراد البيانات. تأكد من صحة الملف.');
    }
  };

  const generateNextRef = (type: TransactionType) => {
    const prefix = type === TransactionType.IN ? 'REC' : 'ISS';
    const count = documents.filter(d => d.type === type).length + 1;
    return `${prefix}-${count.toString().padStart(4, '0')}`;
  };

  const addMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
    if (!categories.includes(material.category)) setCategories(prev => [...prev, material.category]);
    if (!units.includes(material.unit)) setUnits(prev => [...prev, material.unit]);
  };

  const updateMaterial = (updatedMaterial: Material) => {
    setMaterials(prev => prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
  };

  const deleteMaterial = (id: string) => {
    if (window.confirm("حذف المادة سيؤدي لعدم ظهور حركاتها القديمة بشكل صحيح. هل أنت متأكد؟")) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  const addEntity = (entity: Entity) => setEntities(prev => [...prev, entity]);
  
  const addDocument = (doc: Document) => setDocuments(prev => [doc, ...prev]);
  
  const updateDocument = (updatedDoc: Document) => {
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
  };

  const deleteDocument = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السند؟ سيتم تحديث المخزون فوراً.")) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const materialReports = useMemo(() => {
    return materials.map(m => {
      let totalIn = 0;
      let totalOut = 0;
      let lastMovement = null;

      documents.forEach(doc => {
        doc.items.forEach(item => {
          if (item.materialId === m.id) {
            if (doc.type === TransactionType.IN) totalIn += item.quantity;
            else totalOut += item.quantity;
            if (!lastMovement || new Date(doc.date) > new Date(lastMovement)) {
              lastMovement = doc.date;
            }
          }
        });
      });
      
      return {
        ...m,
        currentStock: totalIn - totalOut,
        totalIn,
        totalOut,
        lastMovement
      } as MaterialReport;
    });
  }, [materials, documents]);

  const allTransactions = useMemo(() => {
    const txs: Transaction[] = [];
    documents.forEach(doc => {
      doc.items.forEach((item, index) => {
        txs.push({
          id: `${doc.id}-${index}`,
          materialId: item.materialId,
          quantity: item.quantity,
          type: doc.type,
          date: doc.date
        });
      });
    });
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents]);

  const lowStockCount = useMemo(() => {
    return materialReports.filter(m => m.currentStock <= m.minQuantity).length;
  }, [materialReports]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login users={users} onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isManager = currentUser.role === UserRole.MANAGER || isAdmin;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row print:bg-white overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-4 print:hidden">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package size={24} /> مخزني
          </h1>
          <div className="w-8"></div>
        </header>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 right-0 z-[100] w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
              <Package size={28} />
              مخزني
            </h1>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-2 px-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
            <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="لوحة التحكم" onClick={() => setIsSidebarOpen(false)} />
            
            {(isManager) && (
              <SidebarLink to="/materials" icon={<Package size={18} />} label="قائمة المواد" onClick={() => setIsSidebarOpen(false)} />
            )}
            
            <SidebarLink to="/entities" icon={<Users size={18} />} label="الجهات" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/receive" icon={<ArrowDownLeft size={18} />} label="سند استلام" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/issue" icon={<ArrowUpRight size={18} />} label="سند صرف" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/history" icon={<History size={18} />} label="حركة المواد" onClick={() => setIsSidebarOpen(false)} />
            
            {(isManager) && (
              <>
                <SidebarLink to="/reports" icon={<FileText size={18} />} label="التقارير" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/low-stock" icon={<AlertTriangle size={18} />} label="تنبيهات النقص" onClick={() => setIsSidebarOpen(false)} count={lowStockCount} />
              </>
            )}

            {(isAdmin) && (
              <SidebarLink to="/settings" icon={<SettingsIcon size={18} />} label="الإعدادات والمستخدمين" onClick={() => setIsSidebarOpen(false)} />
            )}
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{currentUser.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut size={18} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible h-screen">
          <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 print:hidden">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="بحث سريع..." className="w-full bg-gray-100 border-none rounded-lg pr-10 pl-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"/>
            </div>
            <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
               <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
            <Routes>
              <Route path="/" element={<Dashboard reports={materialReports} transactions={allTransactions} />} />
              <Route path="/materials" element={isManager ? <Materials materials={materials} onAdd={addMaterial} onUpdate={updateMaterial} onDelete={deleteMaterial} initialCategories={categories} initialUnits={units} /> : <Navigate to="/" />} />
              <Route path="/entities" element={<Entities entities={entities} onAdd={addEntity} documents={documents} materials={materials} />} />
              <Route path="/receive" element={<Transactions type={TransactionType.IN} materials={materials} entities={entities} onAdd={addDocument} nextRef={generateNextRef(TransactionType.IN)} />} />
              <Route path="/issue" element={<Transactions type={TransactionType.OUT} materials={materials} entities={entities} onAdd={addDocument} nextRef={generateNextRef(TransactionType.OUT)} />} />
              <Route path="/history" element={<MovementLog documents={documents} materials={materials} categories={categories} entities={entities} onDelete={deleteDocument} onUpdate={updateDocument} />} />
              <Route path="/material-history/:id" element={<MaterialHistory documents={documents} materials={materials} entities={entities} />} />
              <Route path="/print-document/:id" element={<DocumentPrint documents={documents} materials={materials} entities={entities} />} />
              <Route path="/reports" element={isManager ? <Reports reports={materialReports} categories={categories} documents={documents} entities={entities} /> : <Navigate to="/" />} />
              <Route path="/low-stock" element={isManager ? <LowStockReport reports={materialReports} /> : <Navigate to="/" />} />
              <Route path="/settings" element={isAdmin ? <Settings users={users} setUsers={setUsers} clearData={clearAllData} onImport={handleImport} /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const SidebarLink: React.FC<{to: string, icon: React.ReactNode, label: string, onClick: () => void, count?: number}> = ({ to, icon, label, onClick, count }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center gap-3">
        {icon} <span className="font-medium text-sm">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
};

export default App;
