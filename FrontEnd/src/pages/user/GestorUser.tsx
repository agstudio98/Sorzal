import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Target, LogOut, Camera, Save, LayoutDashboard, ArrowRight, History, Wallet, Bell, Loader2, CheckCircle2, Plus, Trash2, Edit2, X } from 'lucide-react';
import { updateUserProfile, uploadAvatar, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, changePassword } from '../../api';

interface GestorProps {
  user: any;
  logout: () => void;
}

export const GestorUser: React.FC<GestorProps> = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [name, setName] = useState(user?.name || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Payment State
  const [paymentMethods, setPaymentMethods] = useState<any[]>(user?.paymentMethods || []);
  const [showCardForm, setShowAddForm] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  
  // Form State for Cards
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('VISA');

  if (!user) return <div className="min-h-screen flex items-center justify-center title text-2xl">Debes iniciar sesión.</div>;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const { path } = await uploadAvatar(formData);
      setAvatar(path);
      setMessage({ type: 'success', text: 'Imagen subida correctamente' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updatedUser = await updateUserProfile({
        userId: user._id,
        name,
        lastName,
        bio,
        avatar
      });

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await changePassword({
        userId: user._id,
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  // Payment Logic
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return v;
  };

  const formatExpiry = (value: string) => {
    return value.replace(/[^0-9]/g, '').replace(/^([2-9])/, '0$1').replace(/^(1[3-9])/, '1').replace(/^([0-1][0-9])([0-9])/, '$1/$2').substring(0, 5);
  };

  const handleSaveCard = async () => {
    if (cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3 || !cardHolder) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    setLoading(true);
    try {
      const lastFour = cardNumber.slice(-4);
      let updatedMethods;
      if (editingMethodId) {
        updatedMethods = await updatePaymentMethod(editingMethodId, {
          userId: user._id,
          cardType,
          lastFour,
          expiry,
          cardHolder
        });
      } else {
        updatedMethods = await addPaymentMethod({
          userId: user._id,
          cardType,
          lastFour,
          expiry,
          cardHolder
        });
      }
      setPaymentMethods(updatedMethods);
      resetCardForm();
      setMessage({ type: 'success', text: editingMethodId ? 'Tarjeta actualizada' : 'Tarjeta añadida' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al procesar la tarjeta' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;
    try {
      const updatedMethods = await deletePaymentMethod(id, user._id);
      setPaymentMethods(updatedMethods);
      setMessage({ type: 'success', text: 'Tarjeta eliminada' });
    } catch (error) {
      console.error(error);
    }
  };

  const resetCardForm = () => {
    setShowAddForm(false);
    setEditingMethodId(null);
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
  };

  const startEditCard = (method: any) => {
    setEditingMethodId(method._id);
    setCardNumber(`**** **** **** ${method.lastFour}`);
    setCardHolder(method.cardHolder);
    setExpiry(method.expiry);
    setCardType(method.cardType);
    setShowAddForm(true);
  };

  const menu = [
    { id: 'info', label: 'Perfil y Datos', icon: <User size={20}/> },
    { id: 'dashboard', label: 'Gestión Central', icon: <LayoutDashboard size={20}/> },
    { id: 'payments', label: 'Pagos y Facturas', icon: <CreditCard size={20}/> },
    { id: 'security', label: 'Seguridad', icon: <Shield size={20}/> },
    { id: 'interests', label: 'Afinidad', icon: <Target size={20}/> },
  ];

  return (
    <div className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Menu */}
        <aside className="lg:w-1/4">
           <div className="glass-card p-8 sticky top-32 overflow-hidden border-t-4 border-primary-light shadow-2xl">
              <div className="flex flex-col items-center mb-10 text-center">
                 <div className="relative group mb-4">
                    <div className="w-28 h-28 rounded-[35px] bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white title text-6xl shadow-2xl overflow-hidden">
                       {avatar ? (
                         <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         (name || 'U').charAt(0)
                       )}
                    </div>
                    <label className="absolute inset-0 bg-primary-dark/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[35px] flex items-center justify-center text-white cursor-pointer">
                       {uploading ? <Loader2 className="animate-spin" size={28}/> : <Camera size={28}/>}
                       <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                    </label>
                 </div>
                 <h2 className="title text-3xl text-primary-dark dark:text-white truncate w-full">{name} {lastName}</h2>
                 <p className="body text-sm opacity-50 font-bold uppercase tracking-widest">{user.role || 'Miembro Sorzal'}</p>
              </div>

              <nav className="space-y-3">
                 {menu.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-[20px] title text-lg transition-all group ${
                        activeTab === item.id 
                        ? 'bg-primary-light text-white shadow-lg' 
                        : 'hover:bg-primary-light/5 text-primary-dark dark:text-white/60'
                      }`}
                    >
                       <span className={`${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                          {item.icon}
                       </span>
                       {item.label}
                    </button>
                 ))}
                 <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-4 rounded-[20px] title text-lg text-red-500 hover:bg-red-500/10 transition-all mt-8"
                 >
                    <LogOut size={20}/> Cerrar Sesión
                 </button>
              </nav>
           </div>
        </aside>

        {/* Content Area */}
        <main className="lg:w-3/4 animate-in fade-in slide-in-from-bottom-10 duration-700">
           
           {/* Profile Info View */}
           {activeTab === 'info' && (
             <div className="space-y-10">
                <header>
                   <h2 className="title text-5xl uppercase tracking-tighter">Perfil y Datos</h2>
                   <p className="body text-xl opacity-60">Asegúrate de que tu información esté siempre actualizada.</p>
                </header>

                {message && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20}/> : <Shield size={20}/>}
                    <p className="body font-bold">{message.text}</p>
                  </div>
                )}

                <div className="glass-card p-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Nombre</label>
                         <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none transition-all body text-lg font-bold"/>
                      </div>
                      <div className="space-y-3">
                         <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Apellido</label>
                         <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none transition-all body text-lg font-bold"/>
                      </div>
                      <div className="space-y-3">
                         <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Email Personal</label>
                         <input type="email" defaultValue={user.email} disabled className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl opacity-50 cursor-not-allowed body text-lg font-bold"/>
                      </div>
                      <div className="space-y-3">
                         <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Rol en el Ecosistema</label>
                         <input type="text" defaultValue={user.role || 'Miembro'} disabled className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl opacity-50 cursor-not-allowed body text-lg font-bold uppercase"/>
                      </div>
                      <div className="space-y-3 md:col-span-2">
                         <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Biografía Pública</label>
                         <textarea placeholder="Cuéntanos sobre ti..." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none transition-all body text-lg h-32"></textarea>
                      </div>
                   </div>
                   <button onClick={handleUpdateProfile} disabled={loading} className="mt-10 flex items-center gap-3 px-10 py-5 bg-primary-light text-white rounded-[25px] title text-xl hover:shadow-[0_0_30px_rgba(var(--primary-light),0.4)] transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
                      ACTUALIZAR PERFIL
                   </button>
                </div>
             </div>
           )}

           {/* Payments View */}
           {activeTab === 'payments' && (
              <div className="space-y-10">
                 <header className="flex justify-between items-end">
                    <div>
                       <h2 className="title text-5xl uppercase tracking-tighter">Centro de Pagos</h2>
                       <p className="body text-xl opacity-60">Gestiona tus tarjetas y facturación.</p>
                    </div>
                    <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-6 py-3 bg-primary-light text-white rounded-2xl title text-sm hover:shadow-lg transition-all">
                       <Plus size={20}/> AÑADIR TARJETA
                    </button>
                 </header>

                 {message && <div className="p-4 bg-primary-light/10 text-primary-light rounded-2xl font-bold body">{message.text}</div>}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {paymentMethods.map((method) => (
                      <div key={method._id} className="glass-card bg-gradient-to-br from-primary-dark to-primary-light/40 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                         <div className="flex justify-between items-start mb-16">
                            <CreditCard size={56} className="text-secondary-light" />
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => startEditCard(method)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Edit2 size={16}/></button>
                               <button onClick={() => handleDeleteCard(method._id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/40"><Trash2 size={16}/></button>
                            </div>
                         </div>
                         <p className="body text-3xl tracking-[0.3em] mb-10 font-bold text-secondary-light">**** **** **** {method.lastFour}</p>
                         <div className="flex justify-between items-end border-t border-white/10 pt-6">
                            <div>
                               <p className="text-[10px] uppercase opacity-60 font-black mb-1">Titular</p>
                               <p className="title text-xl uppercase tracking-widest">{method.cardHolder || user.name}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] uppercase opacity-60 font-black mb-1">Expiración</p>
                               <p className="title text-xl tracking-widest">{method.expiry}</p>
                            </div>
                         </div>
                      </div>
                    ))}

                    {paymentMethods.length === 0 && !showCardForm && (
                       <div className="md:col-span-2 py-20 text-center glass-card border-dashed border-2 border-primary-light/20">
                          <CreditCard size={64} className="mx-auto mb-4 opacity-20" />
                          <p className="body italic opacity-40">No has registrado ninguna tarjeta todavía.</p>
                       </div>
                    )}
                 </div>

                 {showCardForm && (
                   <div className="glass-card p-10 border-t-4 border-secondary-light animate-in zoom-in duration-300">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="title text-2xl uppercase tracking-widest">{editingMethodId ? 'EDITAR TARJETA' : 'AÑADIR NUEVA TARJETA'}</h3>
                         <button onClick={resetCardForm} className="text-red-500"><X size={24}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="body text-xs font-black uppercase opacity-50">Número de Tarjeta</label>
                            <input 
                              type="text" 
                              placeholder="0000 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              maxLength={19}
                              className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none body text-lg tracking-[0.2em]"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="body text-xs font-black uppercase opacity-50">Nombre en la Tarjeta</label>
                            <input 
                               type="text" 
                               placeholder="EJ. JUAN PÉREZ"
                               value={cardHolder}
                               onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                               className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none body text-lg uppercase"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="body text-xs font-black uppercase opacity-50">Fecha de Expiración</label>
                            <input 
                               type="text" 
                               placeholder="MM/YY"
                               value={expiry}
                               onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                               maxLength={5}
                               className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none body text-lg"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="body text-xs font-black uppercase opacity-50">CVV</label>
                            <input 
                               type="password" 
                               placeholder="***"
                               value={cvv}
                               onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                               maxLength={3}
                               className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none body text-lg"
                            />
                         </div>
                      </div>
                      <button onClick={handleSaveCard} disabled={loading} className="mt-10 w-full py-5 bg-secondary-light text-primary-dark font-black title text-xl rounded-[25px] hover:shadow-xl transition-all">
                         {loading ? <Loader2 className="animate-spin mx-auto" size={24}/> : (editingMethodId ? 'ACTUALIZAR TARJETA' : 'GUARDAR TARJETA')}
                      </button>
                   </div>
                 )}
              </div>
           )}

           {/* Other tabs... (dashboard, security, affinity) */}
           {activeTab === 'dashboard' && (
             <div className="space-y-12">
                <header className="flex justify-between items-end mb-10">
                   <div>
                      <h1 className="title text-6xl uppercase tracking-tighter">Panel de Gestión</h1>
                      <p className="body text-xl opacity-60 italic">Bienvenido de vuelta, {name}.</p>
                   </div>
                   <div className="p-4 bg-primary-light/10 rounded-2xl text-primary-light">
                      <Bell size={28} className="animate-bounce" />
                   </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass-card p-10 border-l-8 border-secondary-light group hover:scale-[1.02] transition-all cursor-pointer shadow-xl">
                      <div className="flex justify-between items-start mb-8">
                         <div className="w-16 h-16 bg-secondary-light/20 rounded-2xl flex items-center justify-center text-secondary-light">
                            <Wallet size={32} />
                         </div>
                         <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0" />
                      </div>
                      <h3 className="title text-3xl mb-2">PAGOS Y SALDO</h3>
                      <p className="body opacity-60 mb-6 uppercase text-xs font-bold tracking-widest">Métodos registrados: {paymentMethods.length}</p>
                      <p className="title text-5xl text-primary-dark dark:text-white">$0.00 <span className="text-xl opacity-40 font-normal">ARS</span></p>
                      <button onClick={() => setActiveTab('payments')} className="mt-8 text-secondary-light title text-sm hover:underline uppercase tracking-widest">Gestionar tarjetas →</button>
                   </div>
                   <div className="glass-card p-10 border-l-8 border-primary-light group hover:scale-[1.02] transition-all cursor-pointer shadow-xl">
                      <div className="flex justify-between items-start mb-8">
                         <div className="w-16 h-16 bg-primary-light/20 rounded-2xl flex items-center justify-center text-primary-light">
                            <Target size={32} />
                         </div>
                         <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0" />
                      </div>
                      <h3 className="title text-3xl mb-2">AFINIDAD SORZAL</h3>
                      <p className="body opacity-60 mb-6 uppercase text-xs font-bold tracking-widest">Tu camino en el ecosistema</p>
                      <p className="title text-2xl opacity-40 italic font-normal">Explora tus intereses</p>
                      <button onClick={() => setActiveTab('interests')} className="mt-8 text-primary-light title text-sm hover:underline uppercase tracking-widest">Configurar perfil →</button>
                   </div>
                </div>

                <div className="glass-card p-10 border-t-8 border-primary-light/20">
                   <h3 className="title text-2xl mb-8 uppercase tracking-widest flex items-center gap-3">
                      <History size={24} className="text-primary-light"/> Actividad Reciente
                   </h3>
                   <div className="space-y-6">
                      <div className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-2xl transition-colors border-b border-white/5">
                         <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center"><CreditCard size={20}/></div>
                         <div className="flex-1">
                            <p className="body font-bold">Bienvenida a Sorzal</p>
                            <p className="text-xs opacity-50 uppercase font-black">Cuenta verificada exitosamente</p>
                         </div>
                         <span className="title text-sm opacity-40">HOY</span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'security' && (
              <div className="space-y-10">
                 <header>
                    <h2 className="title text-5xl uppercase tracking-tighter">Seguridad</h2>
                    <p className="body text-xl opacity-60">Gestiona tus credenciales y protege tu cuenta.</p>
                 </header>

                 {message && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20}/> : <Shield size={20}/>}
                    <p className="body font-bold">{message.text}</p>
                  </div>
                )}

                 <div className="glass-card p-10 border-l-8 border-red-500/50 flex flex-col md:flex-row items-center gap-8 mb-10">
                    <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center shadow-inner"><Shield size={48}/></div>
                    <div className="flex-1 text-center md:text-left">
                       <h3 className="title text-3xl mb-2 uppercase">Autenticación 2FA</h3>
                       <p className="body text-lg opacity-60 max-w-md">Protege tu cuenta con el doble factor de seguridad Sorzal Shield.</p>
                    </div>
                    <button className="px-10 py-4 bg-primary-dark text-white font-bold title rounded-2xl hover:bg-primary-light transition-all shadow-xl">CONFIGURAR</button>
                 </div>

                 <div className="glass-card p-10 space-y-8">
                    <h3 className="title text-3xl uppercase tracking-widest border-b border-white/10 pb-4">Cambiar Contraseña</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-3">
                          <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Contraseña Actual</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none transition-all body text-lg font-bold"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Nueva Contraseña</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none transition-all body text-lg font-bold"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="body text-xs font-black uppercase tracking-[0.2em] opacity-50">Confirmar Nueva Contraseña</label>
                          <input 
                            type="password" 
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 bg-white/5 border-2 border-primary-light/10 rounded-2xl focus:border-primary-light outline-none transition-all body text-lg font-bold"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center gap-3 px-10 py-5 bg-primary-dark text-white rounded-[25px] title text-xl hover:bg-primary-light transition-all disabled:opacity-50"
                    >
                       {loading ? <Loader2 className="animate-spin" size={24}/> : <Shield size={24}/>}
                       ACTUALIZAR CONTRASEÑA
                    </button>
                 </div>
              </div>
           )}

           {activeTab === 'interests' && (
              <div className="space-y-8">
                 <h2 className="title text-5xl uppercase tracking-tighter">Afinidad</h2>
                 <div className="glass-card p-10 bg-gradient-to-br from-primary-light/5 to-transparent">
                    <p className="body text-2xl opacity-70 mb-10 italic">Define tu camino dentro del ecosistema.</p>
                    <div className="flex flex-wrap gap-4">
                       {['Fotografía', 'Gaming', 'Web Dev', 'Marketplace', 'Social', 'Citas', 'Cursos', 'Reels'].map(tag => (
                         <button key={tag} className="px-10 py-4 rounded-3xl border-2 border-primary-light/20 hover:border-primary-light hover:bg-primary-light hover:text-white transition-all title text-xl">
                            {tag}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </main>
      </div>
    </div>
  );
};
