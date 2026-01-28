
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, Package, Calendar, User, FileText, Share2 } from 'lucide-react';
import { Document, Material, Entity, TransactionType } from '../types';

interface Props {
  documents: Document[];
  materials: Material[];
  entities: Entity[];
}

const DocumentPrint: React.FC<Props> = ({ documents, materials, entities }) => {
  const { id } = useParams();
  const doc = documents.find(d => d.id === id);
  if (!doc) return <div className="p-10 text-center">السند غير موجود</div>;

  const entity = entities.find(e => e.id === doc.entityId);

  const sendWhatsApp = () => {
    if (!entity?.phone) {
      alert("رقم الهاتف غير متوفر لهذه الجهة");
      return;
    }

    const typeStr = doc.type === TransactionType.IN ? "سند استلام" : "سند صرف";
    let message = `مرحباً ${entity.name}،\nإليك تفاصيل ${typeStr} رقم: ${doc.referenceNo}\nالتاريخ: ${doc.date}\n\nالأصناف:\n`;
    
    doc.items.forEach((item, idx) => {
      const mat = materials.find(m => m.id === item.materialId);
      message += `${idx + 1}. ${mat?.name} (${item.quantity} ${mat?.unit})\n`;
    });

    if (doc.notes) message += `\nملاحظات: ${doc.notes}`;
    message += `\n\nشكراً لتعاملكم معنا.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${entity.phone.replace(/\+/g, '')}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Link to="/history" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-bold">
          <ArrowRight size={20} /> العودة للسجل
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={sendWhatsApp} 
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all"
          >
            <Share2 size={20} /> إرسال عبر واتساب
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg">
            <Printer size={20} /> طباعة الفاتورة
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-3xl p-10 shadow-sm print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-10 mb-10">
          <div>
            <h1 className="text-4xl font-black text-blue-600 flex items-center gap-3">
              <Package size={40} /> مخزني
            </h1>
            <p className="text-gray-400 mt-2 font-medium uppercase tracking-widest text-sm">نظام إدارة المخزون والمبيعات</p>
          </div>
          <div className="text-left">
            <h2 className={`text-2xl font-black ${doc.type === TransactionType.IN ? 'text-green-600' : 'text-red-600'}`}>
              {doc.type === TransactionType.IN ? 'سند استلام توريد' : 'سند صرف مبيعات'}
            </h2>
            <p className="text-gray-500 font-bold mt-1">رقم السند: #{doc.referenceNo}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <User size={14} /> تفاصيل {doc.type === TransactionType.IN ? 'المورد' : 'العميل'}
            </h3>
            <p className="text-xl font-bold text-slate-800">{entity?.name}</p>
            <p className="text-gray-500 font-medium">{entity?.phone}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <Calendar size={14} /> معلومات السند
            </h3>
            <p className="text-xl font-bold text-slate-800">التاريخ: {doc.date}</p>
            <p className="text-gray-500 font-medium">الوقت: {new Date(parseInt(doc.id)).toLocaleTimeString('ar-SA')}</p>
          </div>
        </div>

        {/* Table */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-right">
            <thead className="bg-slate-900 text-white font-bold text-sm">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">الصنف</th>
                <th className="px-6 py-4">الرمز SKU</th>
                <th className="px-6 py-4 text-center">الكمية</th>
                <th className="px-6 py-4">الوحدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doc.items.map((item, i) => {
                const mat = materials.find(m => m.id === item.materialId);
                return (
                  <tr key={i} className="text-gray-700">
                    <td className="px-6 py-4 font-bold">{i + 1}</td>
                    <td className="px-6 py-4 font-bold">{mat?.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{mat?.sku}</td>
                    <td className="px-6 py-4 text-center font-black text-lg">{item.quantity}</td>
                    <td className="px-6 py-4 text-gray-400">{mat?.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {doc.notes && (
          <div className="bg-amber-50 p-6 rounded-2xl border-r-4 border-amber-400 mb-10">
            <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-1">
              <FileText size={16} /> ملاحظات السند
            </h4>
            <p className="text-amber-700">{doc.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-end pt-10 border-t-2 border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">إجمالي الكميات</p>
            <p className="text-4xl font-black text-slate-900">
              {doc.items.reduce((acc, curr) => acc + curr.quantity, 0)} <span className="text-sm font-medium text-gray-400">وحدة</span>
            </p>
          </div>
          <div className="text-left">
            <p className="text-gray-400 text-xs italic">توقيع المستلم: ___________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPrint;
