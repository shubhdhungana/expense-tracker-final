import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  // State variables
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [editId, setEditId] = useState(null);

  const categories = ['groceries', 'bills', 'entertainment', 'transport'];
  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Validate form inputs
  const validateInputs = () => {
    if (!name) {
      toast.error('Expense name is required.');
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error('Amount must be a valid number greater than zero.');
      return false;
    }
    if (!category) {
      toast.error('Category is required.');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return; // Validation check

    const expenseData = { name, amount, category };

    try {
      if (editId) {
        // Update existing expense
        const response = await fetch(`http://localhost:5001/expenses/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        });
        if (!response.ok) throw new Error('Failed to update expense.');
      } else {
        // Add new expense
        const response = await fetch('http://localhost:5001/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        });
        if (!response.ok) throw new Error('Failed to add expense.');
      }

      // Refresh expenses
      const res = await fetch('http://localhost:5001/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses.');
      const data = await res.json();
      setExpenses(data);

      // Clear form
      setName('');
      setAmount('');
      setCategory('');
      setEditId(null);
    } catch (error) {
      toast.error(error.message); // Display error message
    }
  };

  // Handle edit
  const handleEdit = (expense) => {
    setName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category);
    setEditId(expense.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/expenses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete expense.');
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      toast.error(error.message); // Display error message
    }
  };

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Fetch initial expenses
  useEffect(() => {
    fetch('http://localhost:5001/expenses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch expenses.');
        return res.json();
      })
      .then(data => setExpenses(data))
      .catch(error => toast.error(error.message)); // Handle fetch error
  }, []);

  return (
    <div className="app-container">
      <h1>Expense Tracker </h1>

      <div className="form-section">
        <h2>{editId ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Expense Name"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            min="0"
            step="0.01"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button type="submit">{editId ? 'Update' : 'Add Expense'}</button>
          <div>
            <br></br>
            
            <p>Note: Api- http://localhost:5001/expenses</p>
            <p> </p>
            <p>Created By: Shubham Dhungana</p>
          </div>
        </form>
      </div>

      <div className="expenses-section">
        <h2>Expenses</h2>
        <p>Total Spent: ${total.toFixed(2)}</p>
        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.name}</td>
                  <td>${parseFloat(expense.amount).toFixed(2)}</td>
                  <td>{expense.category}</td>
                  <td>
                    <button onClick={() => handleEdit(expense)}>Edit</button>
                    <button onClick={() => handleDelete(expense.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody> 
          </table>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;