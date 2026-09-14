import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MonitorUp, Plus, Search, ArrowRight, History } from 'lucide-react';
import { joinRoom } from '../../lib/api';
import { nanoid } from 'nanoid';

// Simple helper to parse user agent for a friendly device name
const getDeviceName = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  
  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
  else if (ua.indexOf("Trident") > -1) browser = "IE";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  
  if (ua.indexOf("Win") > -1) os = "Windows";
  else if (ua.indexOf("Mac") > -1) os = "Mac";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("like Mac") > -1) os = "iOS";
  
  return `${os} (${browser})`;
};

export default function RoomsList() {
  const [error, setError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [myRooms, setMyRooms] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const joinParam = searchParams.get('join');
    if (joinParam && joinParam.length === 6) {
      setJoinCode(joinParam.toUpperCase());
    }
    
    // Load created rooms history
    try {
      const stored = localStorage.getItem('pdfly_my_rooms');
      if (stored) {
        setMyRooms(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load room history');
    }
  }, [searchParams]);

  const handleJoin = async (roomCode) => {
    if (!roomCode.trim()) return;
    
    try {
      setJoinLoading(true);
      const participantData = {
        participantId: nanoid(),
        displayName: getDeviceName()
      };
      
      const response = await joinRoom(roomCode.trim().toUpperCase(), participantData);
      if (response.success) {
        navigate(`/rooms/${response.data.roomCode}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join room. Please check the code.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rooms</h1>
          <p className="text-gray-600">Join a peer-to-peer sharing session or create your own.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/rooms/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Create Room
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Have a Room Code?</h2>
          <p className="text-xs text-gray-500">Enter the 6-character code to join directly</p>
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Enter Code (e.g. ABCDEF)" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none font-mono uppercase transition-all"
            />
          </div>
          <button 
            onClick={() => handleJoin(joinCode)}
            disabled={joinCode.length !== 6 || joinLoading}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {joinLoading ? '...' : 'Join'}
            {!joinLoading && <ArrowRight size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {myRooms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History size={20} className="text-indigo-600" />
            My Created Rooms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myRooms.map((room) => (
              <div key={room.roomCode} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{room.roomName}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">Code: {room.roomCode}</p>
                </div>
                <button 
                  onClick={() => navigate(`/rooms/${room.roomCode}`, { state: { isHost: true } })}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MonitorUp size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Secure Sharing</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Rooms are strictly private. Enter a code above to join a session, or create a new room to start sharing.
        </p>
        <Link 
          to="/rooms/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Create New Room
        </Link>
      </div>
    </div>
  );
}
