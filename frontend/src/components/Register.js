import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  User, Mail, Lock, UserPlus, Shield, AlertCircle, 
  CheckCircle, Mountain, Flag, Heart, Star 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') calculateStrength(value);
  };

  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[Math.min(passwordStrength, 3)] || 'bg-gray-300';
  };

  const getStrengthText = () => {
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    return texts[Math.min(passwordStrength, 3)] || '';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    if (result.success) {
      toast.success('Welcome to Nepal Safety Network! 🏔️');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nepal-red via-nepal-blue to-nepal-red" />
      <div className="absolute top-10 right-10 opacity-5">
        <Mountain className="w-96 h-96 text-nepal-red" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-5">
        <Star className="w-64 h-64 text-nepal-blue" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-gradient-to-br from-nepal-red to-nepal-crimson rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-nepal-red/30 relative"
            >
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-nepal-blue rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <Flag className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 font-nepali">
              स्वागतम् 🙏
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              Join Nepal Safety Network
            </p>
            <p className="text-sm text-gray-400 mt-1">
              सुरक्षित यात्रा, सुन्दर नेपाल
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-nepal pl-10 ${errors.name ? 'border-nepal-red ring-2 ring-nepal-red' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-nepal-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
                  placeholder="Min 6 characters"
                />
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                      {getStrengthText()}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-nepal-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-nepal pl-10 ${errors.confirmPassword ? 'border-nepal-red ring-2 ring-nepal-red' : ''}`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-nepal-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-nepal w-full flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              ) : (
                <><UserPlus className="w-5 h-5" /> Join Nepal Safety</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-nepal-red font-semibold hover:text-nepal-crimson transition">
                Sign In
              </Link>
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3" /> Nepal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> Safe Travel
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" /> Trusted
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;