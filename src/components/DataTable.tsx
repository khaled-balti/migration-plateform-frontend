import { useState } from "react"
import type { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { motion, AnimatePresence } from "framer-motion"
import { FolderGit2, CheckCircle2, Clock } from "lucide-react"

export interface Column<T> {
  header: string
  accessorKey: keyof T
  cell?: (item: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  enableSelection?: boolean
  selectedIds?: (string | number)[]
  onSelectionChange?: (selectedIds: (string | number)[]) => void
}

export function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  enableSelection = false,
  selectedIds = [],
  onSelectionChange
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed text-slate-500 dark:text-slate-400">
        <FolderGit2 className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
        <p>No data available to display.</p>
      </div>
    )
  }

  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(currentData.map(row => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isAllSelected = currentData.length > 0 && selectedIds.length === currentData.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < currentData.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-[2px] rounded-xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200/50 dark:from-slate-800 dark:via-[#1e1e2d] dark:to-slate-800/50 shadow-md shadow-slate-200/50 dark:shadow-none flex flex-col"
    >
      <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1e1e2d] relative border border-slate-200/50 dark:border-slate-800/50">
        <Table>
          <TableHeader>
            <TableRow>
              {enableSelection && (
                <TableHead className="w-12 text-center pl-4">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer accent-indigo-600"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0 bg-white">
            <AnimatePresence mode="popLayout">
              {currentData.map((row, i) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className={`group border-b border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-[#2a2a3c] ${isSelected ? "bg-indigo-50/40 dark:bg-indigo-900/20" : ""}`}
                  >
                    {enableSelection && (
                      <TableCell className="text-center pl-4 w-12">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer accent-indigo-600"
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {column.cell ? column.cell(row) : (row[column.accessorKey] as ReactNode)}
                      </TableCell>
                    ))}
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50/80 dark:bg-[#1e1e2d] border-t border-slate-100 dark:border-slate-800 mt-2">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPage}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded hover:bg-slate-50 dark:hover:bg-[#34344a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded hover:bg-slate-50 dark:hover:bg-[#34344a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Reusable elegant cell formatters
export const StatusCell = ({ status }: { status: "migrated" | "waiting" }) => {
  if (status === "migrated") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Migrated
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm">
      <Clock className="w-3.5 h-3.5" />
      Waiting
    </div>
  );
};
