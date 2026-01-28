
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MaterialReport, Document, TransactionType, Entity } from '../types';
import { Search, Layers, Package, History, Printer, Calendar, User, ArrowRight } from 'lucide-react';

interface Props {
  reports: MaterialReport[];
  categories: string[];
  documents: Document[];
  entities: Entity[];
}

const Reports: React.FC<Props> = ({ reports, categories, documents, entities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'materials' | 'categories'>('materials');
  const [filter, setFilter] = useState({ startDate: '', endDate: '', entityId: 'ALL' });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const filteredMaterialStats = useMemo(() => {
    return reports.map(m => {
      let totalIn = 0;
      let totalOut = 0;

      documents.forEach(doc => {
        const transDate = new Date(doc.date);
        const matchesStart = !filter.startDate || transDate >= new Date(filter.startDate);
        const matchesEnd = !filter.endDate || transDate <= new Date(filter.endDate);
        const matchesEntity = filter.entityId === 'ALL' || doc.entityId === filter.entityId;

        if (matchesStart && matchesEnd && matchesEntity) {
          doc.items.forEach(item => {
            if (item.materialId === m.id) {
              if (doc.type === TransactionType.IN) totalIn += item.quantity;
              else totalOut += item.quantity;
            }
          });
        }
      });

      return {
        ...m,
        totalIn,
        totalOut,
        currentStock: totalIn - totalOut
      };
    }).filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [reports, documents, filter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold">تقارير المخزون والكميات</h2>
          <p className="text-gray-500 text-sm">تحليل استهلاك المواد والواردات والحدود الدنيا</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button onClick={() => setViewMode('materials')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'materials' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package size={16} /> تقرير المواد
          </button>
          <button onClick={() => setViewMode('categories')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Layers size={16} /> تقرير التصنيفات
          </button>
        </div>
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg">
          <Printer size={18} /> طباعة التقرير الشامل
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end print:hidden">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Search size={12}/> بحث سريع بالاسم أو SKU</label>
          <input type="text" placeholder="اسم المادة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><User size={12}/> اختيار الجهة</label>
          <select value={filter.entityId} onChange={e => setFilter({...filter, entityId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ALL">كل الجهات</option>
            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12}/> من تاريخ</label>
          <input type="date" value={filter.startDate} onChange={e => setFilter({...filter, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12}/> إلى تاريخ</label>
          <input type="date" value={filter.endDate} onChange={e => setFilter({...filter, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {viewMode === 'materials' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-none">
          <table className="w-full text-right">
            <thead className="bg-slate-900 text-white font-bold text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">اسم المادة</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">إجمالي الوارد (+)</th>
                <th className="px-6 py-4">إجمالي المنصرف (-)</th>
                <th className="px-6 py-4">الحد الأدنى</th>
                <th className="px-6 py-4">الرصيد المتبقي</th>
                <th className="px-6 py-4 print:hidden text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredMaterialStats.map(r => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <Link to={`/material-history/${r.id}`} className="block">
                      <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{r.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{r.sku}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold">{r.category}</span>
                  </td>
                  <td className="px-6 py-4 text-green-600 font-bold">{r.totalIn} <span className="text-[10px] opacity-60">{r.unit}</span></td>
                  <td className="px-6 py-4 text-red-600 font-bold">{r.totalOut} <span className="text-[10px] opacity-60">{r.unit}</span></td>
                  <td className="px-6 py-4 text-amber-600 font-medium italic">{r.minQuantity}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${r.currentStock <= r.minQuantity ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                        {r.currentStock}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{r.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 print:hidden text-center">
                    <Link to={`/material-history/${r.id}`} className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition-all border border-blue-100">
                      <History size={14} /> سجل الحركة التفصيلي
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredMaterialStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-medium">لا توجد نتائج تطابق معايير البحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {categories.map(cat => {
            const catMats = filteredMaterialStats.filter(r => r.category === cat);
            const totalStock = catMats.reduce((acc, r) => acc + r.currentStock, 0);
            return (
              <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)} className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Layers className="text-blue-500" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">{cat}</h3>
                      <p className="text-xs text-gray-400 font-medium">{catMats.length} أصناف تحت هذا التصنيف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي المخزون</p>
                      <p className="font-black text-blue-600 text-xl">{totalStock}</p>
                    </div>
                    <ArrowRight size={20} className={`text-gray-300 transition-transform ${expandedCategory === cat ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                {expandedCategory === cat && (
                  <div className="px-6 pb-6 bg-gray-50/30 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 animate-fade-in">
                    {catMats.map(m => (
                      <Link key={m.id} to={`/material-history/${m.id}`} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-gray-800">{m.name}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.currentStock <= m.minQuantity ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {m.currentStock} {m.unit}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mb-1">{m.sku}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;
