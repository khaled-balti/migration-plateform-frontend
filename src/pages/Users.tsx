import { useState, useMemo, useRef, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { UserCircle2, Plus, Edit2, Trash2, X, ShieldAlert, Lock } from "lucide-react";
import { useAuth } from "../providers/AuthContext";

interface User {
  id: string | number;
  name: string;
  email: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = ["users", "credentials", "repositories", "pipelines"];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const hasUserPermission = currentUser?.permissions.includes("users");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<{ name: string; email: string; permissions: string[] }>({ name: "", email: "", permissions: [] });
  const [permSearch, setPermSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openAddModal = () => {
    if (!hasUserPermission) return;
    setEditingUser(null);
    setFormData({ name: "", email: "", permissions: [] });
    setPermSearch("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    if (!hasUserPermission) return;
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, permissions: [...user.permissions] });
    setPermSearch("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!hasUserPermission) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`/api/users/${id}/delete/`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete user');
        }
        setUsers(users.filter((u) => u.id !== id));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const url = editingUser 
        ? `/api/users/${editingUser.id}/update/` 
        : '/api/users/create/';
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data.user } : u));
        alert("User updated successfully");
      } else {
        setUsers([...users, data.user]);
        alert("User created successfully. An email with the password has been sent.");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPermission = (perm: string) => {
    if (!formData.permissions.includes(perm)) {
      setFormData(prev => ({ ...prev, permissions: [...prev.permissions, perm] }));
    }
    setPermSearch("");
    setShowDropdown(false);
  };

  const removePermission = (perm: string) => {
    setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }));
  };

  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(p => 
    p.toLowerCase().includes(permSearch.toLowerCase()) && !formData.permissions.includes(p)
  );

  const columns = useMemo<Column<User>[]>(() => {
    const baseCols: Column<User>[] = [
      { header: "User", accessorKey: "name", cell: (row) => (
        <div className="flex items-center gap-3">
          <UserCircle2 className="w-8 h-8 text-indigo-300" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.name}</span>
        </div>
      )},
      { header: "Email", accessorKey: "email", cell: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{row.email}</span>
      )},
      { header: "Permissions", accessorKey: "permissions", cell: (row) => (
        <div className="flex flex-wrap gap-1.5 min-w-[200px]">
          {row.permissions.map((perm) => (
            <span key={perm} className="text-[11px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
              {perm}
            </span>
          ))}
          {row.permissions.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">No permissions</span>
          )}
        </div>
      )}
    ];

    if (hasUserPermission) {
      baseCols.push({
        header: "Actions",
        accessorKey: "id",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => openEditModal(row)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
              title="Edit User"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(row.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      });
    }

    return baseCols;
  }, [hasUserPermission, users]);

  if (!hasUserPermission && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          You don't have the "users" permission required to manage team members. Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
            Users Management
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Create, manage team members, and configure platform access levels.
          </p>
        </div>
        
        {hasUserPermission && (
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
        )}
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5" />
          <p className="font-medium">{error}</p>
          <button onClick={fetchUsers} className="ml-auto underline font-bold">Retry</button>
        </div>
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={users} 
            enableSelection 
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                {editingUser ? "Update User" : "Create New User"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2 relative" ref={autocompleteRef}>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Permissions</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 min-h-[52px] items-center">
                  {formData.permissions.map(p => (
                    <span key={p} className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      {p}
                      <button 
                        type="button" 
                        onClick={() => removePermission(p)}
                        className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    value={permSearch}
                    onChange={e => { setPermSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    className="flex-1 min-w-[100px] outline-none text-sm bg-transparent placeholder:text-slate-400 text-slate-900 dark:text-white ml-2"
                    placeholder="Search permissions..."
                  />
                </div>
                
                {showDropdown && filteredPermissions.length > 0 && (
                  <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl max-h-48 overflow-y-auto ring-1 ring-black/5">
                    {filteredPermissions.map(p => (
                      <div 
                        key={p} 
                        onClick={() => addPermission(p)}
                        className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between group"
                      >
                        <span>{p}</span>
                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    editingUser ? "Save Changes" : "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
