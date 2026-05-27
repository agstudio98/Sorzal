import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { Mail, Lock, User, LogIn, UserPlus, Globe, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../../api';
import { withRouter } from '../../utils/withRouter';

interface FormState {
  isLogin: boolean;
  name: string;
  email: string;
  password: string;
  loading: boolean;
  message: string;
  messageType: 'success' | 'error' | '';
}

interface FormProps extends WithTranslation {
  login: (user: any) => void;
  router: {
    navigate: (path: string) => void;
  };
}

class UserForm extends Component<FormProps, FormState> {
  constructor(props: FormProps) {
    super(props);
    this.state = {
      isLogin: true,
      name: '',
      email: '',
      password: '',
      loading: false,
      message: '',
      messageType: ''
    };
  }

  toggleForm = () => {
    this.setState({ 
      isLogin: !this.state.isLogin, 
      message: '', 
      messageType: '',
      name: '',
      email: '',
      password: ''
    });
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value } as any);
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isLogin, name, email, password } = this.state;
    this.setState({ loading: true, message: '', messageType: '' });

    try {
      let data;
      if (isLogin) {
        data = await loginUser({ email, password });
        this.setState({ 
          message: `Bienvenido, ${data.name}. Redirigiendo...`, 
          messageType: 'success' 
        });
        this.props.login(data);
      } else {
        data = await registerUser({ name, email, password });
        this.setState({ 
          message: 'Cuenta creada con éxito. Iniciando sesión...', 
          messageType: 'success' 
        });
        this.props.login(data);
      }
      setTimeout(() => this.props.router.navigate('/'), 1500);
    } catch (err: any) {
      this.setState({ 
        message: err.message || 'Ocurrió un error inesperado', 
        messageType: 'error' 
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { t } = this.props;
    const { isLogin, name, email, password, loading, message, messageType } = this.state;

    return (
      <div className="w-full max-w-5xl flex flex-col md:flex-row glass-card overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.3)] border-white/10 animate-in fade-in zoom-in duration-700 min-h-[600px]">
        
        {/* Left Side: Visual/Brand (Hidden on small mobile) */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary-dark via-deep-ocean to-black relative p-12 flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-light/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-primary-light rounded-2xl rotate-45 flex items-center justify-center shadow-2xl mb-8">
              <span className="logo-font text-white text-3xl -rotate-45">S</span>
            </div>
            <h2 className="title text-5xl text-white leading-tight uppercase tracking-tighter">
              Expande tu <br />
              <span className="text-primary-light italic underline decoration-white/10 underline-offset-4">Universo Digital</span>
            </h2>
          </div>

          <div className="relative z-10 space-y-4">
            <p className="body text-white/60 text-lg italic max-w-xs leading-relaxed">
              "El espacio donde cada pieza de tu creatividad encuentra su lugar perfecto."
            </p>
            <div className="flex gap-2">
              <div className="w-10 h-1 bg-primary-light rounded-full"></div>
              <div className="w-4 h-1 bg-white/20 rounded-full"></div>
              <div className="w-4 h-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-[1.2] p-8 md:p-14 bg-white/5 dark:bg-black/20 backdrop-blur-sm relative">
          
          <div className="mb-10 text-center md:text-left">
            <h3 className="title text-4xl text-primary-dark dark:text-white uppercase tracking-widest mb-2">
              {isLogin ? t('NAVBAR.LOGIN') : 'ÚNETE A SORZAL'}
            </h3>
            <p className="body text-sm opacity-50 uppercase tracking-[0.2em]">
              {isLogin ? 'Ingresa a tu ecosistema' : 'Crea tu pieza en el cielo'}
            </p>
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
              messageType === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {messageType === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="body font-bold text-sm uppercase tracking-wide">{message}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={this.handleSubmit}>
            {!isLogin && (
              <div className="group space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 ml-4 group-focus-within:text-primary-light transition-colors">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-light/50 group-focus-within:text-primary-light transition-all" size={20} />
                  <input 
                    type="text" 
                    name="name"
                    value={name}
                    onChange={this.handleChange}
                    placeholder="Agustín Sorzal" 
                    required
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border-2 border-primary-light/10 rounded-[1.5rem] focus:border-primary-light outline-none transition-all body text-lg shadow-inner"
                  />
                </div>
              </div>
            )}

            <div className="group space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 ml-4 group-focus-within:text-primary-light transition-colors">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-light/50 group-focus-within:text-primary-light transition-all" size={20} />
                <input 
                  type="email" 
                  name="email"
                  value={email}
                  onChange={this.handleChange}
                  placeholder="hola@sorzal.com" 
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border-2 border-primary-light/10 rounded-[1.5rem] focus:border-primary-light outline-none transition-all body text-lg shadow-inner"
                />
              </div>
            </div>

            <div className="group space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 group-focus-within:text-primary-light transition-colors">Contraseña</label>
                {isLogin && <button type="button" className="text-[10px] uppercase font-bold text-primary-light hover:underline">¿La olvidaste?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-light/50 group-focus-within:text-primary-light transition-all" size={20} />
                <input 
                  type="password" 
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border-2 border-primary-light/10 rounded-[1.5rem] focus:border-primary-light outline-none transition-all body text-lg shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-10 py-5 bg-gradient-to-r from-primary-light to-primary-dark text-white rounded-[1.5rem] title text-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'SINCRONIZANDO...' : (
                <>
                  {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
                  <span>{isLogin ? 'ENTRAR AL CIELO' : 'EMPEZAR AHORA'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-12">
            <div className="flex items-center gap-4 opacity-20 mb-8">
              <div className="h-[1px] flex-1 bg-current"></div>
              <span className="body text-[10px] font-bold uppercase tracking-widest">O accede con</span>
              <div className="h-[1px] flex-1 bg-current"></div>
            </div>

            <button className="w-full py-4 bg-white dark:bg-white/5 border-2 border-primary-light/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-all body font-bold shadow-sm group">
              <Globe size={20} className="text-primary-light group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs uppercase tracking-widest">Google Identity</span>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="body text-sm opacity-60">
              {isLogin ? '¿Aún no tienes una pieza?' : '¿Ya eres parte del ecosistema?'}
              <button 
                onClick={this.toggleForm}
                className="ml-2 text-primary-light font-bold uppercase tracking-widest text-xs hover:underline flex items-center gap-1 mx-auto mt-2"
              >
                {isLogin ? 'Crea tu cuenta' : 'Inicia sesión aquí'} <ArrowRight size={14} />
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export const UserFormTranslated = withTranslation()(withRouter(UserForm));
