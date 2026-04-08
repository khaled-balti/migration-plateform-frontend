import { useState, useMemo, useRef, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { UserCircle2, Plus, Edit2, Trash2, X, ShieldAlert } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
}

const initialDummyUsers: User[] = [
  { id: "1", name: "Sarah Jenkins", email: "sarah.j@company.com", permissions: ["user", "Write", "Execute"] },
  { id: "2", name: "Mike Ross", email: "m.ross@company.com", permissions: ["Read", "Deploy"] },
  { id: "3", name: "David Kim", email: "david.k@company.com", permissions: ["Read", "user", "Configure"] },
];

const LOGGED_IN_USER_PERMISSIONS = ["user"];
const AVAILABLE_PERMISSIONS = ["user", "Admin", "Read", "Write", "Execute", "Deploy", "Configure", "Manage Roles", "View Reports"];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialDummyUsers);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<{ name: string; email: string; permissions: string[] }>({ name: "", email: "", permissions: [] });
  const [permSearch, setPermSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const hasUserPermission = LOGGED_IN_USER_PERMISSIONS.includes("user");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timer);
    };
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", permissions: [] });
    setPermSearch("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, permissions: [...user.permissions] });
    setPermSearch("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: formData.name, email: formData.email, permissions: formData.permissions } : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        permissions: formData.permissions
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
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
          <span className="text-sm text-slate-600 dark:text-slate-400">{row.name}</span>
        </div>
      )},
      { header: "Email", accessorKey: "email", cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{row.email}</span>
      )},
      { header: "Permissions", accessorKey: "permissions", cell: (row) => (
        <div className="flex flex-wrap gap-1.5 min-w-[200px]">
          {row.permissions.map((perm) => (
            <span key={perm} className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
              {perm}
            </span>
          ))}
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
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit User"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(row.id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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

  return (
    <div className="p-8 max-w-7xl mx-auto w-full relative">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
            Users Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage team members and platform access.
          </p>
        </div>
        
        {hasUserPermission && (
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable 
          columns={columns} 
          data={users} 
          enableSelection 
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="e.g. jane@company.com"
                />
              </div>

              <div className="space-y-1.5 relative" ref={autocompleteRef}>
                <label className="text-sm font-medium text-slate-700">Permissions</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 min-h-[46px] items-center">
                  {formData.permissions.map(p => (
                    <span key={p} className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
                      {p}
                      <button 
                        type="button" 
                        onClick={() => removePermission(p)}
                        className="hover:bg-indigo-200/50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3 text-indigo-500" />
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    value={permSearch}
                    onChange={e => { setPermSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    className="flex-1 outline-none text-sm bg-transparent min-w-[120px] placeholder:text-slate-400 ml-1"
                    placeholder="Type to search..."
                  />
                </div>
                
                {showDropdown && filteredPermissions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-xl max-h-48 overflow-y-auto">
                    {filteredPermissions.map(p => (
                      <div 
                        key={p} 
                        onClick={() => addPermission(p)}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex items-center justify-between group"
                      >
                        <span>{p}</span>
                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown && filteredPermissions.length === 0 && permSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    No matching permissions found.
                  </div>
                )}
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors"
                >
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
