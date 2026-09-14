import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Users, CheckCircle2, MonitorUp, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getRoom } from '../../lib/api';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../lib/api';

export default function RoomView() {
  const { code } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHost = location.state?.isHost || false;

  const fetchRoom = async () => {
    try {
      const response = await getRoom(code);
      setRoomData(response.data);
    } catch (err) {
      setError('Room not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    
    // Connect socket for real-time participant updates
    const socket = io(SOCKET_URL);
    socket.emit('join_room', code);
    
    if (!isHost) {
      socket.emit('participant_joined', code);
    }
    
    socket.on('update_participants', () => {
      fetchRoom();
    });

    return () => {
      socket.disconnect();
    };
  }, [code, isHost]);

  const handleCopyCode = () => {
    if (roomData) {
      navigator.clipboard.writeText(roomData.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const roomUrl = roomData ? `${window.location.origin}/rooms?join=${roomData.roomCode}` : '';

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (error || !roomData) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
        <Link to="/rooms" className="text-indigo-600 hover:underline">Return to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/rooms" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Rooms
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{roomData.roomName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-mono font-bold text-xl tracking-wider">
            {roomData.roomCode}
          </div>
          <button 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {isHost ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center border-dashed border-2 bg-indigo-50/30">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MonitorUp size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Host File Sharing Area</h3>
              <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto mb-6">
                Drag and drop PDF files here, or click to upload. Files shared here will be instantly available to all connected participants.
              </p>
              <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                Select Files to Share
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-48 border-dashed border-2 bg-gray-50/50">
              <MonitorUp size={32} className="text-gray-400 mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-900">Waiting for Host...</h3>
              <p className="text-gray-500 text-sm mt-1">Files shared by the host will appear here automatically.</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              Participants
            </h2>
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {roomData.participants.length} / 10
            </span>
          </div>

          {roomData.participants.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <Users size={20} />
              </div>
              <p className="text-gray-500 text-sm">Waiting for others to join...</p>
              <p className="text-gray-400 text-xs mt-2">Share the code or QR</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {roomData.participants.map(p => (
                <li key={p.participantId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-900 text-sm">{p.displayName}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Invite Participants</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm mb-6 inline-block">
                <QRCodeSVG value={roomUrl} size={200} level="M" includeMargin={false} />
              </div>
              <p className="text-sm text-gray-500 mb-8">Scan QR to join instantly from mobile devices</p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {copied ? 'Room Code Copied!' : `Copy Code: ${roomData.roomCode}`}
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(roomUrl);
                    alert('Join link copied to clipboard!');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Share2 size={18} />
                  Copy Invite Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
