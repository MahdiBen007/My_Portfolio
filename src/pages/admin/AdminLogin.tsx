import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type AdminWelcomeLoaderProps = {
  compact?: boolean;
};

const AdminWelcomeLoader = ({ compact = false }: AdminWelcomeLoaderProps) => {
  const fullText = 'Welcome to Dashboard';
  const [typedText, setTypedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setTypedText('');
    setIndex(0);
  }, [fullText]);

  useEffect(() => {
    if (index >= fullText.length) return;
    const totalDuration = 2000;
    const step = Math.max(40, Math.floor(totalDuration / Math.max(fullText.length, 1)));
    const timeout = setTimeout(() => {
      setTypedText(fullText.slice(0, index + 1));
      setIndex((prev) => prev + 1);
    }, step);
    return () => clearTimeout(timeout);
  }, [index, fullText]);

  return (
    <div className={`text-center space-y-4 ${compact ? 'scale-95' : ''}`}>
      <div className={`relative mx-auto ${compact ? 'h-12 w-12' : 'h-16 w-16'}`}>
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <Loader2 className="h-full w-full animate-spin text-primary" />
      </div>
      <div className={`flex items-center justify-center gap-2 font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
        <span className="min-h-[1.6em]">{typedText}</span>
        <span className="h-5 w-[2px] bg-primary animate-pulse rounded-sm" />
      </div>
      <p className={`text-xs text-slate-400 ${compact ? 'text-[11px]' : ''}`}>
        Loading dashboard...
      </p>
    </div>
  );
};

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, loading, isAdmin, signOut } = useAuth();
  const [pageReady, setPageReady] = useState(false);
  const dashboardLogo = '/favicon.svg';
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setPageReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <AdminWelcomeLoader />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/10">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-white">Access Denied</CardTitle>
            <CardDescription className="text-slate-400">
              Your account does not have admin access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={() => void signOut()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    const { error } = await signIn(data.email, data.password);
    await minDelay;

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
      navigate('/admin');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={pageReady ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Card className="w-full relative bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={pageReady ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25"
            >
              <img
                src={dashboardLogo}
                alt="Dashboard Logo"
                className="w-9 h-9 object-contain drop-shadow"
              />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">Admin Dashboard</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to manage your portfolio
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="py-6">
                <AdminWelcomeLoader />
              </div>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400 text-sm">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password"
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      {...loginForm.register('password')}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                        <path d="M6 10V8a6 6 0 0112 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-400 text-sm">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 shadow-lg shadow-blue-500/25"
                >
                  Sign In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
