import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Mail, Lock, LogIn, Shield, AlertCircle, 
  Mountain, Flag, Compass, Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(formData);
    if (result.success) {
      toast.success('Namaste! Welcome back 🏔️');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nepal-red via-nepal-blue to-nepal-red" />
      <div className="absolute top-20 right-20 opacity-10">
        <Mountain className="w-64 h-64 text-nepal-red" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10">
        <Compass className="w-48 h-48 text-nepal-blue" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Nepal Flag Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-gradient-to-br from-nepal-red to-nepal-crimson rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-nepal-red/30 relative"
            >
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-nepal-blue rounded-full flex items-center justify-center">
                <Flag className="w-4 h-4 text-white" />
              </div>
              <Shield className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 font-nepali">
              नमस्ते 🙏
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              Welcome to Nepal Safety Network
            </p>
            <p className="text-sm text-gray-400 mt-1">
              सुरक्षित यात्रा, सुन्दर नेपाल
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-nepal pl-10 ${errors.email ? 'border-nepal-red ring-2 ring-nepal-red' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-nepal-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-nepal pl-10 ${errors.password ? 'border-nepal-red ring-2 ring-nepal-red' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-nepal-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-nepal w-full flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-5 h-5" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New to Nepal Safety?{' '}
              <Link to="/register" className="text-nepal-red font-semibold hover:text-nepal-crimson transition">
                Create Account
              </Link>
            </p>
            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Join thousands of travelers exploring Nepal
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;