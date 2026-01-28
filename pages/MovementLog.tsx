
import React, { useState, useMemo } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, Download, Tag, FileText, User, Trash2, Edit2, Printer, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Document, Material, TransactionType, Entity } from '../types';

interface Props {
  documents: Document[];
  materials: Material[];
  categories: string[];
  entities: Entity[];
  onDelete: (id: string) => void;
  onUpdate: (doc: Document) => void;
}

const MovementLog: React.FC<Props> = ({ documents, materials, categories, entities, onDelete, onUpdate }) => {
  const [filter, setFilter] = useState({ search: '', startDate: '', endDate: '', type: 'ALL', category: 'ALL', entityId: 'ALL' });
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Document | null>(null);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const entity = entities.find(e => e.id === doc.entityId);
      const matchesSearch = doc.referenceNo.includes(filter.search) || 
                           entity?.name.includes(filter.search);
      
      const matchesType = filter.type === 'ALL' || doc.type === filter.type;
      const matchesEntity = filter.entityId === 'ALL' || doc.entityId === filter.entityId;
      
      const transDate = new Date(doc.date);
      const matchesStartDate = !filter.startDate || transDate >= new Date(filter.startDate);
      const matchesEndDate = !filter.endDate || transDate <= new Date(filter.endDate);

      const matchesCategory = filter.category === 'ALL' || doc.items.some(item => {
        const mat = materials.find(m => m.id === item.materialId);
        return mat?.category === filter.category;
      });

      return matchesSearch && matchesType && matchesStartDate && matchesEndDate && matchesCategory && matchesEntity;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents, materials, entities, filter]);

  const handleStartEdit = (doc: Document) => {
    setEditingDocId(doc.id);
    setEditFormData(JSON.parse(JSON.stringify(doc)));
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdate(editFormData);
      setEditingDocId(null);
      setEditFormData(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold">حركة المواد التفصيلية</h2>
          <p className="text-gray-500 text-sm">إدارة وتعديل السندات المباشرة وحركة المخزون</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg"><Printer size={18} /> طباعة القائمة</button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end print:hidden overflow-x-auto">
        <div className="sm:col-span-1 lg:col-span-1">
          <label className="block text-xs font-black text-gray-500 mb-1">بحث برقم السند أو الجهة</label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="بحث..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 mb-1">الجهة</label>
          <select value={filter.entityId} onChange={e => setFilter({...filter, entityId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none">
            <option value="ALL">كل الجهات</option>
            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 mb-1">النوع</label>
          <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none">
            <option value="ALL">الكل</option>
            <option value={TransactionType.IN}>استلام</option>
            <option value={TransactionType.OUT}>صرف</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 mb-1">من</label>
          <input type="date" value={filter.startDate} onChange={e => setFilter({...filter, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 mb-1">إلى</label>
          <input type="date" value={filter.endDate} onChange={e => setFilter({...filter, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredDocs.map(doc => {
          const entity = entities.find(e => e.id === doc.entityId);
          const isEditing = editingDocId === doc.id;

          return (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border print:shadow-none print:mb-4">
              <div className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${doc.type === TransactionType.IN ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${doc.type === TransactionType.IN ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {doc.type === TransactionType.IN ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 tracking-tight leading-none mb-1">سند: #{doc.referenceNo}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{doc.date} | {entity?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 print:hidden">
                  <Link to={`/print-document/${doc.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Printer size={18} /></Link>
                  <button onClick={() => handleStartEdit(doc)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit2 size={18} /></button>
                  <button onClick={() => onDelete(doc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="p-4 bg-white">
                {isEditing ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">رقم السند</label>
                        <input type="text" value={editFormData?.referenceNo} onChange={e => setEditFormData({...editFormData!, referenceNo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">التاريخ</label>
                        <input type="date" value={editFormData?.date} onChange={e => setEditFormData({...editFormData!, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تعديل الكميات:</p>
                      {editFormData?.items.map((item, idx) => {
                        const mat = materials.find(m => m.id === item.materialId);
                        return (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="font-black text-sm text-gray-700">{mat?.name}</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => {
                                  const newItems = [...editFormData.items];
                                  newItems[idx].quantity = parseFloat(e.target.value);
                                  setEditFormData({...editFormData, items: newItems});
                                }}
                                className="w-24 text-center font-black text-blue-600 bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none" 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setEditingDocId(null)} className="px-6 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold">إلغاء</button>
                      <button onClick={handleSaveEdit} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black">حفظ التغييرات</button>
                    </div>
                  </div>
                ) : (
                  <div className="responsive-table-container">
                    <div className="inline-flex min-w-full gap-3 py-1">
                      {doc.items.map((item, idx) => {
                        const mat = materials.find(m => m.id === item.materialId);
                        return (
                          <div key={idx} className="flex flex-col flex-shrink-0 bg-gray-50/50 p-3 rounded-xl border border-gray-100 min-w-[140px]">
                            <span className="font-bold text-xs text-gray-600 truncate mb-1">{mat?.name}</span>
                            <span className="font-black text-slate-800">{item.quantity} {mat?.unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {doc.notes && !isEditing && (
                  <div className="mt-3 px-3 py-2 bg-amber-50 text-[10px] text-amber-700 italic border-r-2 border-amber-300 rounded-sm">
                    ملاحظة: {doc.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredDocs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">لا توجد سجلات تطابق الفلاتر المختارة</div>
        )}
      </div>
    </div>
  );
};

export default MovementLog;
