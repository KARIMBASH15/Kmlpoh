
import React, { useMemo } from 'react';
import { Package, AlertTriangle, Printer, ArrowDownCircle, CheckCircle } from 'lucide-react';
import { MaterialReport } from '../types';

interface Props {
  reports: MaterialReport[];
}

const LowStockReport: React.FC<Props> = ({ reports }) => {
  const lowStockItems = useMemo(() => {
    return reports.filter(m => m.currentStock <= m.minQuantity).sort((a, b) => a.currentStock - b.currentStock);
  }, [reports]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            تنبيهات نقص المخزون
          </h2>
          <p className="text-gray-500 text-sm">الأصناف التي وصلت أو تجاوزت الحد الأدنى المسموح به</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg"
        >
          <Printer size={18} /> طباعة طلب توريد
        </button>
      </div>

      <div className="hidden print:block text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-black mb-2">طلب توريد كميات (نقص مخزون)</h1>
        <p className="text-gray-500 font-bold">تاريخ الطلب: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-red-50 text-red-800 font-bold text-sm">
            <tr>
              <th className="px-6 py-4">الصنف</th>
              <th className="px-6 py-4">الرمز</th>
              <th className="px-6 py-4">الرصيد الحالي</th>
              <th className="px-6 py-4">الحد الأدنى</th>
              <th className="px-6 py-4">العجز / النقص</th>
              <th className="px-6 py-4 print:hidden">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lowStockItems.map(item => {
              const deficit = item.minQuantity - item.currentStock;
              return (
                <tr key={item.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{item.sku}</td>
                  <td className="px-6 py-4 text-red-600 font-black">{item.currentStock} {item.unit}</td>
                  <td className="px-6 py-4 font-bold text-gray-600">{item.minQuantity} {item.unit}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-red-700 font-black">
                      <ArrowDownCircle size={14} />
                      {deficit <= 0 ? 'نفاد وشيك' : deficit} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 print:hidden">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.currentStock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.currentStock === 0 ? 'نافد تماماً' : 'تحت الحد الأدنى'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {lowStockItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle size={48} className="text-green-300" />
                    <p className="font-bold text-lg">المخزون ممتاز! لا توجد نواقص حالياً</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="hidden print:grid grid-cols-2 gap-10 mt-20">
        <div className="text-center">
          <p className="font-bold border-t border-gray-300 pt-4">توقيع مسؤول المخزن</p>
        </div>
        <div className="text-center">
          <p className="font-bold border-t border-gray-300 pt-4">اعتماد مدير المشتريات</p>
        </div>
      </div>
    </div>
  );
};

export default LowStockReport;
