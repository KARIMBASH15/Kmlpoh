
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Save, Calendar, FileText, Package, Trash2, Plus, Search, User, Info, Check } from 'lucide-react';
import { TransactionType, Material, Document, Entity, EntityType } from '../types';

interface Props {
  type: TransactionType;
  materials: Material[];
  entities: Entity[];
  onAdd: (doc: Document) => void;
  nextRef: string;
}

const Transactions: React.FC<Props> = ({ type, materials, entities, onAdd, nextRef }) => {
  const isReceive = type === TransactionType.IN;
  const targetEntityType = isReceive ? EntityType.SUPPLIER : EntityType.CUSTOMER;
  const filteredEntities = entities.filter(e => e.type === targetEntityType);

  const [docHeader, setDocHeader] = useState({
    entityId: '',
    date: new Date().toISOString().split('T')[0],
    referenceNo: nextRef,
    notes: ''
  });

  useEffect(() => {
    setDocHeader(prev => ({ ...prev, referenceNo: nextRef }));
  }, [nextRef]);

  const [items, setItems] = useState<{materialId: string, quantity: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return materials.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, materials]);

  const addItem = (mat: Material) => {
    if (items.some(i => i.materialId === mat.id)) {
      alert("هذا الصنف مضاف بالفعل في السند");
      return;
    }
    setItems([...items, { materialId: mat.id, quantity: 1 }]);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.materialId !== id));

  const updateQty = (id: string, qty: number) => {
    setItems(items.map(i => i.materialId === id ? { ...i, quantity: qty } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docHeader.entityId || items.length === 0) {
      alert("يرجى اختيار الجهة وإضافة صنف واحد على الأقل");
      return;
    }

    onAdd({
      id: Date.now().toString(),
      type,
      ...docHeader,
      items
    });

    setDocHeader({ entityId: '', date: new Date().toISOString().split('T')[0], referenceNo: '', notes: '' });
    setItems([]);
    alert("تم حفظ السند بنجاح");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className={`p-8 rounded-3xl text-white shadow-xl flex justify-between items-center ${isReceive ? 'bg-gradient-to-r from-emerald-600 to-green-500' : 'bg-gradient-to-r from-rose-600 to-red-500'}`}>
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {isReceive ? <ArrowDownLeft size={36} /> : <ArrowUpRight size={36} />}
            {isReceive ? 'سند استلام (توريد)' : 'سند صرف (مبيعات)'}
          </h2>
          <p className="mt-2 text-white/80 font-medium">إنشاء مستند جديد وإدارة حركة الأصناف</p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 hidden sm:block">
          <p className="text-xs uppercase font-bold tracking-widest opacity-60">رقم السند المقترح</p>
          <p className="text-xl font-bold">{docHeader.referenceNo}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Info size={18} /> تفاصيل السند</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{isReceive ? 'المورد' : 'العميل'}</label>
              <select required value={docHeader.entityId} onChange={e => setDocHeader({...docHeader, entityId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">اختر {isReceive ? 'المورد' : 'العميل'}...</option>
                {filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">رقم المرجع (تلقائي)</label>
              <input type="text" required placeholder="REC-0001" value={docHeader.referenceNo} onChange={e => setDocHeader({...docHeader, referenceNo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">تاريخ العملية</label>
              <input type="date" required value={docHeader.date} onChange={e => setDocHeader({...docHeader, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Package size={18} /> بنود السند</h3>
              <div className="relative w-full sm:w-64" ref={searchRef}>
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم أو الرمز..." 
                  value={searchQuery} 
                  onFocus={() => setShowSuggestions(true)}
                  onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-full pr-10 pl-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                />
                
                {showSuggestions && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto animate-fade-in">
                    {searchResults.map(m => {
                      const isAdded = items.some(i => i.materialId === m.id);
                      return (
                        <div 
                          key={m.id} 
                          onClick={() => !isAdded && addItem(m)} 
                          className={`p-3 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0 ${isAdded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                        >
                          <div>
                            <p className="font-bold text-sm text-gray-800">{m.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase">{m.sku} | {m.category}</p>
                          </div>
                          {isAdded ? <Check size={16} className="text-green-500" /> : <Plus size={16} className="text-blue-500" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => {
                const mat = materials.find(m => m.id === item.materialId);
                return (
                  <div key={item.materialId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 font-bold shadow-sm">{index + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800">{mat?.name}</p>
                        <p className="text-[10px] text-gray-400">{mat?.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-gray-100 rounded-xl px-2">
                        <input type="number" min="0.1" step="any" value={item.quantity} onChange={e => updateQty(item.materialId, parseFloat(e.target.value))} className="w-20 text-center font-bold text-blue-600 py-1.5 outline-none" />
                        <span className="text-[10px] text-gray-400 font-bold ml-2">{mat?.unit}</span>
                      </div>
                      <button type="button" onClick={() => removeItem(item.materialId)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-20" />
                  <p>ابدأ باختيار الأصناف من محرك البحث أعلاه</p>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <p className="font-bold text-gray-500">الإجمالي: {items.length} أصناف</p>
                <button type="submit" className={`px-8 py-3 rounded-2xl text-white font-bold flex items-center gap-2 transition-all shadow-xl ${isReceive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                  <Save size={20} /> حفظ السند
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Transactions;
