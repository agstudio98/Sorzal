import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Clock, Star, Play, Users, Search, 
  Code, Palette, Camera, TrendingUp, Gamepad2, Terminal, 
  Layers, Cpu, Database, Plus, Edit2, X, Trash2, Save,
  ChevronLeft, ChevronRight, Video, FileText, ChevronDown, ChevronUp,
  Calendar
} from 'lucide-react';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../api';
import ConfirmModal from '../components/ConfirmModal';

const ICON_MAP: Record<string, any> = {
  'code': Code,
  'palette': Palette,
  'camera': Camera,
  'trending-up': TrendingUp,
  'gamepad-2': Gamepad2,
  'terminal': Terminal,
  'layers': Layers,
  'cpu': Cpu,
  'database': Database,
};

interface CoursesPageProps {
  showNotification?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ showNotification }) => {
  const { t } = useTranslation();
  const location = useLocation() as any;
  const [courses, setCourses] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Todos');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [viewingCourse, setViewingCourse] = useState<any | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // User from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Diseño',
    thumbnail: 'code',
    modules: [{ title: '', content: '', videoUrl: '' }]
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourses(page, searchTerm, category);
      setCourses(data.courses);
      setPages(data.pages);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, category]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, category]);

  useEffect(() => {
    if (location.state?.create) {
      handleOpenModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenModal = (course: any = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        thumbnail: course.thumbnail || 'code',
        modules: course.modules.length > 0 ? course.modules : [{ title: '', content: '', videoUrl: '' }]
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: 'Diseño',
        thumbnail: 'code',
        modules: [{ title: '', content: '', videoUrl: '' }]
      });
    }
    setIsModalOpen(true);
  };

  const handleAddModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '', content: '', videoUrl: '' }]
    });
  };

  const handleModuleChange = (index: number, field: string, value: string) => {
    const newModules = [...formData.modules];
    (newModules[index] as any)[field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const handleRemoveModule = (index: number) => {
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: newModules });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, { ...formData, instructor: user.id });
        showNotification?.(t('COURSES.NOTIFICATIONS.UPDATE_SUCCESS') || 'Curso actualizado con éxito', 'success');
      } else {
        await createCourse({ ...formData, instructor: user.id });
        showNotification?.(t('COURSES.NOTIFICATIONS.CREATE_SUCCESS') || 'Curso creado con éxito', 'success');
      }
      setIsModalOpen(false);
      loadCourses();
    } catch (error: any) {
      console.error("Error saving course:", error);
      showNotification?.(error.message || 'Error al guardar curso', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteCourse(confirmDeleteId, user.id);
      loadCourses();
      showNotification?.(t('COURSES.NOTIFICATIONS.DELETE_SUCCESS') || 'Curso eliminado con éxito', 'success');
    } catch (error: any) {
      console.error("Error deleting course:", error);
      showNotification?.(error.message || 'Error al eliminar curso', 'error');
    }
  };

  const CourseIcon = ({ name, className }: { name: string, className?: string }) => {
    const IconComponent = ICON_MAP[name] || BookOpen;
    return <IconComponent className={className} />;
  };

  return (
    <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
         <h1 className="title text-6xl uppercase tracking-widest flex items-center justify-center gap-4">
            <GraduationCap size={60} className="text-primary-light" /> {t('COURSES.TITLE')}
         </h1>
         <p className="body text-2xl opacity-70 italic max-w-3xl mx-auto">{t('COURSES.SLOGAN')}</p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8">
        {user && (
          <button 
            onClick={() => handleOpenModal()}
            className="px-8 py-3 bg-primary-light text-white rounded-2xl font-bold title uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={20} /> {t('COURSES.NEW_COURSE')}
          </button>
        )}
      </div>

      {/* Search & Categories */}
      <div className="glass-card p-6 mb-12 flex flex-col md:flex-row gap-6 items-center border-l-8 border-primary-light shadow-xl">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light" size={20}/>
            <input 
              type="text" 
              placeholder={t('COURSES.SEARCH_PLACEHOLDER')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light body"
            />
         </div>
         <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            {['Todos', 'Diseño', 'Programación', 'Marketing', 'Fotografía', 'Gaming'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap uppercase tracking-widest text-xs ${
                  category === cat 
                  ? 'bg-primary-light text-white' 
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
                }`}
              >
                 {t(`COURSES.CATEGORIES.${cat}`)}
              </button>
            ))}
         </div>
      </div>

      {loading ? (
        <div className="text-center py-20 title text-4xl animate-pulse text-primary-light">CARGANDO ACADEMIA...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {courses.map(course => (
               <div 
                 key={course._id} 
                 onClick={() => { setViewingCourse(course); setExpandedModule(null); }}
                 className="glass-card overflow-hidden group hover:-translate-y-3 transition-all duration-500 shadow-xl border-b-8 border-secondary-light cursor-pointer"
               >
                  <div className="relative h-56 bg-primary-dark/5 flex items-center justify-center overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 to-secondary-light/5 opacity-50 group-hover:scale-110 transition-transform duration-1000" />
                     <div className="z-10 text-primary-light opacity-80 group-hover:scale-125 transition-transform duration-700">
                        <CourseIcon name={course.thumbnail} className="w-32 h-32 drop-shadow-2xl" />
                     </div>
                     
                     <div className="absolute top-4 right-4 bg-white/90 dark:bg-primary-dark/90 px-4 py-1 rounded-full font-bold text-primary-light shadow-lg title">
                        {course.price === 0 ? t('COURSES.FREE') : `$${course.price}`}
                     </div>

                     {user && user.id === course.instructor?._id && (
                       <div className="absolute top-4 left-4 flex gap-2 z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(course); }} 
                            className="p-2 bg-white/90 dark:bg-primary-dark/90 rounded-full text-primary-light hover:text-secondary-light transition-colors shadow-lg"
                          >
                             <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(course._id, e)} 
                            className="p-2 bg-white/90 dark:bg-primary-dark/90 rounded-full text-red-500 hover:text-red-600 transition-colors shadow-lg"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                     )}

                     <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-light animate-pulse">
                           <Play size={32} fill="currentColor" />
                        </div>
                     </div>
                  </div>

                  <div className="p-8">
                     <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase tracking-widest opacity-60">
                        <span className="flex items-center gap-1"><BookOpen size={14}/> {course.modules.length} {t('COURSES.MODULES')}</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> 8h {t('COURSES.TOTAL_TIME')}</span>
                     </div>
                     <h3 className="title text-2xl mb-4 text-primary-dark dark:text-white h-16 line-clamp-2">{course.title}</h3>
                     <div className="flex flex-col gap-1 mb-6">
                        <p className="body text-sm opacity-60 italic">{t('COURSES.INSTRUCTOR')} @{course.instructor?.username || course.instructor?.name || 'Anon'}</p>
                        <p className="body text-[10px] opacity-40 uppercase tracking-tighter flex items-center gap-1">
                           <Calendar size={12}/> {new Date(course.createdAt).toLocaleDateString()} - {new Date(course.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                     
                     <div className="flex justify-between items-center border-t border-primary-light/10 pt-6">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1 text-yellow-400 font-bold"><Star size={16} fill="currentColor"/> {course.rating.toFixed(1)}</div>
                           <div className="flex items-center gap-1 opacity-60 font-bold text-xs"><Users size={16}/> {course.numReviews}</div>
                        </div>
                        <button className="text-primary-light font-bold hover:underline title uppercase tracking-widest">{t('COURSES.SEE_DETAILS')}</button>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-4">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(page - 1)}
                 className="p-3 glass-card rounded-2xl text-primary-light disabled:opacity-30 hover:scale-110 transition-transform shadow-lg"
               >
                 <ChevronLeft size={24} />
               </button>
               
               <div className="flex gap-2">
                 {[...Array(pages).keys()].map(x => (
                   <button 
                     key={x + 1}
                     onClick={() => setPage(x + 1)}
                     className={`w-12 h-12 rounded-2xl title text-lg transition-all shadow-md ${
                       page === x + 1 
                       ? 'bg-primary-light text-white scale-110' 
                       : 'glass-card text-primary-light hover:bg-primary-light/10'
                     }`}
                   >
                     {x + 1}
                   </button>
                 ))}
               </div>

               <button 
                 disabled={page === pages}
                 onClick={() => setPage(page + 1)}
                 className="p-3 glass-card rounded-2xl text-primary-light disabled:opacity-30 hover:scale-110 transition-transform shadow-lg"
               >
                 <ChevronRight size={24} />
               </button>
            </div>
          )}
        </>
      )}

      {/* Course Detail Modal */}
      {viewingCourse && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-primary-dark/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto border-t-8 border-secondary-light shadow-2xl relative">
              <button 
                onClick={() => setViewingCourse(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-30"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Header/Info */}
                <div className="lg:col-span-5 p-10 bg-primary-light/5 space-y-8">
                   <div className="w-24 h-24 bg-primary-light/10 rounded-3xl flex items-center justify-center text-primary-light mb-6">
                      <CourseIcon name={viewingCourse.thumbnail} className="w-12 h-12" />
                   </div>
                   <h2 className="title text-4xl uppercase tracking-widest text-primary-light leading-tight">
                     {viewingCourse.title}
                   </h2>
                   <p className="body text-lg opacity-80 leading-relaxed">
                     {viewingCourse.description}
                   </p>
                   
                   <div className="flex items-center gap-6 pt-6 border-t border-primary-light/20">
                      <div className="flex items-center gap-2">
                         <Star className="text-yellow-400" size={20} fill="currentColor" />
                         <span className="font-bold text-xl">{viewingCourse.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-60">
                         <Users size={20} />
                         <span className="font-bold">{viewingCourse.numReviews} {t('FORUM.RESPONSES')}</span>
                      </div>
                   </div>

                   <div className="p-6 bg-primary-light/10 rounded-3xl space-y-2">
                      <p className="title text-sm uppercase opacity-50">{t('COURSES.INSTRUCTOR')}</p>
                      <p className="title text-xl text-primary-light">@{viewingCourse.instructor?.username || viewingCourse.instructor?.name || 'Anon'}</p>
                      <p className="body text-xs opacity-40 uppercase tracking-widest flex items-center gap-2 pt-2 border-t border-primary-light/10">
                         <Calendar size={14}/> {new Date(viewingCourse.createdAt).toLocaleDateString()} - {new Date(viewingCourse.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                </div>

                {/* Modules List */}
                <div className="lg:col-span-7 p-10 space-y-6">
                   <h3 className="title text-2xl uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-secondary-light">
                      <BookOpen /> {viewingCourse.modules.length} {t('COURSES.MODULES')}
                   </h3>

                   <div className="space-y-4">
                      {viewingCourse.modules.map((module: any, idx: number) => (
                        <div key={idx} className="glass-card overflow-hidden border border-white/5">
                           <button 
                             onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                             className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-secondary-light/20 text-secondary-light flex items-center justify-center font-bold title">
                                    {idx + 1}
                                 </div>
                                 <span className="title text-lg uppercase tracking-wider text-left">{module.title}</span>
                              </div>
                              {expandedModule === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                           </button>

                           {expandedModule === idx && (
                             <div className="p-8 bg-white/5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                <p className="body text-sm opacity-70 mb-6 leading-relaxed whitespace-pre-line">
                                   {module.content}
                                </p>
                                {module.videoUrl && (
                                  <a 
                                    href={module.videoUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-4 bg-primary-light/10 text-primary-light rounded-2xl font-bold title uppercase tracking-widest text-xs hover:bg-primary-light hover:text-white transition-all w-fit"
                                  >
                                     <Video size={16} /> {t('COURSES.MODAL.MODULE_VIDEO')}
                                  </a>
                                )}
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-primary-dark/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10 border-t-8 border-primary-light shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="title text-4xl mb-8 uppercase tracking-widest">
                {editingCourse ? t('COURSES.MODAL.EDIT_TITLE') : t('COURSES.MODAL.CREATE_TITLE')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest opacity-60">{t('COURSES.MODAL.LABEL_TITLE')}</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light title text-xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest opacity-60">{t('COURSES.MODAL.LABEL_CAT')}</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light title text-xl appearance-none"
                    >
                      {['Diseño', 'Programación', 'Marketing', 'Fotografía', 'Gaming'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold uppercase tracking-widest opacity-60">{t('COURSES.MODAL.LABEL_DESC')}</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light body min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest opacity-60">{t('COURSES.MODAL.LABEL_PRICE')}</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light title text-xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest opacity-60">{t('COURSES.MODAL.LABEL_ICON')}</label>
                    <select 
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light title text-xl"
                    >
                      {Object.keys(ICON_MAP).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-primary-light/10">
                  <div className="flex justify-between items-center">
                    <h3 className="title text-2xl uppercase tracking-widest">{t('COURSES.MODULES')}</h3>
                    <button 
                      type="button"
                      onClick={handleAddModule}
                      className="px-4 py-2 bg-primary-light/10 text-primary-light rounded-xl font-bold hover:bg-primary-light hover:text-white transition-all text-xs"
                    >
                      {t('COURSES.MODAL.ADD_MODULE')}
                    </button>
                  </div>

                  {formData.modules.map((module, index) => (
                    <div key={index} className="p-6 bg-white/5 rounded-3xl border border-primary-light/10 space-y-4 relative group">
                       <button 
                         type="button"
                         onClick={() => handleRemoveModule(index)}
                         className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Trash2 size={18} />
                       </button>
                       <input 
                         type="text" 
                         placeholder={t('COURSES.MODAL.MODULE_TITLE')}
                         value={module.title}
                         onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                         className="w-full px-4 py-2 bg-white/5 border-b border-primary-light/20 outline-none focus:border-primary-light title"
                       />
                       <input 
                         type="text" 
                         placeholder={t('COURSES.MODAL.MODULE_VIDEO')}
                         value={module.videoUrl}
                         onChange={(e) => handleModuleChange(index, 'videoUrl', e.target.value)}
                         className="w-full px-4 py-2 bg-white/5 border-b border-primary-light/20 outline-none focus:border-primary-light body text-sm italic"
                       />
                       <textarea 
                         placeholder={t('COURSES.MODAL.MODULE_CONTENT')}
                         value={module.content}
                         onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                         className="w-full px-4 py-2 bg-white/5 border-b border-primary-light/20 outline-none focus:border-primary-light body text-sm min-h-[60px]"
                       />
                    </div>
                  ))}
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-primary-light text-white rounded-2xl font-bold title text-xl uppercase tracking-[0.3em] hover:bg-primary-light/80 transition-all shadow-2xl flex items-center justify-center gap-4 group"
                >
                  <Save className="group-hover:scale-125 transition-transform" />
                  {editingCourse ? t('COURSES.MODAL.SUBMIT_EDIT') : t('COURSES.MODAL.SUBMIT_CREATE')}
                </button>
              </form>
           </div>
        </div>
      )}

      {/* Custom Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title={t('COURSES.MODAL.DELETE_TITLE') || '¿Eliminar curso?'}
        message={t('COURSES.MODAL.DELETE_CONFIRM') || 'Esta acción no se puede deshacer y el curso desaparecerá de la academia.'}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        type="danger"
      />
    </main>
  );
};
