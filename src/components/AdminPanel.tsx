import React, { useState } from 'react';
import { Edit3, Save, X, Trash2, Plus } from 'lucide-react';
import { DonationData, Expense } from '../types';

interface AdminPanelProps {
  donations: DonationData;
  expenses: Expense[];
  onUpdateDonations: (donations: DonationData) => void;
  onUpdateExpenses: (expenses: Expense[]) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  donations,
  expenses,
  onUpdateDonations,
  onUpdateExpenses,
  onClose,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'donations' | 'expenses'>('donations');
  const [editingDonation, setEditingDonation] = useState<{key: string, index: number} | null>(null);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [tempDonationName, setTempDonationName] = useState('');
  const [tempDonationAmount, setTempDonationAmount] = useState('');
  const [tempExpenseDate, setTempExpenseDate] = useState('');
  const [tempExpenseAmount, setTempExpenseAmount] = useState('');
  const [tempExpenseDescription, setTempExpenseDescription] = useState('');

  const handleEditDonation = (key: string, index: number) => {
    const donation = donations[key][index];
    setEditingDonation({key, index});
    setTempDonationName(donation.name);
    setTempDonationAmount(donation.amount.toString());
  };

  const handleSaveDonation = () => {
    if (editingDonation && tempDonationName.trim() && tempDonationAmount.trim()) {
      const amount = parseFloat(tempDonationAmount);
      if (!isNaN(amount) && amount > 0) {
        const updatedDonations = { ...donations };
        updatedDonations[editingDonation.key][editingDonation.index] = {
          name: tempDonationName.trim(),
          amount
        };
        onUpdateDonations(updatedDonations);
        setEditingDonation(null);
      }
    }
  };

  const handleDeleteDonation = (key: string, index: number) => {
    const updatedDonations = { ...donations };
    updatedDonations[key].splice(index, 1);
    if (updatedDonations[key].length === 0) {
      delete updatedDonations[key];
    }
    onUpdateDonations(updatedDonations);
  };

  const handleEditExpense = (index: number) => {
    const expense = expenses[index];
    setEditingExpense(index);
    setTempExpenseDate(expense.date);
    setTempExpenseAmount(expense.amount.toString());
    setTempExpenseDescription(expense.description);
  };

  const handleSaveExpense = () => {
    if (editingExpense !== null && tempExpenseDate.trim() && tempExpenseAmount.trim() && tempExpenseDescription.trim()) {
      const amount = parseFloat(tempExpenseAmount);
      if (!isNaN(amount) && amount > 0) {
        const updatedExpenses = [...expenses];
        updatedExpenses[editingExpense] = {
          date: tempExpenseDate,
          amount,
          description: tempExpenseDescription.trim()
        };
        onUpdateExpenses(updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setEditingExpense(null);
      }
    }
  };

  const handleDeleteExpense = (index: number) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    onUpdateExpenses(updatedExpenses);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-slate-700 border-b border-slate-600' : 'bg-slate-50 border-b border-slate-200'} p-6 flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>لوحة الإدارة</h2>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors duration-200`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`${isDarkMode ? 'bg-slate-700 border-b border-slate-600' : 'bg-slate-100 border-b border-slate-200'} px-6`}>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                activeTab === 'donations'
                  ? (isDarkMode ? 'bg-slate-800 text-white border-b-2 border-green-500' : 'bg-white text-slate-800 border-b-2 border-green-500')
                  : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
              }`}
            >
              التبرعات
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                activeTab === 'expenses'
                  ? (isDarkMode ? 'bg-slate-800 text-white border-b-2 border-red-500' : 'bg-white text-slate-800 border-b-2 border-red-500')
                  : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
              }`}
            >
              النفقات
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'donations' ? (
            <div className="space-y-6">
              {Object.entries(donations).map(([key, monthDonations]) => (
                <div key={key} className={`${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-200'} rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-3`}>
                    {key.replace('-', ' ')}
                  </h3>
                  <div className="space-y-2">
                    {monthDonations.map((donation, index) => (
                      <div key={index} className={`${isDarkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-slate-200'} rounded-lg p-3 flex items-center justify-between`}>
                        {editingDonation?.key === key && editingDonation?.index === index ? (
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="text"
                              value={tempDonationName}
                              onChange={(e) => setTempDonationName(e.target.value)}
                              className={`flex-1 px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded focus:outline-none focus:border-blue-500`}
                              placeholder="إسم المتبرع"
                            />
                            <input
                              type="number"
                              value={tempDonationAmount}
                              onChange={(e) => setTempDonationAmount(e.target.value)}
                              className={`w-24 px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded focus:outline-none focus:border-blue-500`}
                              placeholder="المبلغ"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveDonation}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors duration-200"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingDonation(null)}
                                className={`${isDarkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-400 hover:bg-slate-500'} text-white p-2 rounded transition-colors duration-200`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                {donation.name}
                              </span>
                              <span className="text-green-600 font-bold ml-4">
                                ${donation.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditDonation(key, index)}
                                className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} p-1 transition-colors duration-200`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDonation(key, index)}
                                className="text-red-500 hover:text-red-700 p-1 transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <div key={index} className={`${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-200'} rounded-lg p-4`}>
                  {editingExpense === index ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="date"
                          value={tempExpenseDate}
                          onChange={(e) => setTempExpenseDate(e.target.value)}
                          className={`px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'} rounded focus:outline-none focus:border-blue-500`}
                        />
                        <input
                          type="number"
                          value={tempExpenseAmount}
                          onChange={(e) => setTempExpenseAmount(e.target.value)}
                          className={`px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'} rounded focus:outline-none focus:border-blue-500`}
                          placeholder="المبلغ"
                        />
                        <input
                          type="text"
                          value={tempExpenseDescription}
                          onChange={(e) => setTempExpenseDescription(e.target.value)}
                          className={`px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'} rounded focus:outline-none focus:border-blue-500`}
                          placeholder="Description"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveExpense}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          حفظ
                        </button>
                        <button
                          onClick={() => setEditingExpense(null)}
                          className={`${isDarkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-400 hover:bg-slate-500'} text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2`}
                        >
                          <X className="w-4 h-4" />
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {new Date(expense.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            ${expense.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {expense.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditExpense(index)}
                          className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} p-2 transition-colors duration-200`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(index)}
                          className="text-red-500 hover:text-red-700 p-2 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
