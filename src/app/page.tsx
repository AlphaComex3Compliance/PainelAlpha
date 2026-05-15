import LoginForm from "../components/loginForm";

export default async function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 z-0">
        <img 
          src="/FundoLogin.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-1000"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="logo"
            src="/Logotipo-1.png"
            className="mx-auto w-auto h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
          
          <div className="mt-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
              Entre com sua <span className="text-indigo-500">conta</span>
            </h2>
            <p className="mt-2 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto">
              Acesso restrito a usuários autorizados pela administração Alpha.
            </p>
          </div>
        </div>

        <div className="mt-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[2.5rem] shadow-2xl">
          <LoginForm />
        </div>

        <footer className="mt-8 text-center">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
            PAINEL ALPHA &copy; 2026
          </p>
        </footer>
      </main>
    </div>
  );
}