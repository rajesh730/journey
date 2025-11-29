import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, Sticker, Palette, Type, Smile } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

const PRESET_STICKERS = [
    { text: "Love you to the moon and back", emoji: "🌙", color: 'bg-pink-100' },
    { text: "Together is my favorite place", emoji: "💕", color: 'bg-yellow-100' },
    { text: "You make my heart smile", emoji: "😊", color: 'bg-purple-100' },
    { text: "Forever & Always", emoji: "💖", color: 'bg-rose-100' },
    { text: "Every love story is beautiful", emoji: "📖", color: 'bg-amber-100' },
    { text: "Love is the greatest adventure", emoji: "🌟", color: 'bg-pink-100' },
    { text: "Hugs & Kisses", emoji: "💋", color: 'bg-red-100' },
    { text: "My Sunshine", emoji: "☀️", color: 'bg-orange-100' },
    { text: "Dream Big", emoji: "☁️", color: 'bg-blue-100' },
    { text: "Magic Moments", emoji: "✨", color: 'bg-indigo-100' },
    { text: "Sweet Dreams", emoji: "💤", color: 'bg-slate-100' },
    { text: "XOXO", emoji: "💌", color: 'bg-pink-200' },
];

const COLORS = [
    { name: 'Pink', class: 'bg-pink-100' },
    { name: 'Rose', class: 'bg-rose-100' },
    { name: 'Yellow', class: 'bg-yellow-100' },
    { name: 'Amber', class: 'bg-amber-100' },
    { name: 'Orange', class: 'bg-orange-100' },
    { name: 'Red', class: 'bg-red-100' },
    { name: 'Purple', class: 'bg-purple-100' },
    { name: 'Indigo', class: 'bg-indigo-100' },
    { name: 'Blue', class: 'bg-blue-100' },
    { name: 'Sky', class: 'bg-sky-100' },
    { name: 'Teal', class: 'bg-teal-100' },
    { name: 'Emerald', class: 'bg-emerald-100' },
    { name: 'Green', class: 'bg-green-100' },
    { name: 'Lime', class: 'bg-lime-100' },
    { name: 'Slate', class: 'bg-slate-100' },
    { name: 'Gray', class: 'bg-gray-100' },
];

