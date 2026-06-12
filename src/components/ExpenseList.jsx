import React, { useState } from "react";
import { Trash2, Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter, Calendar } from "lucide-react";
import { CATEGORY_COLORS, CATEGORIES } from "../utils/initialData";

export default function ExpenseList({ expenses, onDeleteExpense }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || exp.category === selectedCategory;
    
    // Date checks
    let matchesStartDate = true;
    if (startDate) {
      matchesStartDate = new Date(exp.date) >= new Date(startDate);
    }
    let matchesEndDate = true;
    if (endDate) {
      matchesEndDate = new Date(exp.date) <= new Date(endDate);
    }

    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "amount") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    } else if (sortField === "date") {
      return sortOrder === "asc" 
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    } else {
      // String compare (description/category)
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
  });

  // Paginated expenses
  const totalItems = sortedExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + itemsPerPage);

  const totalFilteredSpent = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="glass-card" style={{ marginTop: "24px" }}>
      {/* Header and Filter Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "4px", fontWeight: "600", color: "var(--text-primary)" }}>
            Expense Transactions
          </h3>
          <p className="form-label" style={{ fontSize: "12px", marginBottom: 0 }}>
            Showing {filteredExpenses.length} of {expenses.length} records. Filtered total: <span style={{ color: "var(--color-indigo)", fontWeight: "600" }}>₹{totalFilteredSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
        <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* Filter Controls Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ position: "relative" }}>
          <Filter size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <select
            className="form-input"
            style={{ paddingLeft: "36px", appearance: "none" }}
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div style={{ position: "relative" }}>
          <Calendar size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="date"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* End Date */}
        <div style={{ position: "relative" }}>
          <Calendar size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="date"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {paginatedExpenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            No expenses found matching the criteria.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("date")}>
                  Date {sortField === "date" && <ArrowUpDown size={12} style={{ marginLeft: "4px", display: "inline-block" }} />}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("description")}>
                  Description {sortField === "description" && <ArrowUpDown size={12} style={{ marginLeft: "4px", display: "inline-block" }} />}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("category")}>
                  Category {sortField === "category" && <ArrowUpDown size={12} style={{ marginLeft: "4px", display: "inline-block" }} />}
                </th>
                <th style={{ cursor: "pointer", textAlign: "right" }} onClick={() => handleSort("amount")}>
                  Amount {sortField === "amount" && <ArrowUpDown size={12} style={{ marginLeft: "4px", display: "inline-block" }} />}
                </th>
                <th style={{ textAlign: "center", width: "80px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(exp.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </td>
                  <td style={{ fontWeight: "500" }}>{exp.description}</td>
                  <td>
                    <span className={`badge bg-gradient-to-r ${CATEGORY_COLORS[exp.category] || "from-slate-400 to-slate-500"}`} style={{ 
                      background: `linear-gradient(135deg, ${CATEGORY_COLORS[exp.category] ? "var(--color-" + exp.category.toLowerCase() + ")" : "var(--text-muted)"}, rgba(0,0,0,0.3))`
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "600", color: "var(--text-primary)" }}>
                    ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "6px" }}
                      onClick={() => onDeleteExpense(exp.id)}
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 12px" }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 12px" }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
