import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Save, X, Search, User, ChevronLeft, ChevronRight, Heart, Sparkles, LogOut, ChevronDown, ChevronUp, Menu, Star, Moon, Cloud, Sun, Palette } from 'lucide-react';
import axios from 'axios';
import Auth from './Auth';
import MagicCursor from './MagicCursor';
import FloatingQuotes from './FloatingQuotes';
import { themes } from './themes';
import { API_ENDPOINTS } from './config';

const App = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', pages: [''], category: 'Story', isPublic: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [authorFilter, setAuthorFilter] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const [viewMode, setViewMode] = useState('public'); // 'public' or 'mine'
  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'pink';
  });
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [error, setError] = useState(null);

  const flipTimeoutRef = useRef(null);

  const API_URL = API_ENDPOINTS.books;

  // Check for logged in user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update Body Class for Night Mode
  useEffect(() => {
    if (isNightMode || currentTheme === 'night') {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }
  }, [isNightMode, currentTheme]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Fetch books from API (always, even when logged out - shows public books)
  useEffect(() => {
    fetchBooks();
  }, [categoryFilter, authorFilter, viewMode, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setBooks([]);
    setSelectedBook(null);
    setViewMode('public');
  };

  const handleThemeChange = (themeKey) => {
    setCurrentTheme(themeKey);
    setShowThemePicker(false);
    // Automatically handle night mode for night theme
    if (themeKey === 'night') {
      setIsNightMode(true);
    } else {
      setIsNightMode(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setError(null); // Clear previous errors
      let url = API_URL;
      const params = new URLSearchParams();

      if (categoryFilter && categoryFilter !== 'All Categories') {
        params.append('category', categoryFilter);
      }

      if (authorFilter) {
        params.append('author', authorFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // If viewing my books, add 'mine=true' and auth header
      if (user && viewMode === 'mine') {
        params.append('mine', 'true');
        url = `${API_URL}?${params.toString()}`;
      }

      const config = {};
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = { 'x-auth-token': token };
      }

      const response = await axios.get(url, config);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Cannot connect to the library. Please check your connection.');
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBookmark = (bookId, page) => {
    setBookmarks(prev => {
      const key = `${bookId}-${page}`;
      if (prev[key]) {
        const newBookmarks = { ...prev };
        delete newBookmarks[key];
        return newBookmarks;
      } else {
        return { ...prev, [key]: true };
      }
    });
  };

  const isBookmarked = (bookId, page) => {
    return bookmarks[`${bookId}-${page}`] || false;
  };

  const handleCreateBook = async () => {
    if (newBook.title.trim()) {
      try {
        const bookData = {
          ...newBook,
          author: user.username
        };
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const response = await axios.post(API_URL, bookData, config);
        setBooks([response.data, ...books]);
        setNewBook({ title: '', author: '', pages: [''], category: 'Fairy Tale', isPublic: true });
        setIsCreatingBook(false);
      } catch (error) {
        console.error('Error creating book:', error);
      }
    }
  };

  const handleUpdateBook = async () => {
    if (selectedBook && selectedBook.title.trim()) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const response = await axios.put(`${API_URL}/${selectedBook._id}`, selectedBook, config);
        const updatedBooks = books.map(book =>
          book._id === selectedBook._id ? response.data : book
        );
        setBooks(updatedBooks);
        setSelectedBook(response.data); // Update selected book with new data
        setIsEditingBook(false);
      } catch (error) {
        console.error('Error updating book:', error);
      }
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`${API_URL}/${id}`, config);
      setBooks(books.filter(book => book._id !== id));
      if (selectedBook && selectedBook._id === id) {
        setSelectedBook(null);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    if (isEditingBook && selectedBook) {
      setSelectedBook({ ...selectedBook, [name]: fieldValue });
    } else {
      setNewBook({ ...newBook, [name]: fieldValue });
    }
  };

  const addPage = () => {
    if (isCreatingBook) {
      setNewBook({ ...newBook, pages: [...newBook.pages, ''] });
    } else if (isEditingBook && selectedBook) {
      setSelectedBook({ ...selectedBook, pages: [...selectedBook.pages, ''] });
    }
  };

  const updatePageContent = (pageIndex, content) => {
    if (isCreatingBook) {
      const updatedPages = [...newBook.pages];
      updatedPages[pageIndex] = content;
      setNewBook({ ...newBook, pages: updatedPages });
    } else if (isEditingBook && selectedBook) {
      const updatedPages = [...selectedBook.pages];
      updatedPages[pageIndex] = content;
      setSelectedBook({ ...selectedBook, pages: updatedPages });
    }
  };

  const getTotalPages = () => {
    if (isCreatingBook) {
      return newBook.pages.length;
    } else if (isEditingBook && selectedBook) {
      return selectedBook.pages.length;
    } else if (selectedBook) {
      return selectedBook.pages.length;
    }
    return 0;
  };

  const flipPage = (direction, targetPage) => {
    if (isFlipping || currentPage === targetPage) return;

    setFlipDirection(direction);
    setIsFlipping(true);

    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }

    flipTimeoutRef.current = setTimeout(() => {
      setCurrentPage(targetPage);
      setIsFlipping(false);
    }, 600);
  };

  const nextPage = () => {
    if (currentPage < getTotalPages() - 1) {
      flipPage('next', currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      flipPage('prev', currentPage - 1);
    }
  };

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  const handlePageClick = (pageIndex) => {
    if (pageIndex !== currentPage) {
      const direction = pageIndex > currentPage ? 'next' : 'prev';
      flipPage(direction, pageIndex);
    }
  };

  const categories = ['All Categories', 'Story', 'Poem', 'Novel', 'Journal', 'Adventure', 'Fantasy', 'Romance', 'Other'];
  // Categories for selection (excluding 'All Categories')
  const selectionCategories = categories.filter(c => c !== 'All Categories');

  const getStickyNoteClass = (index) => {
    const classes = ['sticky-note', 'sticky-note-pink', 'sticky-note-rose', 'sticky-note-yellow'];
    return classes[index % classes.length];
  };

  return (
    <div className={`h-screen w-screen font-body overflow-hidden relative flex flex-col ${isNightMode ? 'text-indigo-100' : 'text-gray-800'}`}>
      <MagicCursor />
      <FloatingQuotes theme={currentTheme} />

      {/* Living Background (Floating Petals) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float-random ${isNightMode ? 'text-indigo-300/40' : 'text-pink-200/60'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            {isNightMode ? '✨' : '🌸'}
          </div>
        ))}
        {/* Floating Clouds */}
        <div className="absolute top-20 left-10 animate-float opacity-30 pointer-events-none">
          <Cloud className={`${isNightMode ? 'text-indigo-200' : 'text-white'} h-24 w-24 fill-current`} />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-20 pointer-events-none" style={{ animationDelay: '2s' }}>
          <Cloud className={`${isNightMode ? 'text-indigo-200' : 'text-white'} h-32 w-32 fill-current`} />
        </div>

        {/* Flying Butterflies */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`butterfly-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${20 + i * 15}%`,
              left: '-50px',
              animation: `butterflyFly ${15 + i * 5}s linear infinite`,
              animationDelay: `${i * 3}s`,
              fontSize: '32px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          >
            🦋
          </div>
        ))}

        {/* Flying Birds */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`bird-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${10 + i * 20}%`,
              left: '-60px',
              animation: `birdSwoop ${18 + i * 4}s linear infinite`,
              animationDelay: `${2 + i * 4}s`,
              fontSize: '28px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          >
            🐦
          </div>
        ))}

        {/* Floating Fairies with Magic */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`fairy-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${15 + i * 25}%`,
              left: '-40px',
              animation: `fairyFloat ${20 + i * 5}s linear infinite`,
              animationDelay: `${1 + i * 5}s`,
              fontSize: '36px',
              filter: 'drop-shadow(0 4px 8px rgba(244, 114, 182, 0.4))'
            }}
          >
            <div className="relative">
              🧚‍♀️
              {/* Wand Sparkles */}
              <span
                className="absolute -right-2 top-0 text-yellow-300"
                style={{
                  animation: 'wandSparkle 1.5s ease-in-out infinite',
                  fontSize: '20px'
                }}
              >
                ✨
              </span>
              <span
                className="absolute -right-4 -top-2 text-pink-300"
                style={{
                  animation: 'wandSparkle 1.5s ease-in-out infinite',
                  animationDelay: '0.5s',
                  fontSize: '16px'
                }}
              >
                💫
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Magical Background Elements */}
      <div className="absolute top-20 left-20 animate-float opacity-60 pointer-events-none">
        <Star className={`${isNightMode ? 'text-yellow-200' : 'text-pink-300'} h-8 w-8`} />
      </div>
      <div className="absolute bottom-20 right-40 animate-float opacity-60 pointer-events-none" style={{ animationDelay: '1s' }}>
        <Sparkles className={`${isNightMode ? 'text-purple-300' : 'text-rose-300'} h-10 w-10`} />
      </div>

      {/* Theme Toggle (Moon/Sun) */}
      <div className="absolute top-1/2 left-10 animate-float pointer-events-auto cursor-pointer z-50" style={{ animationDelay: '2s' }} onClick={() => setIsNightMode(!isNightMode)}>
        {isNightMode ? (
          <Sun className="text-yellow-300 h-12 w-12 hover:scale-110 transition-transform" />
        ) : (
          <Moon className="text-yellow-200 h-12 w-12 hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-[#fffbf0] p-8 rounded-3xl shadow-2xl max-w-md w-full border-4 border-pink-200 transform hover:scale-[1.01] transition-transform glass-glow">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-4 -right-4 bg-pink-400 text-white rounded-full p-2 shadow-lg hover:bg-pink-500 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center mb-6">
              <div className="inline-block p-3 rounded-full bg-pink-50 mb-3">
                <Heart className="h-8 w-8 text-pink-400 fill-pink-100" />
              </div>
              <h2 className="text-3xl font-handwriting text-pink-600 mb-2">Welcome, Traveler!</h2>
              <p className="text-pink-400 font-ui">Enter the portal to start your journey.</p>
            </div>
            <Auth onLogin={(loggedInUser) => {
              setUser(loggedInUser);
              setShowAuthModal(false);
            }} />
          </div>
        </div>
      )}

      {/* --- DASHBOARD HEADER --- */}
      <div className={`w-full backdrop-blur-md border-b px-8 py-4 flex justify-between items-center shadow-sm z-40 glass-glow ${isNightMode ? 'bg-indigo-950/80 border-indigo-800' : 'bg-white/80 border-pink-100'}`}>
        <div className="flex items-center space-x-3">
          <div className={`${isNightMode ? 'bg-indigo-900 border-indigo-700' : 'bg-pink-100 border-pink-200'} p-2 rounded-full border-2`}>
            <BookOpen className={`h-6 w-6 ${isNightMode ? 'text-indigo-300' : 'text-pink-500'}`} />
          </div>
          <h1 className={`font-handwriting font-bold text-3xl ${isNightMode ? 'text-indigo-200' : 'text-pink-600'}`}
            style={{
              animation: isNightMode ? 'sparkleShimmerNight 3s ease-in-out infinite' : 'sparkleShimmer 3s ease-in-out infinite'
            }}
          >
            Fairy Land Chronicles
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className={`flex items-center space-x-4 px-4 py-2 rounded-full border ${isNightMode ? 'bg-indigo-900/50 border-indigo-800' : 'bg-pink-50 border-pink-100'}`}>
              <div className="flex items-center space-x-2">
                <div className={`${isNightMode ? 'bg-indigo-800' : 'bg-white'} p-1.5 rounded-full shadow-sm`}>
                  <User className={`h-4 w-4 ${isNightMode ? 'text-indigo-300' : 'text-pink-400'}`} />
                </div>
                <span className={`font-handwriting text-xl ${isNightMode ? 'text-indigo-200' : 'text-pink-700'}`}>{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className={`${isNightMode ? 'text-indigo-400 hover:text-indigo-200' : 'text-pink-400 hover:text-pink-600'} transition-colors flex items-center gap-1 text-sm font-ui`}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-pink-400 hover:bg-pink-500 text-white font-ui px-6 py-2 rounded-full shadow-md transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Fly to Fairy Land
            </button>
          )}
        </div>
      </div>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="flex-1 p-8 overflow-hidden">
        <div className="grid grid-cols-12 gap-8 h-full">

          {/* --- LEFT COLUMN: LIBRARY LIST & FILTERS --- */}
          <div className={`col-span-4 backdrop-blur-md rounded-3xl border shadow-lg flex flex-col overflow-hidden relative glass-glow animate-float-slow ${isNightMode ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white/60 border-pink-100'}`}>

            {/* Header & Filters Consolidated */}
            <div className={`p-6 border-b flex flex-col gap-4 ${isNightMode ? 'border-indigo-800 bg-indigo-900/30' : 'border-pink-100 bg-pink-50/50'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`font-handwriting text-2xl ${isNightMode ? 'text-indigo-200' : 'text-pink-700'}`}>My Moon Journal</h2>
                <div className={`flex rounded-lg p-1 shadow-sm ${isNightMode ? 'bg-indigo-900' : 'bg-white'}`}>
                  <button
                    onClick={() => setViewMode('public')}
                    className={`px-3 py-1 rounded-md text-xs font-ui transition-all ${viewMode !== 'mine' ? (isNightMode ? 'bg-indigo-700 text-indigo-100 font-bold' : 'bg-pink-100 text-pink-700 font-bold') : (isNightMode ? 'text-indigo-400 hover:text-indigo-200' : 'text-pink-400 hover:text-pink-600')}`}
                  >
                    Tales
                  </button>
                  {user && (
                    <button
                      onClick={() => setViewMode('mine')}
                      className={`px-3 py-1 rounded-md text-xs font-ui transition-all ${viewMode === 'mine' ? (isNightMode ? 'bg-indigo-700 text-indigo-100 font-bold' : 'bg-pink-100 text-pink-700 font-bold') : (isNightMode ? 'text-indigo-400 hover:text-indigo-200' : 'text-pink-400 hover:text-pink-600')}`}
                    >
                      My Journal
                    </button>
                  )}
                </div>
              </div>

              {/* Consolidated Filters */}
              <div className="flex flex-col space-y-2">
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border shadow-sm ${isNightMode ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white border-pink-100'}`}>
                  <Search className={`${isNightMode ? 'text-indigo-400' : 'text-pink-300'} h-3 w-3`} />
                  <input
                    type="text"
                    placeholder="Chase a Moonbeam..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`bg-transparent border-none focus:ring-0 w-full font-ui text-xs ${isNightMode ? 'text-indigo-200 placeholder-indigo-500' : 'text-pink-700 placeholder-pink-300'}`}
                  />
                </div>
                <div className="flex gap-2">
                  <div className={`flex-1 flex items-center space-x-2 px-3 py-1.5 rounded-lg border shadow-sm ${isNightMode ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white border-pink-100'}`}>
                    <User className={`${isNightMode ? 'text-indigo-400' : 'text-pink-300'} h-3 w-3`} />
                    <input
                      type="text"
                      placeholder="Find Fairy..."
                      value={authorFilter}
                      onChange={(e) => setAuthorFilter(e.target.value)}
                      className={`bg-transparent border-none focus:ring-0 w-full font-ui text-xs ${isNightMode ? 'text-indigo-200 placeholder-indigo-500' : 'text-pink-700 placeholder-pink-300'}`}
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`flex-1 px-2 py-1.5 rounded-lg border shadow-sm font-ui text-xs focus:ring-0 ${isNightMode ? 'bg-indigo-950/60 border-indigo-800 text-indigo-200 focus:border-indigo-500' : 'bg-white border-pink-100 text-pink-700 focus:border-pink-300'}`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm font-ui text-center mb-4">
                  <p>{error}</p>
                  <button
                    onClick={fetchBooks}
                    className="mt-2 text-xs underline hover:text-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {filteredBooks.length === 0 && !error ? (
                <div className="text-center py-10 opacity-60 flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-3 ${isNightMode ? 'bg-indigo-900/50' : 'bg-pink-50'}`}>
                    <Sparkles className={`h-8 w-8 animate-spin-slow ${isNightMode ? 'text-indigo-400' : 'text-pink-300'}`} />
                  </div>
                  <p className={`font-handwriting text-xl ${isNightMode ? 'text-indigo-300' : 'text-pink-400'}`}>No stories found...</p>
                </div>
              ) : (
                filteredBooks.map((book, index) => (
                  <div
                    key={book._id}
                    onClick={() => {
                      setSelectedBook(book);
                      setCurrentPage(0);
                    }}
                    className={`group relative p-4 cursor-pointer rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-md ${selectedBook && selectedBook._id === book._id
                      ? (isNightMode ? 'bg-indigo-900/50 border-indigo-500 shadow-md' : 'bg-pink-50 border-pink-300 shadow-md')
                      : (isNightMode ? 'bg-indigo-950/40 border-indigo-900 hover:border-indigo-700' : 'bg-white border-pink-50 hover:border-pink-200')
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-handwriting text-xl mb-1 ${isNightMode ? 'text-indigo-200' : 'text-pink-800'}`}>
                          {book.title}
                        </h3>
                        <p className={`font-ui text-xs flex items-center gap-1 ${isNightMode ? 'text-indigo-400' : 'text-pink-500'}`}>
                          <Sparkles className="h-3 w-3" />
                          by {book.author}
                        </p>
                      </div>
                      {user && (book.owner === user.id || book.owner === user._id) && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBook(book);
                              setCurrentPage(0);
                              setIsEditingBook(true);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${isNightMode ? 'hover:bg-indigo-800 text-indigo-400 hover:text-indigo-200' : 'hover:bg-pink-100 text-pink-400 hover:text-pink-600'}`}
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book._id);
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-full text-red-300 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={`mt-2 flex items-center justify-between text-[10px] font-ui ${isNightMode ? 'text-indigo-400' : 'text-pink-400'}`}>
                      <span className={`px-2 py-0.5 rounded-full ${isNightMode ? 'bg-indigo-900' : 'bg-pink-50'}`}>{book.category || 'Story'}</span>
                      <span>{book.pages.length} pages</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create Button (Floating in Left Column) */}
            {user && (
              <div className="absolute bottom-6 right-6 z-10">
                <button
                  onClick={() => {
                    setIsCreatingBook(true);
                    setNewBook({ title: '', author: '', pages: [''], category: 'Story', isPublic: true });
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center group border-4 border-white"
                  title="Write a new story"
                >
                  <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: READER / EDITOR --- */}
          <div
            className={`col-span-8 backdrop-blur-md rounded-3xl border shadow-lg flex flex-col overflow-hidden relative p-8 items-center justify-center perspective-1000 glass-glow animate-float-slow ${isNightMode ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white/60 border-pink-100'}`}
            style={{ animationDelay: '1.5s' }} // Offset float animation
          >

            {/* Book Container (No 3D Tilt) */}
            <div
              className="relative w-full h-full bg-[#be185d] shadow-2xl flex flex-col overflow-hidden book-shadow hardcover-edge rounded-r-2xl rounded-l-md"
              style={{
                maxWidth: '800px',
                maxHeight: '90%'
              }}
            >
              {/* Bookmark Ribbon */}
              <div className="absolute top-0 right-12 w-10 h-40 bg-rose-500 shadow-md z-20 transform -translate-y-32 hover:translate-y-0 transition-transform duration-500 cursor-pointer rounded-b-lg flex items-end justify-center pb-4 group">
                <Heart className="text-white/50 w-5 h-5 group-hover:text-white transition-colors animate-pulse" />
              </div>

              {/* Inner Page Container */}
              <div className="flex-1 bg-[#fffbf0] overflow-hidden relative shadow-inner mx-1 my-1 rounded-r-xl rounded-l-sm">

                {/* Content Area */}
                <div className="h-full p-10 flex flex-col relative overflow-hidden">

                  {/* Empty State */}
                  {!selectedBook && !isCreatingBook && !isEditingBook && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 border-4 border-dashed border-pink-200 rounded-3xl m-4 bg-white/40 backdrop-blur-sm">
                      <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-float border-4 border-white shadow-sm">
                        <BookOpen className="h-16 w-16 text-pink-300" />
                      </div>
                      <h2 className="font-handwriting text-4xl text-pink-500 mb-2">Gaze at the Moon...</h2>
                      <p className="font-ui text-xl text-pink-400">or write your own fairy tale!</p>
                    </div>
                  )}

                  {/* Editor Mode (Create/Edit) */}
                  {(isCreatingBook || isEditingBook) && (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      <div className="flex justify-between items-end mb-4 border-b-2 border-pink-200 pb-2">
                        <div className="flex-1 mr-4">
                          <input
                            type="text"
                            name="title"
                            value={isCreatingBook ? newBook.title : selectedBook.title}
                            onChange={handleInputChange}
                            placeholder="Book Title..."
                            className="font-handwriting text-4xl bg-transparent border-none focus:ring-0 text-pink-800 placeholder-pink-300 w-full text-center"
                          />
                        </div>
                      </div>

                      {/* Category & Privacy Controls */}
                      <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
                        {/* Category Selector */}
                        <select
                          name="category"
                          value={isCreatingBook ? newBook.category : selectedBook.category}
                          onChange={handleInputChange}
                          className="bg-pink-50 border border-pink-200 text-pink-700 text-sm rounded-full focus:ring-pink-500 focus:border-pink-500 block px-4 py-1.5 font-ui shadow-sm"
                        >
                          {selectionCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>

                        {/* Privacy Toggle */}
                        <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-1.5 shadow-sm">
                          <label className="flex items-center gap-2 cursor-pointer font-ui text-sm">
                            <input
                              type="checkbox"
                              name="isPublic"
                              checked={isCreatingBook ? newBook.isPublic : selectedBook.isPublic}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-pink-600 bg-white border-pink-300 rounded focus:ring-pink-500 focus:ring-2 cursor-pointer"
                            />
                            <span className={`${(isCreatingBook ? newBook.isPublic : selectedBook.isPublic) ? 'text-pink-700 font-bold' : 'text-gray-500'}`}>
                              {(isCreatingBook ? newBook.isPublic : selectedBook.isPublic) ? '🌍 Public' : '🔒 Private'}
                            </span>
                          </label>
                          <span className="text-[10px] text-pink-400 italic">
                            {(isCreatingBook ? newBook.isPublic : selectedBook.isPublic)
                              ? 'Everyone can read'
                              : 'Only you'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 relative bg-white/60 rounded-xl p-4 shadow-inner border border-pink-100 mb-4 overflow-hidden">
                        <textarea
                          value={isCreatingBook ? newBook.pages[currentPage] : selectedBook.pages[currentPage]}
                          onChange={(e) => updatePageContent(currentPage, e.target.value)}
                          className="w-full h-full bg-transparent border-none resize-none focus:ring-0 font-body text-xl leading-relaxed text-gray-800 p-4 custom-scrollbar text-center"
                          placeholder="Once upon a time..."
                        />
                        {/* Page Lines */}

                      </div>

                      <div className="flex justify-between items-center bg-pink-50 p-3 rounded-2xl border border-pink-100 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <button onClick={isCreatingBook ? handleCreateBook : handleUpdateBook} className="bg-green-400 hover:bg-green-500 text-white px-4 py-1.5 rounded-full font-ui shadow-md flex items-center text-sm transform hover:scale-105 transition-all">
                            <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                          </button>
                          <button onClick={() => { setIsCreatingBook(false); setIsEditingBook(false); }} className="bg-gray-300 hover:bg-gray-400 text-gray-600 px-4 py-1.5 rounded-full font-ui shadow-md text-sm transform hover:scale-105 transition-all">
                            Cancel
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button onClick={prevPage} disabled={currentPage === 0} className="p-1.5 hover:bg-pink-200 rounded-full disabled:opacity-30 transition-colors">
                            <ChevronLeft className="h-5 w-5 text-pink-600" />
                          </button>
                          <span className="font-ui text-pink-500 text-sm">Page {currentPage + 1}</span>
                          <button onClick={nextPage} disabled={currentPage === (isCreatingBook ? newBook.pages.length - 1 : selectedBook.pages.length - 1)} className="p-1.5 hover:bg-pink-200 rounded-full disabled:opacity-30 transition-colors">
                            <ChevronRight className="h-5 w-5 text-pink-600" />
                          </button>
                          <button onClick={addPage} className="ml-1 bg-pink-200 hover:bg-pink-300 text-pink-700 px-3 py-1.5 rounded-full font-ui text-xs flex items-center shadow-sm">
                            <Plus className="h-3 w-3 mr-1" /> Add Page
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reader Mode */}
                  {selectedBook && !isCreatingBook && !isEditingBook && (
                    <div className="flex-1 flex flex-col h-full perspective-1000 overflow-hidden">
                      <div className="text-center mb-6">
                        <h2 className="font-handwriting text-4xl text-pink-800 mb-1">{selectedBook.title}</h2>
                        <div className="flex justify-center items-center space-x-3 text-pink-500 font-ui text-xs bg-pink-50 inline-block px-3 py-0.5 rounded-full border border-pink-100">
                          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Written by {selectedBook.author}</span>
                          <span>•</span>
                          <span>{new Date(selectedBook.updatedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600">{selectedBook.category || 'Story'}</span>
                        </div>
                      </div>

                      <div className="flex-1 relative overflow-hidden">
                        {/* Current Page Content */}
                        <div className={`absolute inset-0 bg-[#fffbf0] p-8 shadow-sm rounded-2xl border border-pink-50 transition-transform duration-700 transform-style-3d ${isFlipping
                          ? (flipDirection === 'next' ? 'animate-page-flip-out' : 'animate-page-flip-out-prev')
                          : ''
                          }`} style={{ zIndex: isFlipping ? 20 : 10 }}>
                          <div className="h-full font-body text-xl leading-relaxed text-gray-800 whitespace-pre-wrap overflow-y-auto custom-scrollbar pr-4 text-center flex flex-col justify-start pt-4">
                            {selectedBook.pages[currentPage]}
                          </div>
                          {/* Page Number */}
                          <div className="absolute bottom-4 right-6 font-ui text-pink-300 text-sm">
                            {currentPage + 1}
                          </div>
                        </div>

                        {/* Next Page Preview */}
                        {isFlipping && (
                          <div className={`absolute inset-0 bg-[#fffbf0] p-8 shadow-sm rounded-2xl border border-pink-50 transition-transform duration-700 transform-style-3d ${flipDirection === 'next' ? 'animate-page-flip-in' : 'animate-page-flip-in-prev'
                            }`} style={{ zIndex: 10 }}>
                            <div className="h-full font-body text-xl leading-relaxed text-gray-800 whitespace-pre-wrap overflow-y-auto custom-scrollbar pr-4 text-center flex flex-col justify-start pt-4">
                              {flipDirection === 'next'
                                ? selectedBook.pages[currentPage + 1]
                                : selectedBook.pages[currentPage - 1]
                              }
                            </div>
                            <div className="absolute bottom-4 right-6 font-ui text-pink-300 text-sm">
                              {flipDirection === 'next' ? currentPage + 2 : currentPage}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Navigation Controls */}
                      <div className="mt-4 flex justify-between items-center px-8">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 0}
                          className="group flex items-center space-x-2 text-pink-400 hover:text-pink-600 disabled:opacity-30 transition-colors"
                        >
                          <div className="p-2 rounded-full border-2 border-pink-200 group-hover:border-pink-400 group-hover:bg-pink-50">
                            <ChevronLeft className="h-5 w-5" />
                          </div>
                          <span className="font-handwriting text-xl hidden md:inline">Previous</span>
                        </button>

                        <div className="flex space-x-1.5">
                          {selectedBook.pages.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-2 w-2 rounded-full transition-all ${idx === currentPage ? 'bg-pink-500 w-4' : 'bg-pink-200'}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={nextPage}
                          disabled={currentPage === selectedBook.pages.length - 1}
                          className="group flex items-center space-x-2 text-pink-400 hover:text-pink-600 disabled:opacity-30 transition-colors"
                        >
                          <span className="font-handwriting text-xl hidden md:inline">Next</span>
                          <div className="p-2 rounded-full border-2 border-pink-200 group-hover:border-pink-400 group-hover:bg-pink-50">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
