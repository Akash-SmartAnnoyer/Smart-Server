import React, { useState, useEffect } from 'react';
import { User, Lock, Utensils, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically make an API call to authenticate or register the user
    console.log('Submitting:', { username, password, role });
    // For demo purposes, we'll just log the user in
    if (isLogin) {
      localStorage.setItem('user', JSON.stringify({ username, role }));
    } else {
      // In a real app, you'd send this to your backend to create a new user
      const response = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({ username, role }));
      }
    }
    // Redirect or update app state here
  };

  const handleGuestLogin = () => {
    localStorage.setItem('user', JSON.stringify({ username: 'Guest', role: 'customer' }));
    // Redirect or update app state for guest login
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
          {isLogin ? 'Welcome Back!' : 'Join Our Tasty Community'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          {!isLogin && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="form-radio text-orange-600"
                />
                <span className="ml-2">Customer</span>
                <Utensils className="ml-1 text-orange-600" size={16} />
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="form-radio text-orange-600"
                />
                <span className="ml-2">Admin</span>
                <ChefHat className="ml-1 text-orange-600" size={16} />
              </label>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition duration-300"
            type="submit"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </motion.button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 hover:underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGuestLogin}
            className="text-gray-600 hover:text-orange-600"
          >
            Continue as Guest
          </motion.button>
        </div>
      </motion.div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .food-icon {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute top-4 left-4 flex space-x-4">
        {['🍔', '🍕', '🌮', '🍣', '🍜'].map((emoji, index) => (
          <span
            key={index}
            className="food-icon text-4xl"
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AuthPage;