
import React, { useState } from 'react';
import { Plus, Users, User, Phone, Mail, X, FileText, ChevronLeft, Package } from 'lucide-react';
import { Entity, EntityType, Document, Material } from '../types';

interface Props {
  entities: Entity[];
  onAdd: (entity: Entity) => void;
  documents: Document[];
  materials: Material[];
}

const Entities: React.FC<Props> = ({ entities, onAdd, documents, materials }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [formData, setFormData] = useState({ name: '', type: EntityType.CUSTOMER, phone: '', email: '' });

  const entityDocs = selectedEntity ? documents.filter(d => d.entityId === selectedEntity.id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: Date.now().toString(), ...formData });
    setShowModal(false);
    setFormData({ name: '', type: EntityType.CUSTOMER, phone: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">العملاء والموردين</h2>
          <p className="text-gray-500 text-sm">إدارة جهات الاتصال وحركاتهم المالية</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus size={20} /> إضافة جهة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map(e => (
          <div key={e.id} onClick={() => setSelectedEntity(e)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${e.type === EntityType.SUPPLIER ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                <User size={24} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${e.type === EntityType.SUPPLIER ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {e.type === EntityType.SUPPLIER ? 'مورد' : 'عميل'}
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{e.name}</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Phone size={14} /> {e.phone}</div>
              {e.email && <div className="flex items-center gap-2"><Mail size={14} /> {e.email}</div>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-400">
              <span>{documents.filter(d => d.entityId === e.id).length} سندات</span>
              <ChevronLeft size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail View */}
      {selectedEntity && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Users size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold">{selectedEntity.name}</h3>
                  <p className="text-white/60 text-sm">{selectedEntity.type === EntityType.SUPPLIER ? 'سجل المورد' : 'سجل العميل'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEntity(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold mb-1">إجمالي العمليات</p>
                  <p className="text-2xl font-bold">{entityDocs.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold mb-1">آخر عملية</p>
                  <p className="text-lg font-bold">{entityDocs[0]?.date || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold mb-1">الحالة</p>
                  <p className="text-lg font-bold text-green-500">نشط</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18} /> سجل الفواتير والسندات</h4>
                <div className="space-y-4">
                  {entityDocs.map(doc => (
                    <div key={doc.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <span className="font-bold text-sm">سند رقم: {doc.referenceNo}</span>
                        <span className="text-xs text-gray-400">{doc.date}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {doc.items.map((item, idx) => {
                          const mat = materials.find(m => m.id === item.materialId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                              <div className="flex items-center gap-2">
                                <Package size={14} className="text-blue-400" />
                                <span className="font-medium">{mat?.name}</span>
                              </div>
                              <span className="font-bold">{item.quantity} {mat?.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                      {doc.notes && <div className="px-4 py-2 bg-amber-50 text-[11px] text-amber-700 italic border-t border-amber-100">ملاحظة: {doc.notes}</div>}
                    </div>
                  ))}
                  {entityDocs.length === 0 && <p className="text-center py-10 text-gray-400">لا توجد سجلات بعد</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة جهة اتصال</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">النوع</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as EntityType})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={EntityType.CUSTOMER}>عميل</option>
                  <option value={EntityType.SUPPLIER}>مورد</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني (اختياري)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">حفظ البيانات</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entities;
