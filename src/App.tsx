import React from 'react';
import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Settings, LogOut, Calendar, DollarSign, Moon, Sun, Edit3 } from 'lucide-react';
import { DonationData, Expense } from './types';
import { loadDonationsFromFile, saveDonationsToFile, loadExpensesFromFile, saveExpensesToFile } from './utils/fileManager';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [showYears, setShowYears] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showExpenses, setShowExpenses] = useState(false);
  const [donations, setDonations] = useState<DonationData>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddForm, setShowAddForm] = useState<{month: string} | null>(null);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorAmount, setNewDonorAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const months = [
   'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadDonationsFromFile();
        const expensesData = await loadExpensesFromFile();
        setDonations(data);
        setExpenses(expensesData);
        // Don't auto-show years anymore, start at main page
        
        // Check if user is already logged in as admin
        const adminStatus = localStorage.getItem('isAdmin');
        setIsAdmin(adminStatus === 'true');
        
        // Check dark mode preference
        const darkMode = localStorage.getItem('darkMode');
        setIsDarkMode(darkMode === 'true');
      } catch (error) {
        console.error('Failed to load donations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleAdminLogin = (success: boolean) => {
    setIsAdmin(success);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  };

  const handleUpdateDonations = async (updatedDonations: DonationData) => {
    try {
      await saveDonationsToFile(updatedDonations);
      setDonations(updatedDonations);
    } catch (error) {
      console.error('Failed to save donations:', error);
      alert('Failed to save donations. Please try again.');
    }
  };

  const handleUpdateExpenses = async (updatedExpenses: Expense[]) => {
    try {
      await saveExpensesToFile(updatedExpenses);
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Failed to save expenses:', error);
      alert('Failed to save expenses. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleRedButtonClick = () => {
    setShowExpenses(true);
  };

  // Get available years from the donations data
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    Object.keys(donations).forEach(key => {
      const year = parseInt(key.split('-')[0]);
      if (!isNaN(year)) {
        yearsSet.add(year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
  };

  const handleAddDonation = async (month: string) => {
    if (newDonorName.trim() && newDonorAmount.trim() && selectedYear) {
      const monthKey = `${selectedYear}-${month}`;
      const amount = parseFloat(newDonorAmount);
      
      if (!isNaN(amount) && amount > 0) {
        setIsSaving(true);
        
        const updatedDonations = {
          ...donations,
          [monthKey]: [...(donations[monthKey] || []), { name: newDonorName.trim(), amount }]
        };
        
        try {
          await saveDonationsToFile(updatedDonations);
          setDonations(updatedDonations);
          setNewDonorName('');
          setNewDonorAmount('');
          setShowAddForm(null);
        } catch (error) {
          console.error('Failed to save donation:', error);
          alert('Failed to save donation. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleAddExpense = async () => {
    if (newExpenseDate.trim() && newExpenseAmount.trim() && newExpenseDescription.trim()) {
      const amount = parseFloat(newExpenseAmount);
      
      if (!isNaN(amount) && amount > 0) {
        setIsSaving(true);
        
        const newExpense: Expense = {
          date: newExpenseDate,
          amount,
          description: newExpenseDescription.trim()
        };
        
        const updatedExpenses = [...expenses, newExpense].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        try {
          await saveExpensesToFile(updatedExpenses);
          setExpenses(updatedExpenses);
          setNewExpenseDate('');
          setNewExpenseAmount('');
          setNewExpenseDescription('');
          setShowAddExpenseForm(false);
        } catch (error) {
          console.error('Failed to save expense:', error);
          alert('Failed to save expense. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleAddDonationOld = (month: string) => {
    if (newDonorName.trim() && newDonorAmount.trim() && selectedYear) {
      const monthKey = `${selectedYear}-${month}`;
      const amount = parseFloat(newDonorAmount);
      
      if (!isNaN(amount) && amount > 0) {
        setDonations(prev => {
          const updated = {
          ...prev,
          [monthKey]: [...(prev[monthKey] || []), { name: newDonorName.trim(), amount }]
          };
          
          // Save to localStorage immediately
          localStorage.setItem('donations', JSON.stringify(updated, null, 2));
          return updated;
        });
        setNewDonorName('');
        setNewDonorAmount('');
        setShowAddForm(null);
      }
    }
  };

  const getYearTotal = (year: number) => {
    let total = 0;
    months.forEach(month => {
      const monthKey = `${year}-${month}`;
      const monthDonations = donations[monthKey] || [];
      total += monthDonations.reduce((sum, donation) => sum + donation.amount, 0);
    });
    return total;
  };

  const getAllYearsTotal = () => {
    const years = getAvailableYears();
    return years.reduce((total, year) => total + getYearTotal(year), 0);
  };

  const getNetAmount = () => {
    return getAllYearsTotal() - getTotalExpenses();
  };

  const availableYears = getAvailableYears();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'} flex items-center justify-center p-6 transition-colors duration-300`}>
      {/* Admin Login Modal */}
      <AdminLogin 
        onLogin={handleAdminLogin}
        isVisible={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          donations={donations}
          expenses={expenses}
          onUpdateDonations={handleUpdateDonations}
          onUpdateExpenses={handleUpdateExpenses}
          onClose={() => setShowAdminPanel(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Admin Controls */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} px-3 py-2 rounded-lg shadow-lg transition-colors duration-200`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        {/* Admin Button */}
        <div>
          {isAdmin ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                تعديل
              </button>
              <button
                onClick={handleAdminLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminLogin(true)}
              className={`${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-slate-700'} text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200`}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl w-full">
        {!showYears && selectedYear === null && !showExpenses ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className={`text-5xl md:text-6xl font-light ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4 tracking-tight`}>
                آيت أحمدأُعمر
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} font-light max-w-2xl mx-auto leading-relaxed`}>
                عَنْ أَبِي هُرَيْرَةَ رضي الله تعالى عنه: أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ:( إِذَا مَاتَ ابنُ آدم انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أو عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ). رَوَاهُ مُسْلِمٌ
              </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              {/* Left Button - Red */}
              <button 
                onClick={handleRedButtonClick}
                className={`group relative ${isDarkMode ? 'bg-slate-800 hover:bg-red-900 border-2 border-red-800 hover:border-red-700' : 'bg-white hover:bg-red-50 border-2 border-red-100 hover:border-red-200'} rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-[240px] h-[180px] flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-red-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                    ${getTotalExpenses().toLocaleString()}
                  </div>
                </div>
                <div className="absolute inset-0 bg-red-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </button>

              {/* Right Button - Green with Total */}
              <button 
                onClick={() => availableYears.length > 0 && setShowYears(true)}
                disabled={availableYears.length === 0}
                className={`group relative ${availableYears.length > 0 ? (isDarkMode ? 'bg-slate-800 hover:bg-green-900 border-2 border-green-800 hover:border-green-700' : 'bg-white hover:bg-green-50 border-2 border-green-100 hover:border-green-200') : (isDarkMode ? 'bg-slate-700 border-2 border-slate-600 cursor-not-allowed' : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed')} rounded-2xl p-8 md:p-12 shadow-lg ${availableYears.length > 0 ? 'hover:shadow-xl' : ''} transition-all duration-300 ${availableYears.length > 0 ? 'transform hover:-translate-y-1' : ''} w-[240px] h-[180px] flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className={`text-4xl md:text-5xl font-bold ${availableYears.length > 0 ? 'text-green-500' : 'text-gray-400'} mb-4 ${availableYears.length > 0 ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                    ${getNetAmount().toLocaleString()}
                  </div>
                </div>
                {availableYears.length > 0 && (
                  <div className="absolute inset-0 bg-green-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </>
        ) : showYears && selectedYear === null && !showExpenses ? (
          <>
            {/* Years Section */}
            <div className="text-center mb-16">
              <h1 className={`text-4xl md:text-5xl font-light ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4 tracking-tight`}>
              </h1>
              <button 
                onClick={() => setShowYears(false)}
                className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors duration-200 text-sm font-medium flex items-center gap-1 mx-auto`}
              >
                <ArrowLeft className="w-4 h-4" />
                العودة إلى الصفحة الرئيسية
              </button>
            </div>

            {/* Year Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center">
              {availableYears.map((year) => (
                <button 
                  key={year}
                  onClick={() => handleYearClick(year)}
                  className={`group relative ${isDarkMode ? 'bg-slate-800 hover:bg-green-900 border-2 border-green-800 hover:border-green-700' : 'bg-white hover:bg-green-50 border-2 border-green-100 hover:border-green-200'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="text-center">
                    <div className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                      {year}
                    </div>
                    <div className="text-lg font-semibold text-green-500 group-hover:scale-110 transition-transform duration-300">
                      ${getYearTotal(year).toLocaleString()}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-green-500 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </>
        ) : selectedYear && !showExpenses ? (
          <>
            {/* Donations Table Section */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl md:text-4xl font-light ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2 tracking-tight`}>
                 {selectedYear}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setSelectedYear(null)}
                  className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors duration-200 text-sm font-medium flex items-center gap-1 mx-auto`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  العودة إلى السنوات
                </button>
              </div>
            </div>

            {/* Donations Table */}
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDarkMode ? 'bg-slate-700 border-b border-slate-600' : 'bg-slate-50 border-b border-slate-200'}`}>
                    <tr>
                      {months.map(month => (
                        <th key={month} className={`px-4 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} min-w-[140px]`}>
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      {months.map(month => {
                        const monthKey = `${selectedYear}-${month}`;
                        const monthDonations = donations[monthKey] || [];
                        
                        return (
                          <td key={month} className={`px-4 py-4 ${isDarkMode ? 'border-r border-slate-700' : 'border-r border-slate-100'} last:border-r-0`}>
                            <div className="space-y-2">
                              {monthDonations.map((donation, index) => (
                                <div key={index} className={`${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-200'} rounded-lg p-3`}>
                                  <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-1`}>
                                    {donation.name}
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    ${donation.amount}
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add Button */}
                              {isAdmin && showAddForm?.month === month ? (
                                <div className={`${isDarkMode ? 'bg-blue-900 border-2 border-blue-700' : 'bg-blue-50 border-2 border-blue-200'} rounded-lg p-3`}>
                                  <input
                                    type="text"
                                    placeholder="إسم المتبرع"
                                    value={newDonorName}
                                    onChange={(e) => setNewDonorName(e.target.value)}
                                    className={`w-full text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'} rounded px-2 py-1 mb-2 focus:outline-none focus:border-blue-500`}
                                  />
                                  <input
                                    type="number"
                                    placeholder="المبلغ"
                                    value={newDonorAmount}
                                    onChange={(e) => setNewDonorAmount(e.target.value)}
                                    className={`w-full text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'} rounded px-2 py-1 mb-2 focus:outline-none focus:border-blue-500`}
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleAddDonation(month)}
                                      disabled={isSaving}
                                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs py-1 px-2 rounded transition-colors duration-200"
                                    >
                                      {isSaving ? 'حفض...' : 'إضافة'}
                                    </button>
                                    <button
                                      onClick={() => setShowAddForm(null)}
                                      disabled={isSaving}
                                      className={`flex-1 ${isDarkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-400 hover:bg-slate-500'} text-white text-xs py-1 px-2 rounded transition-colors duration-200`}
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : isAdmin ? (
                                <button
                                  onClick={() => setShowAddForm({month})}
                                  className={`w-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-2 border-dashed border-slate-600 hover:border-slate-500' : 'bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 hover:border-slate-400'} rounded-lg p-3 transition-all duration-200 group`}
                                >
                                  <Plus className={`w-5 h-5 ${isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'} mx-auto`} />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : showExpenses ? (
          <>
            {/* Expenses Table Section */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl md:text-4xl font-light ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2 tracking-tight`}>
                النفقات
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                <button 
                  onClick={() => setShowExpenses(false)}
                  className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors duration-200 text-sm font-medium flex items-center gap-1 mx-auto`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  العودة إلى الصفحة الرئيسية
                </button>
              </div>
              <div className="text-2xl font-bold text-red-500 mb-6">
                إجمالي النفقات: ${getTotalExpenses().toLocaleString()}
              </div>
            </div>

            {/* Add Expense Button */}
            {isAdmin && !showAddExpenseForm && (
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowAddExpenseForm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  إضافة نفقة
                </button>
              </div>
            )}

            {/* Add Expense Form */}
            {isAdmin && showAddExpenseForm && (
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4`}>إضافة نفقة جديدة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>تاريخ</label>
                    <input
                      type="date"
                      value={newExpenseDate}
                      onChange={(e) => setNewExpenseDate(e.target.value)}
                      className={`w-full px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>المبلغ</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className={`w-full px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>تفاصيل</label>
                    <input
                      type="text"
                      placeholder="ما هي هذه النفقات؟"
                      value={newExpenseDescription}
                      onChange={(e) => setNewExpenseDescription(e.target.value)}
                      className={`w-full px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowAddExpenseForm(false)}
                    disabled={isSaving}
                    className={`px-4 py-2 border ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'} rounded-lg transition-colors duration-200`}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAddExpense}
                    disabled={isSaving || !newExpenseDate || !newExpenseAmount || !newExpenseDescription}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors duration-200"
                  >
                    {isSaving ? 'حفض...' : 'إضافة نفقة'}
                  </button>
                </div>
              </div>
            )}

            {/* Expenses Table */}
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDarkMode ? 'bg-red-900 border-b border-red-800' : 'bg-red-50 border-b border-red-200'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'} flex items-center gap-2`}>
                        <Calendar className="w-4 h-4" />
                        تاريخ
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          المبلغ
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                        تفاصيل
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={3} className={`px-6 py-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          لم يتم تسجيل أي نفقات حتى الآن
                        </td>
                      </tr>
                    ) : (
                      expenses.map((expense, index) => (
                        <tr key={index} className={`${isDarkMode ? 'border-b border-slate-700 hover:bg-slate-700' : 'border-b border-slate-100 hover:bg-slate-50'} transition-colors duration-200`}>
                          <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {new Date(expense.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-lg font-bold text-red-600">
                            ${expense.amount.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                            {expense.description}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;