const FloatingQuotes = ({ theme }) => {
    const [stickers, setStickers] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragId, setDragId] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [showPicker, setShowPicker] = useState(false);
    const [pickerTab, setPickerTab] = useState('presets'); // 'presets' or 'create'
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Custom sticker state
    const [customText, setCustomText] = useState('');
    const [customEmoji, setCustomEmoji] = useState('✨');
    const [customColor, setCustomColor] = useState('bg-pink-100');

    const API_URL = API_ENDPOINTS.stickers;

    // Fetch stickers on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchStickers(token);
        } else {
            setIsLoggedIn(false);
            // Set dummy stickers for logged out users
            const dummyStickers = PRESET_STICKERS.slice(0, 5).map((s, i) => ({
                _id: `dummy-${i}`,
                ...s,
                x: Math.random() * (window.innerWidth - 300) + 50,
                y: Math.random() * (window.innerHeight - 200) + 50,
                rotation: Math.random() * 20 - 10
            }));
            setStickers(dummyStickers);
        }
    }, []);

    const fetchStickers = async (token) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(API_URL, config);
            setStickers(res.data);
        } catch (err) {
            console.error('Error fetching stickers:', err);
        }
    };

    const handleMouseDown = (e, id) => {
        if (!isLoggedIn) return; // Disable drag for logged out users
        const sticker = stickers.find(s => s._id === id);
        if (!sticker) return;

        setIsDragging(true);
        setDragId(id);
        setOffset({
            x: e.clientX - sticker.x,
            y: e.clientY - sticker.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || dragId === null) return;

        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        setStickers(prev => prev.map(s =>
            s._id === dragId ? { ...s, x: newX, y: newY } : s
        ));
    };

    const handleMouseUp = async () => {
        if (isDragging && dragId) {
            // Save new position to DB
            const sticker = stickers.find(s => s._id === dragId);
            if (sticker) {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { 'x-auth-token': token } };
                    await axios.put(`${API_URL}/${dragId}`, { x: sticker.x, y: sticker.y }, config);
                } catch (err) {
                    console.error('Error updating sticker position:', err);
                }
            }
        }
        setIsDragging(false);
        setDragId(null);
    };

    const addSticker = async (template) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please log in to add stickers!");
                return;
            }

            const newStickerData = {
                ...template,
                x: Math.random() * (window.innerWidth - 300) + 50,
                y: Math.random() * (window.innerHeight - 200) + 50,
                rotation: Math.random() * 10 - 5
            };

            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post(API_URL, newStickerData, config);

            setStickers([...stickers, res.data]);
            setShowPicker(false);
            // Reset custom form
            setCustomText('');
            setCustomEmoji('✨');
        } catch (err) {
            console.error('Error adding sticker:', err);
        }
    };

    const handleCreateCustom = () => {
        if (!customText.trim()) return;
        addSticker({
            text: customText,
            emoji: customEmoji,
            color: customColor
        });
    };

    const removeSticker = async (e, id) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`${API_URL}/${id}`, config);
            setStickers(stickers.filter(s => s._id !== id));
        } catch (err) {
            console.error('Error deleting sticker:', err);
        }
    };

    // Global mouse up/move to handle dragging outside sticker bounds
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragId]);

    return (
        <>
            {/* Stickers Layer */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {stickers.map((sticker) => (
                    <div
                        key={sticker._id}
                        onMouseDown={(e) => handleMouseDown(e, sticker._id)}
                        className={`absolute ${sticker.color} p-3 rounded-lg shadow-lg border-l-4 ${isLoggedIn ? 'cursor-move pointer-events-auto group hover:shadow-2xl' : 'opacity-80'} transition-all ${theme === 'purple' ? 'border-purple-300' : theme === 'mint' ? 'border-emerald-300' : theme === 'sunset' ? 'border-orange-300' : 'border-pink-300'}`}
                        style={{
                            left: sticker.x,
                            top: sticker.y,
                            transform: `rotate(${sticker.rotation}deg) scale(${dragId === sticker._id ? 1.05 : 1})`,
                            maxWidth: '200px',
                            zIndex: dragId === sticker._id ? 100 : 10
                        }}
                    >
                        <div className="flex items-start gap-2 relative">
                            <span className="text-2xl flex-shrink-0 select-none">{sticker.emoji}</span>
                            <p className="font-handwriting text-sm text-gray-700 leading-tight select-none">
                                {sticker.text}
                            </p>
                            {isLoggedIn && (
                                <button
                                    onClick={(e) => removeSticker(e, sticker._id)}
                                    className="absolute -top-5 -right-5 bg-red-400 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls - Only visible when logged in */}
            {isLoggedIn && (
                <div className="fixed bottom-6 left-6 z-[60]">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border-2 border-pink-200 text-pink-500 hover:bg-pink-50 hover:scale-110 transition-all group"
                        title="Add Sticker"
                    >
                        <Sticker className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    </button>

                    {/* Sticker Picker Modal */}
                    {showPicker && (
                        <div className="absolute bottom-16 left-0 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-pink-100 w-80 max-h-[500px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
                            <div className="flex justify-between items-center mb-3 px-4 pt-4">
                                <h3 className="font-handwriting text-xl text-pink-600">Pick a Sticker</h3>
                                <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-pink-100 px-4 mb-3">
                                <button
                                    onClick={() => setPickerTab('presets')}
                                    className={`flex-1 pb-2 text-sm font-ui transition-colors ${pickerTab === 'presets' ? 'text-pink-600 border-b-2 border-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Presets
                                </button>
                                <button
                                    onClick={() => setPickerTab('create')}
                                    className={`flex-1 pb-2 text-sm font-ui transition-colors ${pickerTab === 'create' ? 'text-pink-600 border-b-2 border-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Create Your Own
                                </button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar flex-1 px-4 pb-4">
                                {pickerTab === 'presets' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {PRESET_STICKERS.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => addSticker(s)}
                                                className={`${s.color} p-2 rounded-lg text-left hover:scale-105 transition-transform border border-transparent hover:border-pink-200`}
                                            >
                                                <span className="text-xl block mb-1">{s.emoji}</span>
                                                <span className="text-[10px] font-ui text-gray-600 leading-tight block">{s.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Preview */}
                                        <div className={`${customColor} p-3 rounded-lg shadow-sm border-l-4 border-pink-300 mx-auto max-w-[200px]`}>
                                            <div className="flex items-start gap-2">
                                                <span className="text-2xl flex-shrink-0">{customEmoji}</span>
                                                <p className="font-handwriting text-sm text-gray-700 leading-tight break-words">
                                                    {customText || "Your text here..."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-ui text-gray-500 mb-1 flex items-center gap-1">
                                                    <Type className="h-3 w-3" /> Message
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customText}
                                                    onChange={(e) => setCustomText(e.target.value)}
                                                    placeholder="Type something sweet..."
                                                    className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:ring-pink-300 focus:border-pink-300 text-sm font-handwriting"
                                                    maxLength={50}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-ui text-gray-500 mb-1 flex items-center gap-1">
                                                    <Smile className="h-3 w-3" /> Emoji
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customEmoji}
                                                    onChange={(e) => setCustomEmoji(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:ring-pink-300 focus:border-pink-300 text-xl text-center"
                                                    maxLength={2}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-ui text-gray-500 mb-1 flex items-center gap-1">
                                                    <Palette className="h-3 w-3" /> Color
                                                </label>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {COLORS.map((c) => (
                                                        <button
                                                            key={c.name}
                                                            onClick={() => setCustomColor(c.class)}
                                                            className={`w-6 h-6 rounded-full ${c.class} border-2 ${customColor === c.class ? 'border-gray-600 scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleCreateCustom}
                                                disabled={!customText.trim()}
                                                className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-ui py-2 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" /> Create Sticker
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default FloatingQuotes;
