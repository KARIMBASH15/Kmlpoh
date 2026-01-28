
import React, { useState } from 'react';
import { Plus, Package, Tag, Scale, X, Edit2, AlertTriangle } from 'lucide-react';
import { Material } from '../types';

interface Props {
  materials: Material[];
  onAdd: (material: Material) => void;
  onUpdate: (material: Material) => void;
  initialCategories: string[];
  initialUnits: string[];
}

const Materials: React.FC<Props> = ({ materials, onAdd, onUpdate, initialCategories, initialUnits }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: initialUnits[0] || 'كيس',
    category: initialCategories[0] || 'بناء',
    minQuantity: 0,
    newUnit: '',
    newCategory: '',
    showNewUnit: false,
    showNewCategory: false
  });

  const handleOpenEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      ...formData,
      name: m.name,
      sku: m.sku,
      unit: m.unit,
      category: m.category,
      minQuantity: m.minQuantity || 0
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;
    
    const finalUnit = formData.showNewUnit ? formData.newUnit : formData.unit;
    const finalCategory = formData.showNewCategory ? formData.newCategory : formData.category;

    if (!finalUnit || !finalCategory) {
      alert("يرجى التأكد من اختيار أو إضافة وحدة و تصنيف");
      return;
    }

    const materialData = {
      id: editingMaterial ? editingMaterial.id : Date.now().toString(),
      name: formData.name,
      sku: formData.sku,
      unit: finalUnit,
      category: finalCategory,
      minQuantity: Number(formData.minQuantity) || 0
    };

    if (editingMaterial) {
      onUpdate(materialData);
    } else {
      onAdd(materialData);
    }

    setShowModal(false);
    setEditingMaterial(null);
    setFormData({ 
      name: '', 
      sku: '', 
      unit: initialUnits[0] || 'كيس', 
      category: initialCategories[0] || 'بناء',
      minQuantity: 0,
      newUnit: '',
      newCategory: '',
      showNewUnit: false,
      showNewCategory: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">قائمة المواد</h2>
          <p className="text-gray-500 text-sm">إدارة وتعريف المواد المتاحة والحد الأدنى للطلب</p>
        </div>
        <button 
          onClick={() => { setEditingMaterial(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          إضافة مادة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(m => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Package size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Edit2 size={16} />
                </button>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                  {m.sku}
                </span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{m.name}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Tag size={16} />
                <span>{m.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Scale size={16} />
                <span>{m.unit}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <AlertTriangle size={16} />
                <span>أقل كمية: {m.minQuantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{editingMaterial ? 'تعديل مادة' : 'إضافة مادة جديدة'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">اسم المادة</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">الرمز (SKU)</label>
                <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">أقل كمية مسموحة (Min Qty)</label>
                <input type="number" required min="0" value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})} className="w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">وحدة القياس</label>
                {!formData.showNewUnit ? (
                  <select value={formData.unit} onChange={e => e.target.value === 'ADD_NEW' ? setFormData({...formData, showNewUnit: true}) : setFormData({...formData, unit: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                    {initialUnits.map(u => <option key={u} value={u}>{u}</option>)}
                    <option value="ADD_NEW">+ إضافة وحدة جديدة...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="الوحدة الجديدة" value={formData.newUnit} onChange={e => setFormData({...formData, newUnit: e.target.value})} className="flex-1 bg-gray-50 border border-blue-200 rounded-lg px-4 py-2" />
                    <button type="button" onClick={() => setFormData({...formData, showNewUnit: false})} className="p-2 text-red-500"><X size={20} /></button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">التصنيف</label>
                {!formData.showNewCategory ? (
                  <select value={formData.category} onChange={e => e.target.value === 'ADD_NEW' ? setFormData({...formData, showNewCategory: true}) : setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                    {initialCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="ADD_NEW">+ إضافة تصنيف جديد...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="التصنيف الجديد" value={formData.newCategory} onChange={e => setFormData({...formData, newCategory: e.target.value})} className="flex-1 bg-gray-50 border border-blue-200 rounded-lg px-4 py-2" />
                    <button type="button" onClick={() => setFormData({...formData, showNewCategory: false})} className="p-2 text-red-500"><X size={20} /></button>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg mt-4">
                {editingMaterial ? 'تحديث البيانات' : 'تأكيد الإضافة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
