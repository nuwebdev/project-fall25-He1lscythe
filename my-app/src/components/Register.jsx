import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Registration functionality would go here
      console.log('Registration attempted with:', formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8 border border-white/20">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Link to="/" className="flex items-center space-x-1 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ahJong
                </span>
              </Link>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-white/90 text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                placeholder="Enter a username"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-white/90 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/30'} rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="text-red-300 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-white/90 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.password ? 'border-red-400' : 'border-white/30'} rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300`}
                placeholder="Create a password"
                required
              />
              {errors.password && (
                <p className="text-red-300 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-white/90 text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.confirmPassword ? 'border-red-400' : 'border-white/30'} rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300`}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transform hover:scale-[1.05] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Register
            </button>
          </form>

          <div className="text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-white font-semibold hover:text-white/80 underline underline-offset-4 transition-colors duration-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;