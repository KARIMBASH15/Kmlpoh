
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ArrowDownLeft, ArrowUpRight, ArrowRight, Printer, Search, Calendar, User, FileText, Share2 } from 'lucide-react';
import { Document, Material, Entity, TransactionType } from '../types';

interface Props {
  documents: Document[];
  materials: Material[];
  entities: Entity[];
}

const MaterialHistory: React.FC<Props> = ({ documents, materials, entities }) => {
  const { id } = useParams();
  const material = materials.find(m => m.id === id);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', searchQuery: '' });

  const history = useMemo(() => {
    if (!id) return [];
    const lines: any[] = [];
    documents.forEach(doc => {
      doc.items.forEach(item => {
        if (item.materialId === id) {
          const entity = entities.find(e => e.id === doc.entityId);
          lines.push({
            date: doc.date,
            type: doc.type,
            referenceNo: doc.referenceNo,
            entityName: entity?.name || 'مجهول',
            entityPhone: entity?.phone || '',
            quantity: item.quantity,
            notes: doc.notes,
            docId: doc.id
          });
        }
      });
    });
    
    return lines.filter(h => {
      const transDate = new Date(h.date);
      const matchesStart = !filter.startDate || transDate >= new Date(filter.startDate);
      const matchesEnd = !filter.endDate || transDate <= new Date(filter.endDate);
      const matchesSearch = h.entityName.includes(filter.searchQuery) || h.referenceNo.includes(filter.searchQuery);
      return matchesStart && matchesEnd && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [id, documents, entities, filter]);

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    history.forEach(h => {
      if (h.type === TransactionType.IN) totalIn += h.quantity;
      else totalOut += h.quantity;
    });
    return { totalIn, totalOut, current: totalIn - totalOut };
  }, [history]);

  const sendWhatsApp = (h: any) => {
    if (!h.entityPhone) {
      alert("رقم الهاتف غير متوفر");
      return;
    }
    const typeStr = h.type === TransactionType.IN ? "سند استلام" : "سند صرف";
    let message = `مرحباً ${h.entityName}،\nتفاصيل حركة الصنف (${material?.name}) في ${typeStr} رقم: ${h.referenceNo}\nالتاريخ: ${h.date}\nالكمية: ${h.quantity} ${material?.unit}\n\nشكراً لتعاملكم معنا.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${h.entityPhone.replace(/\+/g, '')}?text=${encodedMessage}`, '_blank');
  };

  if (!material) return <div className="p-20 text-center"><Package className="mx-auto text-gray-200 mb-4" size={64} /><p className="text-xl text-gray-400 font-bold">المادة المطلوبة غير موجودة في النظام</p></div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/reports" className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all">
            <ArrowRight size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="text-blue-500" />
              سجل حركة الصنف: {material.name}
            </h2>
            <p className="text-gray-500 text-sm">عرض تفصيلي للوارد والمنصرف والرصيد الحالي</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Printer size={20} /> طباعة سجل الحركة
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-3xl border border-green-100 shadow-sm">
          <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-1">إجمالي الوارد (+)</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-green-700">{stats.totalIn}</p>
            <p className="text-sm font-bold text-green-500 mb-1.5">{material.unit}</p>
          </div>
          <p className="text-[10px] text-green-400 mt-2">خلال الفترة المحددة</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-1">إجمالي المنصرف (-)</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-red-700">{stats.totalOut}</p>
            <p className="text-sm font-bold text-red-500 mb-1.5">{material.unit}</p>
          </div>
          <p className="text-[10px] text-red-400 mt-2">خلال الفترة المحددة</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-20"></div>
          <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-1">الرصيد المتبقي (الحالي)</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-blue-700">{stats.current}</p>
            <p className="text-sm font-bold text-blue-500 mb-1.5">{material.unit}</p>
          </div>
          <p className="text-[10px] text-blue-400 mt-2">إجمالي المتوفر في المستودع</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end print:hidden">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Search size={12}/> بحث في الجهة أو السند</label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="اسم العميل، المورد، رقم السند..."
              value={filter.searchQuery}
              onChange={e => setFilter({...filter, searchQuery: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12}/> من تاريخ</label>
          <input 
            type="date" 
            value={filter.startDate}
            onChange={e => setFilter({...filter, startDate: e.target.value})}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12}/> إلى تاريخ</label>
          <input 
            type="date" 
            value={filter.endDate}
            onChange={e => setFilter({...filter, endDate: e.target.value})}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-900 text-white font-bold text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">التاريخ والوقت</th>
              <th className="px-6 py-5">رقم السند</th>
              <th className="px-6 py-5">الجهة (عميل/مورد)</th>
              <th className="px-6 py-5">نوع الحركة</th>
              <th className="px-6 py-5 text-center">الكمية</th>
              <th className="px-6 py-5">ملاحظات</th>
              <th className="px-6 py-5 print:hidden text-center">خيارات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {history.map((h, i) => (
              <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{h.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link to={`/print-document/${h.docId}`} className="text-blue-600 font-mono font-bold hover:underline">
                    {h.referenceNo}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="font-bold text-slate-800">{h.entityName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${h.type === TransactionType.IN ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {h.type === TransactionType.IN ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                    {h.type === TransactionType.IN ? 'توريد مستلم' : 'صرف صادرة'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xl font-black ${h.type === TransactionType.IN ? 'text-green-600' : 'text-red-600'}`}>
                    {h.type === TransactionType.IN ? '+' : '-'}{h.quantity}
                  </span>
                  <span className="text-[10px] text-gray-400 mr-1 font-bold">{material.unit}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 italic text-xs max-w-xs truncate">{h.notes || '-'}</td>
                <td className="px-6 py-4 print:hidden text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => sendWhatsApp(h)}
                      title="إرسال عبر واتساب"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all border border-green-100"
                    >
                      <Share2 size={16} />
                    </button>
                    <Link 
                      to={`/print-document/${h.docId}`}
                      title="عرض وطباعة السند"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-blue-100"
                    >
                      <Printer size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="text-gray-200" size={48} />
                    <p className="text-gray-400 font-bold">لم يتم تسجيل أي حركة لهذه المادة خلال الفترة المحددة</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info (Print only) */}
      <div className="hidden print:block mt-10 border-t pt-6 text-gray-500 text-sm">
        <p>تم استخراج هذا التقرير بتاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
        <p>الرصيد النهائي للصنف: {stats.current} {material.unit}</p>
      </div>
    </div>
  );
};

export default MaterialHistory;
