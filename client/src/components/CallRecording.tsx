import React, { useState, useEffect, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface Recording {
  id: number;
  callId: string;
  roomNumber: string;
  duration: string;
  timestamp: string;
  url: string;
  transcription?: string;
}

export const CallRecording: React.FC = () => {
  const { language } = useAssistant();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  useEffect(() => {
    if (selectedRecording) {
      if (audioRef.current) {
        audioRef.current.src = selectedRecording.url;
        audioRef.current.load();
      }
    }
  }, [selectedRecording]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/recordings');
      setRecordings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recordings');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.roomNumber.includes(searchTerm) ||
    recording.callId.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('callRecordings', language as Lang)}
          </h1>
          <Button onClick={fetchRecordings}>
            {t('refresh', language as Lang)}
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder={t('searchRecordings', language as Lang)}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        {/* Audio Player */}
        {selectedRecording && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">
                  {t('room', language as Lang)} {selectedRecording.roomNumber}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedRecording.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {t('duration', language as Lang)}: {selectedRecording.duration}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={handlePlayPause}>
                  {isPlaying ? t('pause', language as Lang) : t('play', language as Lang)}
                </Button>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {selectedRecording.transcription && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    {t('transcription', language as Lang)}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedRecording.transcription}
                  </p>
                </div>
              )}
            </div>

            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </Card>
        )}

        {/* Recordings List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : filteredRecordings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noRecordings', language as Lang)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className={`p-6 cursor-pointer transition-colors ${
                  selectedRecording?.id === recording.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setSelectedRecording(recording)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {t('room', language as Lang)} {recording.roomNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(recording.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {recording.duration}
                  </div>
                </div>
                {recording.transcription && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {recording.transcription}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 