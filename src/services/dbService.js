import { auth, db, useFirebase } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  updateProfile, 
  updatePassword,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";

// --- LOCAL STORAGE DATABASE SIMULATOR (DEMO MODE) ---

// Helper function to simulate network delay for local storage
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Retrieve arrays from localStorage
const getLocalData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Local Auth listeners
let localAuthListeners = [];
let localCurrentUser = JSON.parse(localStorage.getItem("expense_tracker_current_user")) || null;

const notifyLocalAuthListeners = () => {
  localAuthListeners.forEach(callback => callback(localCurrentUser));
};

const localAuth = {
  onAuthStateChanged: (callback) => {
    localAuthListeners.push(callback);
    // Initial call with current user
    callback(localCurrentUser);
    return () => {
      localAuthListeners = localAuthListeners.filter(cb => cb !== callback);
    };
  },
  login: async (email, password) => {
    await delay();
    const users = getLocalData("expense_tracker_users");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    localCurrentUser = { uid: user.uid, email: user.email, displayName: user.displayName };
    localStorage.setItem("expense_tracker_current_user", JSON.stringify(localCurrentUser));
    notifyLocalAuthListeners();
    return localCurrentUser;
  },
  register: async (email, password, displayName) => {
    await delay();
    const users = getLocalData("expense_tracker_users");
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already in use.");
    }
    const newUser = {
      uid: "local_" + Date.now().toString(36),
      email: email.toLowerCase(),
      password: password, // For demo, we store plaintext. In real apps, bcrypt is used.
      displayName: displayName
    };
    users.push(newUser);
    setLocalData("expense_tracker_users", users);
    
    localCurrentUser = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
    localStorage.setItem("expense_tracker_current_user", JSON.stringify(localCurrentUser));
    notifyLocalAuthListeners();
    return localCurrentUser;
  },
  logout: async () => {
    await delay();
    localCurrentUser = null;
    localStorage.removeItem("expense_tracker_current_user");
    notifyLocalAuthListeners();
  },
  resetPassword: async (email) => {
    await delay();
    const users = getLocalData("expense_tracker_users");
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userExists) {
      throw new Error("User with this email does not exist.");
    }
    // Simulate email send
    console.log(`Demo: Password reset email sent to ${email}`);
    return true;
  },
  updateProfileName: async (displayName) => {
    await delay();
    if (!localCurrentUser) throw new Error("No authenticated user.");
    
    // Update users array
    const users = getLocalData("expense_tracker_users");
    const updatedUsers = users.map(u => {
      if (u.uid === localCurrentUser.uid) {
        return { ...u, displayName };
      }
      return u;
    });
    setLocalData("expense_tracker_users", updatedUsers);

    // Update current user
    localCurrentUser = { ...localCurrentUser, displayName };
    localStorage.setItem("expense_tracker_current_user", JSON.stringify(localCurrentUser));
    notifyLocalAuthListeners();
    return localCurrentUser;
  },
  changePassword: async (newPassword) => {
    await delay();
    if (!localCurrentUser) throw new Error("No authenticated user.");
    
    const users = getLocalData("expense_tracker_users");
    const updatedUsers = users.map(u => {
      if (u.uid === localCurrentUser.uid) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setLocalData("expense_tracker_users", updatedUsers);
    return true;
  }
};

const localDb = {
  // Expenses CRUD
  getExpenses: async (userId) => {
    await delay(150);
    const expenses = getLocalData("expense_tracker_expenses");
    return expenses
      .filter(exp => exp.uid === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  addExpense: async (userId, expenseData) => {
    await delay(150);
    const expenses = getLocalData("expense_tracker_expenses");
    const newExpense = {
      id: "exp_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      uid: userId,
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    setLocalData("expense_tracker_expenses", expenses);
    return newExpense;
  },
  updateExpense: async (userId, expenseId, expenseData) => {
    await delay(150);
    const expenses = getLocalData("expense_tracker_expenses");
    const updatedExpenses = expenses.map(exp => {
      if (exp.id === expenseId && exp.uid === userId) {
        return { 
          ...exp, 
          ...expenseData, 
          amount: parseFloat(expenseData.amount) 
        };
      }
      return exp;
    });
    setLocalData("expense_tracker_expenses", updatedExpenses);
    return true;
  },
  deleteExpense: async (userId, expenseId) => {
    await delay(150);
    const expenses = getLocalData("expense_tracker_expenses");
    const filteredExpenses = expenses.filter(exp => !(exp.id === expenseId && exp.uid === userId));
    setLocalData("expense_tracker_expenses", filteredExpenses);
    return true;
  },

  // Income Operations
  getIncomes: async (userId) => {
    await delay(150);
    const incomes = getLocalData("expense_tracker_incomes");
    return incomes
      .filter(inc => inc.uid === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  addIncome: async (userId, incomeData) => {
    await delay(150);
    const incomes = getLocalData("expense_tracker_incomes");
    const newIncome = {
      id: "inc_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      uid: userId,
      ...incomeData,
      amount: parseFloat(incomeData.amount),
      createdAt: new Date().toISOString()
    };
    incomes.push(newIncome);
    setLocalData("expense_tracker_incomes", incomes);
    return newIncome;
  },
  deleteIncome: async (userId, incomeId) => {
    await delay(150);
    const incomes = getLocalData("expense_tracker_incomes");
    const filteredIncomes = incomes.filter(inc => !(inc.id === incomeId && inc.uid === userId));
    setLocalData("expense_tracker_incomes", filteredIncomes);
    return true;
  },

  // Budget Operations
  getBudget: async (userId) => {
    await delay(150);
    const budgets = getLocalData("expense_tracker_budgets");
    const userBudget = budgets.find(b => b.uid === userId);
    return userBudget ? parseFloat(userBudget.amount) : 0;
  },
  setBudget: async (userId, budgetAmount) => {
    await delay(150);
    const budgets = getLocalData("expense_tracker_budgets");
    const existingIndex = budgets.findIndex(b => b.uid === userId);
    const amountVal = parseFloat(budgetAmount);
    
    if (existingIndex > -1) {
      budgets[existingIndex].amount = amountVal;
    } else {
      budgets.push({ uid: userId, amount: amountVal });
    }
    setLocalData("expense_tracker_budgets", budgets);
    return amountVal;
  },

  // Custom Categories
  getCustomCategories: async (userId) => {
    await delay(100);
    const categories = getLocalData("expense_tracker_custom_categories");
    return categories
      .filter(cat => cat.uid === userId)
      .map(cat => cat.name);
  },
  addCustomCategory: async (userId, categoryName) => {
    await delay(100);
    const categories = getLocalData("expense_tracker_custom_categories");
    const normalized = categoryName.trim();
    
    // Check if category already exists (case insensitive)
    const exists = categories.some(cat => cat.uid === userId && cat.name.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      throw new Error("Category already exists.");
    }
    
    const newCategory = {
      id: "cat_" + Date.now().toString(36),
      uid: userId,
      name: normalized
    };
    categories.push(newCategory);
    setLocalData("expense_tracker_custom_categories", categories);
    return normalized;
  },
  deleteCustomCategory: async (userId, categoryName) => {
    await delay(100);
    const categories = getLocalData("expense_tracker_custom_categories");
    const filtered = categories.filter(cat => !(cat.uid === userId && cat.name.toLowerCase() === categoryName.toLowerCase()));
    setLocalData("expense_tracker_custom_categories", filtered);
    return true;
  }
};


// --- FIREBASE IMPLEMENTATION ---

const firebaseAuthService = {
  onAuthStateChanged: (callback) => {
    if (!auth) return () => {};
    return firebaseOnAuthStateChanged(auth, async (user) => {
      if (user) {
        // Resolve display name or details if needed
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split("@")[0]
        });
      } else {
        callback(null);
      }
    });
  },
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0]
    };
  },
  register: async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(user, { displayName });
    
    // Save additional user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email.toLowerCase(),
      displayName: displayName,
      createdAt: new Date().toISOString()
    });

    return {
      uid: user.uid,
      email: user.email,
      displayName: displayName
    };
  },
  logout: async () => {
    await firebaseSignOut(auth);
  },
  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
    return true;
  },
  updateProfileName: async (displayName) => {
    if (!auth.currentUser) throw new Error("No authenticated user.");
    await updateProfile(auth.currentUser, { displayName });
    
    // Update in Firestore as well
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      displayName: displayName
    }, { merge: true });

    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName
    };
  },
  changePassword: async (newPassword) => {
    if (!auth.currentUser) throw new Error("No authenticated user.");
    await updatePassword(auth.currentUser, newPassword);
    return true;
  }
};

