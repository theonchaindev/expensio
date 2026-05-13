"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", department: "", jobTitle: "" });

  async function load() {
    const res = await fetch("/api/admin/employees");
    setEmployees(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function createEmployee(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setForm({ name: "", email: "", password: "", role: "EMPLOYEE", department: "", jobTitle: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    await load();
  }

  async function changeRole(id: string, role: string) {
    await fetch(`/api/admin/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">{employees.filter((e) => e.isActive).length} active</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={createEmployee} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-white">New Employee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Full Name", type: "text", required: true },
              { key: "email", label: "Email", type: "email", required: true },
              { key: "password", label: "Password", type: "password", required: true },
              { key: "jobTitle", label: "Job Title", type: "text" },
              { key: "department", label: "Department", type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}{f.required ? " *" : ""}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => set(f.key, e.target.value)}
                  required={f.required}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white text-sm font-medium rounded-lg px-5 py-2 hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Creating…" : "Create Employee"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-sm hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Employee list */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-700/50">
          {employees.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No employees yet</p>
            </div>
          ) : (
            employees.map((emp) => (
              <div key={emp.id} className={`px-5 py-4 ${!emp.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{emp.name}</p>
                      <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                      {(emp.jobTitle || emp.department) && (
                        <p className="text-xs text-slate-500">{[emp.jobTitle, emp.department].filter(Boolean).join(" · ")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <select
                      value={emp.role}
                      onChange={(e) => changeRole(emp.id, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                    <button
                      onClick={() => toggleActive(emp.id, emp.isActive)}
                      className={emp.isActive ? "text-green-400 hover:text-red-400" : "text-slate-600 hover:text-green-400"}
                    >
                      {emp.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
