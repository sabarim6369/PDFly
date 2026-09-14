import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MonitorUp } from 'lucide-react';
import { createRoom } from '../../lib/api';

export default function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await createRoom({ roomName });
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem('pdfly_my_rooms');
        const myRooms = stored ? JSON.parse(stored) : [];
        myRooms.push({
          roomCode: response.data.roomCode,
          roomName: roomName,
          createdAt: response.data.createdAt
        });
        localStorage.setItem('pdfly_my_rooms', JSON.stringify(myRooms));
      } catch (e) {
        console.error('Failed to save room locally', e);
      }
      
      // Redirect to the room view
      navigate(`/rooms/${response.data.roomCode}`, { state: { isHost: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 md:p-10">
      <Link to="/rooms" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Rooms
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
          <MonitorUp size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Start a Sharing Session</h1>
        <p className="text-gray-600 mb-8">
          Create a secure, peer-to-peer room to share PDFs with up to 10 participants.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Project Alpha Review"
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || !roomName.trim()}
            className="w-full flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Room...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