const firebaseDbService = {
  getExpenses: async (userId) => {
    const q = query(
      collection(db, "expenses"),
      where("uid", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    const expenses = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return expenses;
  },

  addExpense: async (userId, expenseData) => {
    const data = {
      uid: userId,
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "expenses"), data);
    return { id: docRef.id, ...data };
  },
  updateExpense: async (userId, expenseId, expenseData) => {
    const docRef = doc(db, "expenses", expenseId);
    await updateDoc(docRef, {
      ...expenseData,
      amount: parseFloat(expenseData.amount)
    });
    return true;
  },
  deleteExpense: async (userId, expenseId) => {
    const docRef = doc(db, "expenses", expenseId);
    await deleteDoc(docRef);
    return true;
  },
  getIncomes: async (userId) => {
  const q = query(
    collection(db, "incomes"),
    where("uid", "==", userId)
  );

  const querySnapshot = await getDocs(q);

  const incomes = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return incomes;
},
  addIncome: async (userId, incomeData) => {
    const data = {
      uid: userId,
      ...incomeData,
      amount: parseFloat(incomeData.amount),
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "incomes"), data);
    return { id: docRef.id, ...data };
  },
  deleteIncome: async (userId, incomeId) => {
    const docRef = doc(db, "incomes", incomeId);
    await deleteDoc(docRef);
    return true;
  },
  getBudget: async (userId) => {
    const docRef = doc(db, "budgets", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? parseFloat(docSnap.data().amount) : 0;
  },
  setBudget: async (userId, budgetAmount) => {
    const docRef = doc(db, "budgets", userId);
    const amountVal = parseFloat(budgetAmount);
    await setDoc(docRef, { uid: userId, amount: amountVal }, { merge: true });
    return amountVal;
  },
  getCustomCategories: async (userId) => {
    const q = query(collection(db, "customCategories"), where("uid", "==", userId));
    const querySnapshot = await getDocs(q);
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push(doc.data().name);
    });
    return categories;
  },
  addCustomCategory: async (userId, categoryName) => {
    const normalized = categoryName.trim();
    // Double check existence locally in caller or do query
    const q = query(
      collection(db, "customCategories"), 
      where("uid", "==", userId), 
      where("name", "==", normalized)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("Category already exists.");
    }
    await addDoc(collection(db, "customCategories"), {
      uid: userId,
      name: normalized
    });
    return normalized;
  },
  deleteCustomCategory: async (userId, categoryName) => {
    const q = query(
      collection(db, "customCategories"),
      where("uid", "==", userId),
      where("name", "==", categoryName)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletePromises);
    return true;
  }
};

// Export active implementation based on Firebase initialization status
export const dbService = useFirebase ? firebaseDbService : localDb;
export const authService = useFirebase ? firebaseAuthService : localAuth;
export const isDemoMode = !useFirebase;
