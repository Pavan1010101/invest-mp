/**
 * SISMP — Super Admin Dashboard
 * Exclusive Control Portal for Super Administrator to manage Sector Nodal Officers & Staff Accounts.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getStoredOfficerCredentials,
  addOfficerCredential,
  deleteOfficerCredential,
  type DepartmentOfficerCredential,
} from '@/lib/auth/officerCredentials';
import { ROLES, ROLE_LABELS } from '@/lib/auth/roles';
import {
  ShieldCheck,
  UserPlus,
  Building,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  Layers,
  AlertCircle,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const [officers, setOfficers] = useState<DepartmentOfficerCredential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State for New Officer Account
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sector: '',
    department: '',
    role: ROLES.DEPARTMENT_OFFICER,
    badgeRole: 'Government',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = () => {
    const data = getStoredOfficerCredentials();
    setOfficers(data);
  };

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.sector.trim()) {
      setFormError('Please fill in all required fields (Name, Email, Password, and Sector).');
      return;
    }

    const emailClean = formData.email.trim().toLowerCase();
    if (officers.some((o) => o.email.toLowerCase() === emailClean)) {
      setFormError(`An officer account with email "${emailClean}" already exists.`);
      return;
    }

    const created = addOfficerCredential({
      name: formData.name.trim(),
      email: emailClean,
      password: formData.password.trim(),
      sector: formData.sector.trim(),
      department: formData.department.trim() || `Department of ${formData.sector.trim()}`,
      role: formData.role as any,
      badgeRole: formData.badgeRole,
    });

    loadOfficers();
    setShowCreateModal(false);
    setSuccessMessage(`Successfully created Nodal Officer account for ${created.name} (${created.sector})!`);
    
    // Reset Form
    setFormData({
      name: '',
      email: '',
      password: '',
      sector: '',
      department: '',
      role: ROLES.DEPARTMENT_OFFICER,
      badgeRole: 'Government',
    });

    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleDeleteOfficer = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke the Nodal Officer account for "${name}"?`)) {
      deleteOfficerCredential(id);
      loadOfficers();
      setSuccessMessage(`Account for ${name} removed.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleCopyCredentials = (officer: DepartmentOfficerCredential) => {
    const text = `SISMP Nodal Officer Credentials:\nEmail: ${officer.email}\nPassword: ${officer.password}\nRole: ${officer.sector} (${officer.role})`;
    navigator.clipboard.writeText(text);
    setCopiedId(officer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOfficers = officers.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || o.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate sector coverage & stats
  const uniqueSectors = new Set(officers.map((o) => o.sector));
  const nodalOfficersCount = officers.filter((o) => o.role === ROLES.DEPARTMENT_OFFICER).length;
  const deskStaffCount = officers.filter((o) => o.role !== ROLES.DEPARTMENT_OFFICER && o.role !== ROLES.SUPER_ADMIN).length;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Super Admin Control Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight !text-white">
            Sector Nodal Officers & Staff Accounts Manager
          </h1>
          <p className="text-xs !text-slate-200 max-w-xl leading-relaxed">
            Create, configure, and manage official Sector Nodal Officers, Department Credentials, and Event Desk Staff for Invest Madhya Pradesh GIS-2026.
          </p>
        </div>

        <Button
          variant="accent"
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 shadow-lg shadow-accent/30 font-bold flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Create New Nodal Officer
        </Button>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" padding="md" className="space-y-2 border-primary-100 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-foreground-subtle">Total System Accounts</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{officers.length}</div>
          <span className="text-[11px] text-foreground-muted block">Configured in System Store</span>
        </Card>

        <Card variant="default" padding="md" className="space-y-2 border-emerald-100 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-foreground-subtle">Sector Nodal Officers</span>
            <Building className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{nodalOfficersCount}</div>
          <span className="text-[11px] text-emerald-600 block font-semibold">Active Sector Department Heads</span>
        </Card>

        <Card variant="default" padding="md" className="space-y-2 border-blue-100 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-foreground-subtle">Sectors Covered</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{uniqueSectors.size}</div>
          <span className="text-[11px] text-blue-600 block font-semibold">State Industrial Sectors</span>
        </Card>

        <Card variant="default" padding="md" className="space-y-2 border-amber-100 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-foreground-subtle">Desk & Operational Staff</span>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{deskStaffCount}</div>
          <span className="text-[11px] text-amber-700 block font-semibold">Registration, Security & Desks</span>
        </Card>
      </div>

      {/* Main Credentials Directory & Control Table */}
      <Card variant="default" padding="lg" className="space-y-6 shadow-sm">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="w-full sm:w-80 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search officer name, email, or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-foreground-subtle whitespace-nowrap">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles ({officers.length})</option>
              <option value={ROLES.DEPARTMENT_OFFICER}>Department Nodal Officer</option>
              <option value={ROLES.REGISTRATION_DESK}>Registration Desk</option>
              <option value={ROLES.SECURITY_STAFF}>Security Staff</option>
              <option value={ROLES.RELATIONSHIP_MANAGER}>Relationship Manager</option>
              <option value={ROLES.PAVILION_MANAGER}>Pavilion Manager</option>
              <option value={ROLES.EVENT_ORGANIZER}>Event Organizer</option>
              <option value={ROLES.MPIDC_ADMIN}>MPIDC Admin</option>
              <option value={ROLES.CMO_OFFICIAL}>CMO Official</option>
            </select>
          </div>
        </div>

        {/* Credentials Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-border font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3">Nodal Officer & ID</th>
                <th className="p-3">Sector & Department</th>
                <th className="p-3">Official Email / ID</th>
                <th className="p-3">Security Password</th>
                <th className="p-3">Role Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOfficers.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                        {o.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block text-xs">{o.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-foreground-subtle">{o.id}</span>
                          {o.isCustom && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Custom Created
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-primary block">{o.sector}</span>
                    <span className="text-[10px] text-foreground-subtle block max-w-xs truncate">{o.department}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-foreground">{o.email}</td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded inline-block text-xs">
                      {o.password}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      'px-2 py-1 rounded text-[10px] font-bold uppercase border block w-fit',
                      o.role === ROLES.SUPER_ADMIN && 'bg-purple-100 text-purple-800 border-purple-300',
                      o.role === ROLES.DEPARTMENT_OFFICER && 'bg-blue-100 text-blue-800 border-blue-300',
                      o.role === ROLES.SECURITY_STAFF && 'bg-red-100 text-red-800 border-red-300',
                      o.role === ROLES.REGISTRATION_DESK && 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      o.role === ROLES.CMO_OFFICIAL && 'bg-amber-100 text-amber-900 border-amber-300',
                      o.role === ROLES.MPIDC_ADMIN && 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    )}>
                      {ROLE_LABELS[o.role]?.en || o.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyCredentials(o)}
                        className="px-2.5 py-1 rounded bg-surface hover:bg-slate-100 text-foreground border border-border text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Copy credentials"
                      >
                        {copiedId === o.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>

                      {o.isCustom && (
                        <button
                          onClick={() => handleDeleteOfficer(o.id, o.name)}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-colors"
                          title="Delete custom officer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create New Sector Nodal Officer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="font-extrabold text-base !text-white tracking-tight">Create Sector Nodal Officer Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateOfficer} className="p-6 space-y-4 text-xs bg-white">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-800 text-xs font-bold block">
                  Officer Full Name & Designation <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Amit Sharma (IAS) or Smt. Priya Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-semibold text-xs transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 text-xs font-bold block">
                    Official Email / ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. textiles.nodal@mp.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-semibold text-xs transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 text-xs font-bold block">
                    Security Pass Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textile@MP2026!"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-semibold text-xs transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 text-xs font-bold block">
                    Industrial Sector <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textiles & Apparel"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-semibold text-xs transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 text-xs font-bold block">
                    Assigned Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dept. of Cottage & Industry"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-semibold text-xs transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 text-xs font-bold block">
                    System RBAC Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-bold text-xs focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value={ROLES.DEPARTMENT_OFFICER}>Department Nodal Officer</option>
                    <option value={ROLES.REGISTRATION_DESK}>Registration Desk</option>
                    <option value={ROLES.SECURITY_STAFF}>Security Staff</option>
                    <option value={ROLES.RELATIONSHIP_MANAGER}>Relationship Manager</option>
                    <option value={ROLES.PAVILION_MANAGER}>Pavilion Manager</option>
                    <option value={ROLES.EVENT_ORGANIZER}>Event Organizer</option>
                    <option value={ROLES.MPIDC_ADMIN}>MPIDC Admin</option>
                    <option value={ROLES.CMO_OFFICIAL}>CMO Official</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 text-xs font-bold block">
                    Badge Pass Color Level <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.badgeRole}
                    onChange={(e) => setFormData({ ...formData, badgeRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-bold text-xs focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Government">Government (Blue Band)</option>
                    <option value="Staff">Staff / Operations (Orange Band)</option>
                    <option value="VIP / Speaker">VIP / Speaker (Gold Band)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Create Nodal Officer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
