import React, { createContext, useContext, useState, useEffect } from "react";
import { dbService } from "../services/dbService";
import { useAuth } from "./AuthContext";

const ExpenseContext = createContext();

export function useExpenses() {
  return useContext(ExpenseContext);
}

export const DEFAULT_CATEGORIES = [
  "PG Rent",
  "Food",
  "Tea/Coffee",
  "Snacks",
  "Groceries",
  "Travel",
  "Petrol",
  "Mobile Recharge",
  "Internet",
  "Electricity Bill",
  "Shopping",
  "Entertainment",
  "Medical",
  "Education",
  "Others"
];

export function ExpenseProvider({ children }) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all user data when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setIncomes([]);
      setMonthlyBudget(0);
      setCustomCategories([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedExpenses, fetchedIncomes, fetchedBudget, fetchedCustomCats] = await Promise.all([
          dbService.getExpenses(currentUser.uid),
          dbService.getIncomes(currentUser.uid),
          dbService.getBudget(currentUser.uid),
          dbService.getCustomCategories(currentUser.uid)
        ]);

        setExpenses(fetchedExpenses);
        setIncomes(fetchedIncomes);
        setMonthlyBudget(fetchedBudget);
        setCustomCategories(fetchedCustomCats);
      } catch (err) {
        console.error("Error fetching user expense data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // --- Expenses CRUD ---
  const addExpense = async (expenseData) => {
    if (!currentUser) throw new Error("User not authenticated.");
    const newExp = await dbService.addExpense(currentUser.uid, expenseData);
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  };

  const updateExpense = async (expenseId, expenseData) => {
    if (!currentUser) throw new Error("User not authenticated.");
    await dbService.updateExpense(currentUser.uid, expenseId, expenseData);
    setExpenses(prev => 
      prev.map(exp => exp.id === expenseId ? { ...exp, ...expenseData, amount: parseFloat(expenseData.amount) } : exp)
    );
  };

  const deleteExpense = async (expenseId) => {
    if (!currentUser) throw new Error("User not authenticated.");
    await dbService.deleteExpense(currentUser.uid, expenseId);
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  // --- Incomes CRUD ---
  const addIncome = async (incomeData) => {
    if (!currentUser) throw new Error("User not authenticated.");
    const newInc = await dbService.addIncome(currentUser.uid, incomeData);
    setIncomes(prev => [newInc, ...prev]);
    return newInc;
  };

  const deleteIncome = async (incomeId) => {
    if (!currentUser) throw new Error("User not authenticated.");
    await dbService.deleteIncome(currentUser.uid, incomeId);
    setIncomes(prev => prev.filter(inc => inc.id !== incomeId));
  };

  // --- Budget CRUD ---
  const updateBudget = async (amount) => {
    if (!currentUser) throw new Error("User not authenticated.");
    const updatedAmount = await dbService.setBudget(currentUser.uid, amount);
    setMonthlyBudget(updatedAmount);
    return updatedAmount;
  };

  // --- Custom Categories ---
  const addCustomCategory = async (categoryName) => {
    if (!currentUser) throw new Error("User not authenticated.");
    const name = await dbService.addCustomCategory(currentUser.uid, categoryName);
    setCustomCategories(prev => [...prev, name]);
    return name;
  };

  const deleteCustomCategory = async (categoryName) => {
    if (!currentUser) throw new Error("User not authenticated.");
    await dbService.deleteCustomCategory(currentUser.uid, categoryName);
    setCustomCategories(prev => prev.filter(cat => cat !== categoryName));
  };

  // All categories combined (defaults + customs)
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  // Helper date matching functions
  const getYearMonthKey = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // e.g. "2026-07"
  };

  const currentMonthKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  // --- METRIC COMPUTATIONS ---
  
  // Total Income (Overall)
  const totalOverallIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  // Total Expenses (Overall)
  const totalOverallExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Current Balance (Total Income - Total Expenses)
  const currentBalance = totalOverallIncome - totalOverallExpenses;

  // Monthly breakdown computations
  const getMonthlyStats = (monthKey = currentMonthKey) => {
    const monthIncomes = incomes.filter(inc => getYearMonthKey(inc.date) === monthKey);
    const monthExpenses = expenses.filter(exp => getYearMonthKey(exp.date) === monthKey);

    const totalIncome = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBalance = totalIncome - totalExpenses;
    const savings = totalIncome - totalExpenses; // Or overall savings: we display overall savings separately

    // Find highest expense category for this month
    const categoryTotals = {};
    monthExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    let highestExpenseCategory = "N/A";
    let highestAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > highestAmount) {
        highestAmount = val;
        highestExpenseCategory = cat;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      remainingBalance,
      highestExpenseCategory,
      totalCount: monthExpenses.length,
      highestAmount
    };
  };

  const currentMonthStats = getMonthlyStats(currentMonthKey);

  const value = {
    expenses,
    incomes,
    monthlyBudget,
    customCategories,
    allCategories,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    updateBudget,
    addCustomCategory,
    deleteCustomCategory,
    
    // Computed Values
    currentBalance,
    totalOverallIncome,
    totalOverallExpenses,
    totalSavings: currentBalance, // Savings = Income - Expenses overall
    
    currentMonthIncome: currentMonthStats.totalIncome,
    currentMonthExpenses: currentMonthStats.totalExpenses,
    currentMonthRemainingBalance: currentMonthStats.remainingBalance,
    currentMonthHighestCategory: currentMonthStats.highestExpenseCategory,
    currentMonthExpenseCount: currentMonthStats.totalCount,
    
    getMonthlyStats,
    getYearMonthKey
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}
