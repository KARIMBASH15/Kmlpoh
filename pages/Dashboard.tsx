
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Sparkles,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MaterialReport, Transaction, TransactionType } from '../types';
import { getInventoryAnalysis } from '../services/geminiService';

interface Props {
  reports: MaterialReport[];
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ reports, transactions }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalItems = reports.length;
  const lowStockItems = reports.filter(r => r.currentStock <= r.minQuantity).length;
  const totalStockValue = reports.reduce((acc, r) => acc + r.currentStock, 0);
  
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await getInventoryAnalysis(reports);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">لوحة التحكم</h2>
          <p className="text-gray-500 text-sm font-medium">نظرة عامة على حالة المستودع اليوم</p>
        </div>
        <button 
          onClick={handleAIAnalysis}
          disabled={isAnalyzing || reports.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 font-black"
        >
          {isAnalyzing ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {isAnalyzing ? 'جاري التحليل...' : 'تحليل ذكي للمخزون'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="إجمالي الأصناف" value={totalItems} icon={<Package size={24} />} color="bg-blue-600" />
        <StatCard title="وحدات المخزون" value={totalStockValue} icon={<TrendingUp size={24} />} color="bg-emerald-600" />
        <StatCard title="تحت الحد الأدنى" value={lowStockItems} icon={<AlertTriangle size={24} />} color="bg-red-600" />
        <StatCard title="عمليات الشهر" value={transactions.length} icon={<TrendingDown size={24} />} color="bg-slate-600" />
      </div>

      {aiInsight && (
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 animate-fade-in">
          <div className="flex items-center gap-2 mb-4 text-purple-700 font-black uppercase tracking-widest text-xs">
            <Sparkles size={18} /> توصيات الذكاء الاصطناعي
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">{aiInsight}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-800">آخر العمليات</h3>
            <Link to="/history" className="text-blue-600 text-xs font-bold hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(t => {
              const material = reports.find(r => r.id === t.materialId);
              return (
                <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${t.type === TransactionType.IN ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === TransactionType.IN ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate max-w-[120px] sm:max-w-none">{material?.name || 'صنف غير متاح'}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{t.date}</p>
                    </div>
                  </div>
                  <p className={`font-black text-lg ${t.type === TransactionType.IN ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.IN ? '+' : '-'}{t.quantity}
                  </p>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-center py-10 text-gray-400">لا توجد عمليات مسجلة حالياً</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-800">تنبيهات المخزون</h3>
            <Link to="/low-stock" className="text-red-600 text-xs font-bold hover:underline">متابعة النواقص</Link>
          </div>
          <div className="space-y-4">
            {reports.filter(r => r.currentStock <= r.minQuantity).slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 border-r-4 border-red-500 bg-red-50 rounded-2xl">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{r.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">الرصيد: {r.currentStock} {r.unit} (الحد: {r.minQuantity})</p>
                </div>
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
              </div>
            ))}
            {reports.filter(r => r.currentStock <= r.minQuantity).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><Package size={32}/></div>
                <p className="text-gray-400 font-bold">المخزون في وضع آمن وممتاز</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: number, icon: React.ReactNode, color: string}> = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-center justify-between text-center sm:text-right group hover:shadow-lg transition-all">
    <div className="order-2 sm:order-1 mt-3 sm:mt-0">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl sm:text-3xl font-black">{value}</p>
    </div>
    <div className={`order-1 sm:order-2 p-4 rounded-2xl text-white ${color} shadow-lg transition-transform group-hover:scale-110`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
