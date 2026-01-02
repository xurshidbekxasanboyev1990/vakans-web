import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, UserX, UserCheck, Mail, MapPin, Edit, Key, MessageSquare, RefreshCw, Eye, EyeOff, Phone, ChevronDown, ChevronUp, Check, AlertTriangle, Trash2, Lock, Copy, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import type { User } from '../../../lib/types';

interface UsersManagementProps {
  users: User[];
  onBlockUser: (userId: string) => void;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onResetPassword?: (userId: string) => void;
  onSendMessage?: (userId: string, message: string) => void;
  onChangeRole?: (userId: string, newRole: 'worker' | 'employer') => void;
  onDeleteUser?: (userId: string) => void;
}

export function UsersManagement({ users, onBlockUser, onUpdateUser, onResetPassword, onSendMessage, onChangeRole, onDeleteUser }: UsersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'worker' | 'employer' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewPasswordModalOpen, setViewPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [messageText, setMessageText] = useState('');
  const [newRole, setNewRole] = useState<'worker' | 'employer'>('worker');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = ((user.firstName || '') + ' ' + (user.lastName || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.region?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.phone?.includes(searchQuery) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesType = filterType === 'all' || (filterType === 'blocked' ? user.blocked : user.userType === filterType);
    return matchesSearch && matchesType;
  });

  const handleViewUser = (user: User) => { setSelectedUser(user); setViewModalOpen(true); };
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, region: user.region, bio: user.bio });
    setEditModalOpen(true);
  };
  const handleSaveEdit = () => { if (selectedUser && onUpdateUser) { onUpdateUser(selectedUser.id, editForm); setEditModalOpen(false); setSelectedUser(null); } };
  const handleOpenMessage = (user: User) => { setSelectedUser(user); setMessageText(''); setMessageModalOpen(true); };
  const handleSendMessage = () => { if (selectedUser && onSendMessage && messageText.trim()) { onSendMessage(selectedUser.id, messageText); setMessageModalOpen(false); setSelectedUser(null); setMessageText(''); } };
  const handleOpenRoleChange = (user: User) => { setSelectedUser(user); setNewRole(user.userType === 'worker' ? 'employer' : 'worker'); setRoleModalOpen(true); };
  const handleChangeRole = () => { if (selectedUser && onChangeRole) { onChangeRole(selectedUser.id, newRole); setRoleModalOpen(false); setSelectedUser(null); } };
  const handleOpenResetPassword = (user: User) => { setSelectedUser(user); setResetPasswordModalOpen(true); };
  const handleResetPassword = () => { if (selectedUser && onResetPassword) { onResetPassword(selectedUser.id); setResetPasswordModalOpen(false); setSelectedUser(null); } };
  const handleOpenDelete = (user: User) => { setSelectedUser(user); setDeleteModalOpen(true); };
  const handleDeleteUser = () => { if (selectedUser && onDeleteUser) { onDeleteUser(selectedUser.id); setDeleteModalOpen(false); setSelectedUser(null); } };
  
  // Parolni ko'rish
  const handleViewPassword = (user: User) => { 
    setSelectedUser(user); 
    setShowPassword(false);
    setCopiedPassword(false);
    setViewPasswordModalOpen(true); 
  };
  
  // Parolni nusxalash
  const handleCopyPassword = () => {
    if (selectedUser?.plainPassword) {
      navigator.clipboard.writeText(selectedUser.plainPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const blockedCount = users.filter(u => u.blocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Foydalanuvchilar boshqaruvi</h1>
        <p className="text-sm text-muted-foreground mt-1">Barcha foydalanuvchilarni ko'rish va boshqarish</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{users.length}</div><div className="text-xs text-blue-600 dark:text-blue-400">Jami foydalanuvchilar</div></div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-green-700 dark:text-green-300">{users.filter(u => u.userType === 'worker').length}</div><div className="text-xs text-green-600 dark:text-green-400">Ishchilar</div></div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{users.filter(u => u.userType === 'employer').length}</div><div className="text-xs text-purple-600 dark:text-purple-400">Ish beruvchilar</div></div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-red-700 dark:text-red-300">{blockedCount}</div><div className="text-xs text-red-600 dark:text-red-400">Bloklangan</div></div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Ism, telefon, email yoki viloyat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>Barchasi ({users.length})</Button>
              <Button variant={filterType === 'worker' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('worker')}>Ishchilar ({users.filter(u => u.userType === 'worker').length})</Button>
              <Button variant={filterType === 'employer' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('employer')}>Ish beruvchilar ({users.filter(u => u.userType === 'employer').length})</Button>
              <Button variant={filterType === 'blocked' ? 'destructive' : 'outline'} size="sm" onClick={() => setFilterType('blocked')}>Bloklangan ({blockedCount})</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Foydalanuvchilar topilmadi</CardContent></Card>
        ) : filteredUsers.map((user) => (
          <Card key={user.id} className={user.blocked ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                      <Badge variant={user.userType === 'worker' ? 'default' : 'secondary'}>{user.userType === 'worker' ? 'Ishchi' : 'Ish beruvchi'}</Badge>
                      {user.blocked && <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Bloklangan</Badge>}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {user.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{user.phone}</span></div>}
                      {user.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{user.email}</span></div>}
                      {user.region && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{user.region}</span></div>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleViewUser(user)} title="Ko'rish"><Eye className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} title="Tahrirlash"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewPassword(user)} title="Parolni ko'rish" className="text-purple-600 border-purple-600 hover:bg-purple-50"><Lock className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenMessage(user)} title="Xabar"><MessageSquare className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenResetPassword(user)} title="Parol"><Key className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenRoleChange(user)} title="Rol"><RefreshCw className="w-4 h-4" /></Button>
                    {user.blocked ? (
                      <Button variant="outline" size="sm" onClick={() => onBlockUser(user.id)} className="text-green-600 border-green-600 hover:bg-green-50" title="Blokdan chiqarish"><UserCheck className="w-4 h-4" /></Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => onBlockUser(user.id)} className="text-destructive border-destructive hover:bg-destructive/10" title="Bloklash"><UserX className="w-4 h-4" /></Button>
                    )}
                    {onDeleteUser && (
                      <Button variant="outline" size="sm" onClick={() => handleOpenDelete(user)} className="text-destructive border-destructive hover:bg-destructive/10" title="O'chirish"><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}>
                  {expandedUser === user.id ? <><ChevronUp className="w-4 h-4 mr-2" />Yopish</> : <><ChevronDown className="w-4 h-4 mr-2" />Batafsil</>}
                </Button>
                {expandedUser === user.id && (
                  <div className="border-t pt-4 mt-2 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-muted-foreground">ID:</span><span className="ml-2 font-mono">{user.id}</span></div>
                      <div><span className="text-muted-foreground">Ro'yxatdan:</span><span className="ml-2">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : 'Nomalum'}</span></div>
                      {user.bio && <div className="col-span-2"><span className="text-muted-foreground">Bio:</span><p className="mt-1">{user.bio}</p></div>}
                      {user.skills && user.skills.length > 0 && <div className="col-span-2"><span className="text-muted-foreground">Konikmalar:</span><div className="flex flex-wrap gap-1 mt-1">{user.skills.map((skill, i) => <Badge key={i} variant="outline">{skill}</Badge>)}</div></div>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length > 0 && <Card><CardContent className="py-4"><p className="text-sm text-muted-foreground text-center">Jami {filteredUsers.length} ta foydalanuvchi</p></CardContent></Card>}

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Foydalanuvchi malumotlari</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center pb-4 border-b">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><span className="text-2xl font-bold text-primary">{selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}</span></div>
                <h3 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <Badge variant={selectedUser.userType === 'worker' ? 'default' : 'secondary'}>{selectedUser.userType === 'worker' ? 'Ishchi' : 'Ish beruvchi'}</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Telefon:</span><span>{selectedUser.phone || 'Kiritilmagan'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedUser.email || 'Kiritilmagan'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Viloyat:</span><span>{selectedUser.region || 'Kiritilmagan'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Holati:</span><Badge variant={selectedUser.blocked ? 'destructive' : 'default'}>{selectedUser.blocked ? 'Bloklangan' : 'Faol'}</Badge></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewModalOpen(false)}>Yopish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tahrirlash</DialogTitle><DialogDescription>Foydalanuvchi malumotlarini ozgartiring</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ism</Label><Input value={editForm.firstName || ''} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Familiya</Label><Input value={editForm.lastName || ''} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} /></div>
            <div className="space-y-2"><Label>Viloyat</Label><Input value={editForm.region || ''} onChange={(e) => setEditForm({...editForm, region: e.target.value})} /></div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditModalOpen(false)}>Bekor</Button><Button onClick={handleSaveEdit}><Check className="w-4 h-4 mr-2" />Saqlash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Xabar yuborish</DialogTitle><DialogDescription>{selectedUser?.firstName} {selectedUser?.lastName} ga xabar</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="space-y-2"><Label>Xabar matni</Label><Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Xabar matnini kiriting..." rows={5} /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setMessageModalOpen(false)}>Bekor</Button><Button onClick={handleSendMessage} disabled={!messageText.trim()}><MessageSquare className="w-4 h-4 mr-2" />Yuborish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Rolni ozgartirish</DialogTitle><DialogDescription>{selectedUser?.firstName} {selectedUser?.lastName} ning rolini ozgartiring</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-yellow-700 dark:text-yellow-300">Rolni ozgartirish foydalanuvchi imkoniyatlarini ozgartiradi.</p></div>
            <div className="space-y-2"><Label>Yangi rol</Label><Select value={newRole} onValueChange={(v) => setNewRole(v as 'worker' | 'employer')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="worker">Ishchi</SelectItem><SelectItem value="employer">Ish beruvchi</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRoleModalOpen(false)}>Bekor</Button><Button onClick={handleChangeRole}><RefreshCw className="w-4 h-4 mr-2" />Ozgartirish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordModalOpen} onOpenChange={setResetPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Parolni tiklash</DialogTitle><DialogDescription>{selectedUser?.firstName} {selectedUser?.lastName} ning parolini tiklash</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-yellow-700 dark:text-yellow-300">Yangi vaqtinchalik parol SMS orqali yuboriladi.</p></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setResetPasswordModalOpen(false)}>Bekor</Button><Button onClick={handleResetPassword} variant="destructive"><Key className="w-4 h-4 mr-2" />Parolni tiklash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Foydalanuvchini o'chirish</DialogTitle><DialogDescription>{selectedUser?.firstName} {selectedUser?.lastName} ni o'chirmoqchimisiz?</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700 dark:text-red-300">Bu amalni qaytarib bo'lmaydi! Foydalanuvchining barcha ma'lumotlari o'chiriladi.</p></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Bekor</Button><Button onClick={handleDeleteUser} variant="destructive"><Trash2 className="w-4 h-4 mr-2" />O'chirish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parolni ko'rish dialog */}
      <Dialog open={viewPasswordModalOpen} onOpenChange={setViewPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" />
              Foydalanuvchi paroli
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.firstName} {selectedUser?.lastName} ning login ma'lumotlari
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Bu ma'lumotlar maxfiy! Faqat foydalanuvchining o'ziga yoki ishonchli shaxsga bering.
                </p>
              </div>
              
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Username (Login)</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border font-mono text-lg">
                      {selectedUser.username || selectedUser.phone || selectedUser.email || 'Mavjud emas'}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedUser.username || selectedUser.phone || selectedUser.email || '');
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Parol</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <code className="block w-full p-2 bg-white dark:bg-gray-900 rounded border font-mono text-lg pr-10">
                        {showPassword 
                          ? (selectedUser.plainPassword || 'Parol saqlanmagan') 
                          : '••••••••••'}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyPassword}
                      disabled={!selectedUser.plainPassword}
                    >
                      {copiedPassword ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {!selectedUser.plainPassword && (
                    <p className="text-xs text-muted-foreground">
                      Eski foydalanuvchi - parol hashlangan
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Telefon</Label>
                  <code className="block p-2 bg-white dark:bg-gray-900 rounded border font-mono">
                    {selectedUser.phone || 'Kiritilmagan'}
                  </code>
                </div>
              </div>

              {copiedPassword && (
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <span className="text-sm text-green-700 dark:text-green-300 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Parol nusxalandi!
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPasswordModalOpen(false)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
