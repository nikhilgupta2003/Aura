/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Home, 
  Library, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Music2, 
  Globe, 
  TrendingUp,
  MoreHorizontal,
  Heart,
  Languages,
  ListMusic,
  Plus,
  Trash2,
  X,
  ArrowLeft,
  Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactPlayer from 'react-player';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  searchSongs, 
  getGlobalHits, 
  getIndianHits, 
  getLyrics, 
  getArtistDetails,
  getAlbumDetails,
  type Song 
} from './services/musicService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Player = (props: any) => {
  const { onDuration, ...rest } = props;
  return (
    <ReactPlayer 
      {...rest} 
      onDuration={onDuration}
      wrapper={({ children, ...wrapperProps }: any) => {
        const { onDuration: _, ...safeProps } = wrapperProps;
        return <div {...safeProps}>{children}</div>;
      }}
    />
  );
};

type View = 'global' | 'indian' | 'search' | 'artist' | 'album';

interface ArtistDetails {
  name: string;
  bio: string;
  topSongs: Song[];
  image: string;
}

interface AlbumDetails {
  title: string;
  artist: string;
  songs: Song[];
  cover: string;
  year: string;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const playerRef = useRef<any>(null);
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);
  const [currentView, setCurrentView] = useState<View>('global');
  const [queue, setQueue] = useState<Song[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistDetails | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDetails | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    loadInitialHits();
  }, []);

  useEffect(() => {
    if (currentSong) {
      fetchLyrics(currentSong);
    } else {
      setLyrics(null);
      setShowLyrics(false);
    }
  }, [currentSong]);

  const loadInitialHits = async () => {
    setIsLoading(true);
    setCurrentView('global');
    const hits = await getGlobalHits();
    setSongs(hits);
    setIsLoading(false);
  };

  const loadIndianHits = async () => {
    setIsLoading(true);
    setCurrentView('indian');
    const hits = await getIndianHits();
    setSongs(hits);
    setIsLoading(false);
  };

  const loadArtist = async (artistName: string) => {
    setIsNavigating(true);
    setCurrentView('artist');
    const details = await getArtistDetails(artistName);
    setSelectedArtist(details);
    setIsNavigating(false);
  };

  const loadAlbum = async (albumName: string, artistName: string) => {
    setIsNavigating(true);
    setCurrentView('album');
    const details = await getAlbumDetails(albumName, artistName);
    setSelectedAlbum(details);
    setIsNavigating(false);
  };

  const fetchLyrics = async (song: Song) => {
    setIsFetchingLyrics(true);
    const result = await getLyrics(song.title, song.artist);
    setLyrics(result);
    setIsFetchingLyrics(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setCurrentView('search');
    const results = await searchSongs(searchQuery);
    setSongs(results);
    setIsLoading(false);
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, { ...song, id: `${song.id}-q-${Date.now()}` }]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentSong(nextSong);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleProgress = (state: any) => {
    if (state.playedSeconds !== undefined) {
      setProgress(state.playedSeconds);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-[#0a0502] text-white font-sans overflow-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#3a1510] rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff4e00] rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 text-[#ff4e00] mb-8">
            <Globe size={32} />
            <span className="text-2xl font-bold tracking-tighter">AURA</span>
          </div>
          
          <nav className="space-y-4">
            <button 
              onClick={loadInitialHits}
              className={cn(
                "flex items-center gap-4 transition-colors w-full text-left",
                currentView === 'global' ? "text-[#ff4e00]" : "text-white/60 hover:text-white"
              )}
            >
              <Home size={20} />
              <span className="font-medium">Home</span>
            </button>
            <button 
              onClick={loadIndianHits}
              className={cn(
                "flex items-center gap-4 transition-colors w-full text-left",
                currentView === 'indian' ? "text-[#ff4e00]" : "text-white/60 hover:text-white"
              )}
            >
              <Globe size={20} />
              <span className="font-medium">Indian Hits</span>
            </button>
            <button className="flex items-center gap-4 text-white/60 hover:text-white transition-colors w-full text-left">
              <TrendingUp size={20} />
              <span className="font-medium">Trending</span>
            </button>
            <button className="flex items-center gap-4 text-white/60 hover:text-white transition-colors w-full text-left">
              <Library size={20} />
              <span className="font-medium">Library</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 px-6 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Your Playlists</p>
          <div className="space-y-2">
            {['Global Vibes', 'Late Night', 'Chill Mix', 'Top 50 India'].map(p => (
              <button key={p} className="block text-sm text-white/60 hover:text-white truncate w-full text-left py-1">
                {p}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header className="p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search songs, artists, or countries..."
              className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-4">
            <button className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <Heart size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff4e00] to-[#3a1510] border border-white/20" />
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {(currentView === 'artist' || currentView === 'album') && !isNavigating && (
            <button 
              onClick={() => setCurrentView('global')}
              className="mb-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          )}

          {isNavigating ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#ff4e00]/20 border-t-[#ff4e00] rounded-full animate-spin" />
            </div>
          ) : currentView === 'artist' && selectedArtist ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row gap-8 items-end">
                <img 
                  src={selectedArtist.image} 
                  alt={selectedArtist.name} 
                  className="w-64 h-64 rounded-full object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-[#ff4e00] font-bold mb-2">Verified Artist</p>
                  <h1 className="text-7xl font-bold tracking-tighter mb-6">{selectedArtist.name}</h1>
                  <p className="text-white/60 max-w-2xl leading-relaxed">{selectedArtist.bio}</p>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold mb-6">Popular Tracks</h2>
                <div className="space-y-2">
                  {selectedArtist.topSongs.map((song, i) => (
                    <div 
                      key={song.id} 
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <span className="w-6 text-center text-white/20 group-hover:text-white">{i + 1}</span>
                      <img src={song.thumbnail} className="w-12 h-12 rounded object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="font-medium">{song.title}</p>
                        {song.album && (
                          <p 
                            className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); loadAlbum(song.album!, song.artist); }}
                          >
                            {song.album}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                          className="p-2 hover:text-[#ff4e00]"
                        >
                          <Plus size={18} />
                        </button>
                        <Heart size={18} className="hover:text-[#ff4e00]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : currentView === 'album' && selectedAlbum ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row gap-8 items-end">
                <img 
                  src={selectedAlbum.cover} 
                  alt={selectedAlbum.title} 
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-[#ff4e00] font-bold mb-2">Album • {selectedAlbum.year}</p>
                  <h1 className="text-7xl font-bold tracking-tighter mb-4">{selectedAlbum.title}</h1>
                  <p 
                    className="text-2xl font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
                    onClick={() => loadArtist(selectedAlbum.artist)}
                  >
                    {selectedAlbum.artist}
                  </p>
                </div>
              </div>

              <section>
                <div className="grid grid-cols-[40px_1fr_auto] px-4 py-2 border-b border-white/10 text-xs uppercase tracking-widest text-white/40 mb-4">
                  <span>#</span>
                  <span>Title</span>
                  <span>Actions</span>
                </div>
                <div className="space-y-1">
                  {selectedAlbum.songs.map((song, i) => (
                    <div 
                      key={song.id} 
                      className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <span className="text-center text-white/20 group-hover:text-white">{i + 1}</span>
                      <div className="flex items-center gap-4">
                        <img src={song.thumbnail} className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                        <p className="font-medium">{song.title}</p>
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                          className="p-2 hover:text-[#ff4e00]"
                        >
                          <Plus size={18} />
                        </button>
                        <Heart size={18} className="hover:text-[#ff4e00]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <section>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-3xl font-bold tracking-tight">
                {currentView === 'search' ? `Results for "${searchQuery}"` : currentView === 'indian' ? "Indian Hits" : "Global Hits"}
              </h2>
              <button className="text-sm text-[#ff4e00] hover:underline">Show all</button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-white/5 rounded-2xl mb-4" />
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <AnimatePresence mode="popLayout">
                  {songs.map((song, index) => (
                    <motion.div
                      key={song.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
                        <img 
                          src={song.thumbnail} 
                          alt={song.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                            title="Add to Queue"
                          >
                            <Plus size={20} />
                          </button>
                          <div 
                            className="w-12 h-12 bg-[#ff4e00] rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                            onClick={() => playSong(song)}
                          >
                            <Play fill="white" size={24} />
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold truncate">{song.title}</h3>
                      <p 
                        className="text-sm text-white/40 truncate hover:text-[#ff4e00] transition-colors cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); loadArtist(song.artist); }}
                      >
                        {song.artist}
                      </p>
                      {song.album && (
                        <p 
                          className="text-xs text-white/20 truncate hover:text-white transition-colors cursor-pointer mt-1"
                          onClick={(e) => { e.stopPropagation(); loadAlbum(song.album!, song.artist); }}
                        >
                          {song.album}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}
      </div>
    </main>

      {/* Lyrics Overlay */}
      <AnimatePresence>
        {showLyrics && currentSong && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 top-0 bottom-24 bg-black/95 backdrop-blur-3xl z-30 overflow-y-auto custom-scrollbar p-12"
          >
            <div className="max-w-3xl mx-auto">
              <button 
                onClick={() => setShowLyrics(false)}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
              >
                <MoreHorizontal size={32} />
              </button>
              
              <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title} 
                  className="w-64 h-64 rounded-2xl shadow-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-5xl font-bold mb-4">{currentSong.title}</h2>
                  <p className="text-2xl text-white/60">{currentSong.artist}</p>
                </div>
              </div>

              <div className="text-3xl md:text-4xl font-medium leading-relaxed text-white/80 whitespace-pre-wrap">
                {isFetchingLyrics ? (
                  <div className="space-y-4">
                    <div className="h-8 bg-white/5 rounded w-full animate-pulse" />
                    <div className="h-8 bg-white/5 rounded w-5/6 animate-pulse" />
                    <div className="h-8 bg-white/5 rounded w-4/6 animate-pulse" />
                    <div className="h-8 bg-white/5 rounded w-full animate-pulse" />
                  </div>
                ) : (
                  lyrics || "Lyrics not found."
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Overlay */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed top-0 right-0 bottom-24 w-80 bg-black/90 backdrop-blur-3xl z-50 border-l border-white/10 flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ListMusic size={20} className="text-[#ff4e00]" />
                Queue
              </h3>
              <button onClick={() => setShowQueue(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {queue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                  <Music2 size={48} />
                  <p className="text-sm">Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((song, i) => (
                    <div key={song.id} className="group flex items-center gap-3 bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <img src={song.thumbnail} className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <p className="text-xs text-white/40 truncate">{song.artist}</p>
                      </div>
                      <button 
                        onClick={() => removeFromQueue(i)}
                        className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {queue.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <button 
                  onClick={() => setQueue([])}
                  className="w-full py-2 text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 flex items-center justify-between z-40">
        {/* Current Song Info */}
        <div className="flex items-center gap-4 w-1/3">
          {currentSong ? (
            <>
              <img 
                src={currentSong.thumbnail} 
                alt={currentSong.title} 
                className="w-14 h-14 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <h4 className="font-medium truncate">{currentSong.title}</h4>
                <p 
                  className="text-xs text-white/40 truncate hover:text-[#ff4e00] cursor-pointer transition-colors"
                  onClick={() => loadArtist(currentSong.artist)}
                >
                  {currentSong.artist}
                </p>
                {/* Lyrics Toggle Button */}
                <button 
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={cn(
                    "text-[10px] uppercase tracking-widest font-bold mt-1 transition-colors flex items-center gap-1",
                    showLyrics ? "text-[#ff4e00]" : "text-white/40 hover:text-white"
                  )}
                >
                  <Languages size={10} />
                  Lyrics
                </button>
              </div>
              <button className="text-white/40 hover:text-[#ff4e00] transition-colors">
                <Heart size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center">
                <Music2 className="text-white/20" />
              </div>
              <div>
                <h4 className="font-medium text-white/20">No song playing</h4>
                <p className="text-xs text-white/10">Select a track to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="flex items-center gap-6">
            <button className="text-white/40 hover:text-white transition-colors">
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              disabled={!currentSong}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <SkipForward size={20} />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-3 text-xs text-white/40">
            <span>{formatTime(progress)}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-[#ff4e00] transition-all"
                style={{ width: `${(progress / duration) * 100}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extra */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <Volume2 size={18} className="text-white/40" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-[#ff4e00] bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
          />
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className={cn(
              "p-2 rounded-full transition-colors",
              showQueue ? "bg-[#ff4e00] text-white" : "text-white/40 hover:text-white"
            )}
            title="Queue"
          >
            <ListMusic size={20} />
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Hidden Player */}
        {currentSong && (
          <div className="hidden">
            <Player
              ref={playerRef}
              url={currentSong.youtubeUrl}
              playing={isPlaying}
              volume={volume}
              onProgress={handleProgress}
              onDuration={setDuration}
              onEnded={playNext}
            />
          </div>
        )}
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
