import React, { useState } from 'react';
import { Plus, ShieldCheck, MoreHorizontal, Mail, Trash2, Pencil, UserPlus } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import { adminUsers, roles } from '@/lib/adminMockData';

const cn = (...c) => c.filter(Boolean).join(' ');

const tabs = [
  { label: 'Users', value: 'users' },
  { label: 'Roles', value: 'roles' },
];

const roleColors = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  'chart-4': 'bg-violet-100 text-violet-600',
  muted: 'bg-muted text-muted-foreground',
};

const columns = [
  {
    key: 'name', header: 'User',
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0", roleColors[row.color])}>
          {row.avatar}
        </div>
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    )
  },
  { key: 'role', header: 'Role', render: (r) => <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted text-foreground">{r.role}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'lastActive', header: 'Last Active', render: (r) => <span className="text-muted-foreground text-xs">{r.lastActive}</span> },
];

export default function Users() {
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filtered = adminUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (item) => { setEditItem(item); setDrawerOpen(true); };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage admin users, roles, and permissions"
        searchPlaceholder="Search users..."
        onSearch={setSearch}
        onAdd={() => openEdit(null)}
        addLabel="Invite User"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", tab === t.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <>
          <DataTable columns={columns} data={filtered} onRowClick={(row) => openEdit(row)} actions={() => {}} />
          <Pagination page={1} totalPages={1} total={6} perPage={10} onPageChange={() => {}} />

          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title={editItem ? 'Edit User' : 'Invite New User'}
            description={editItem ? editItem.name : 'Send an invitation to join the admin panel'}
            tabs={['Details', 'Role', 'Permissions', 'Activity']}
            width="lg"
          >
            {(tabName) => (
              <div className="space-y-5">
                {tabName === 'Details' && (
                  <>
                    <DrawerField label="Full Name" required>
                      <DrawerInput placeholder="e.g. Sarah Mitchell" defaultValue={editItem?.name} />
                    </DrawerField>
                    <DrawerField label="Email Address" required>
                      <DrawerInput type="email" placeholder="sarah@pureluxe.com" defaultValue={editItem?.email} />
                    </DrawerField>
                    <DrawerField label="Status">
                      <DrawerSelect options={['Active', 'Inactive']} defaultValue={editItem?.status} />
                    </DrawerField>
                  </>
                )}
                {tabName === 'Role' && (
                  <>
                    <DrawerField label="Assigned Role" required>
                      <DrawerSelect options={['Super Admin', 'Content Manager', 'Marketing Team', 'SEO Manager']} defaultValue={editItem?.role} />
                    </DrawerField>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Role Permissions</span>
                      </div>
                      <p className="text-xs text-muted-foreground">This role has access to manage content, packages, destinations, and media library.</p>
                    </div>
                  </>
                )}
                {tabName === 'Permissions' && (
                  <div className="space-y-3">
                    {['Dashboard', 'Website Content', 'Travel Packages', 'Blog Articles', 'Leads', 'Media Library', 'SEO Settings', 'User Management', 'Site Settings'].map(perm => (
                      <div key={perm} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-foreground">{perm}</span>
                        <div className="flex items-center gap-3 text-xs">
                          {['View', 'Edit', 'Delete'].map(action => (
                            <label key={action} className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" defaultChecked={action !== 'Delete'} className="w-3.5 h-3.5 rounded border-border text-primary" />
                              <span className="text-muted-foreground">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tabName === 'Activity' && (
                  <div className="space-y-3">
                    {[
                      { action: 'Logged in', time: 'Jul 29, 9:14 AM', ip: '192.168.1.1' },
                      { action: 'Published blog article', time: 'Jul 29, 8:15 AM' },
                      { action: 'Updated package pricing', time: 'Jul 28, 2:30 PM' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{a.action}</p>
                          <p className="text-xs text-muted-foreground">{a.time} {a.ip && `· ${a.ip}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Drawer>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.name} className="bg-white border border-border rounded-xl p-6 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", roleColors[role.color])}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <h3 className="text-base font-semibold text-foreground">{role.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-lg font-bold text-foreground">{role.users}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{role.permissions}</p>
                  <p className="text-xs text-muted-foreground">Permissions</p>
                </div>
              </div>
            </div>
          ))}
          <button className="bg-white border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors min-h-[200px]">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Create New Role</p>
            <p className="text-xs text-muted-foreground">Define custom permissions</p>
          </button>
        </div>
      )}
    </div>
  );
}