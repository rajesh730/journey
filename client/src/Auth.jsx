import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Key, User, Heart } from 'lucide-react';
import { API_ENDPOINTS } from './config';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const API_URL = API_ENDPOINTS.auth;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const endpoint = isLogin ? '/login' : '/register';
            const response = await axios.post(`${API_URL}${endpoint}`, { username, password });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            onLogin(response.data.user);
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred.');
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-pink-600 font-ui text-sm font-bold ml-2 text-center">
                        Username
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-pink-100 p-1.5 rounded-full group-focus-within:bg-pink-200 transition-colors">
                            <User className="text-pink-400 h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none font-ui text-pink-800 placeholder-pink-200 transition-all text-center"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-pink-600 font-ui text-sm font-bold ml-2 text-center">
                        Password
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-pink-100 p-1.5 rounded-full group-focus-within:bg-pink-200 transition-colors">
                            <Key className="text-pink-400 h-4 w-4" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none font-ui text-pink-800 placeholder-pink-200 transition-all text-center"
                            placeholder="Enter secret code"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-ui text-center animate-pulse">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200 transform transition-all hover:scale-[1.02] active:scale-95 font-ui flex items-center justify-center gap-2 mt-2"
                >
                    {isLogin ? 'Login' : 'Sign Up'}
                    <Heart className="h-4 w-4 fill-white" />
                </button>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                    }}
                    className="text-pink-400 hover:text-pink-600 font-ui text-sm transition-all flex items-center justify-center gap-1 mx-auto hover:underline decoration-pink-300 underline-offset-4"
                >
                    {isLogin ? (
                        <>New here? <span className="font-bold">Create an account</span></>
                    ) : (
                        <>Already have an account? <span className="font-bold">Login</span></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Auth;
