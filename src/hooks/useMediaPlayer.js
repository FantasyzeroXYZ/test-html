import { useState, useRef, useCallback } from 'react';

export const useMediaPlayer = (videoRef, audioRef) => {
  const [currentMediaType, setCurrentMediaType] = useState('video');
  const [trackTitle, setTrackTitle] = useState('请选择媒体文件');
  const [trackDescription, setTrackDescription] = useState('支持 MP4, AVI, MKV, MP3, WAV 等格式');
  const [mediaIcon, setMediaIcon] = useState('▶');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const handlePlayPause = useCallback(() => {
    if (currentMediaType === 'video') {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentMediaType, videoRef, audioRef]);

  const handleTimeUpdate = useCallback(() => {
    const current = currentMediaType === 'video' ? videoRef.current.currentTime : audioRef.current.currentTime;
    setCurrentTime(current);
  }, [currentMediaType, videoRef, audioRef]);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (currentMediaType === 'video') {
      videoRef.current.volume = newVolume;
    } else {
      audioRef.current.volume = newVolume;
    }
  }, [currentMediaType, videoRef, audioRef]);

  const handleTimeJump = useCallback((time) => {
    if (currentMediaType === 'video') {
      videoRef.current.currentTime = time;
    } else {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }, [currentMediaType, videoRef, audioRef]);

  const handleFileSelect = useCallback((file, type) => {
    const fileURL = URL.createObjectURL(file);
    setTrackTitle(file.name.replace(/\.[^/.]+$/, ""));
    setTrackDescription(`文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (type === 'video') {
      setCurrentMediaType('video');
      setMediaIcon('fas fa-video');
      videoRef.current.src = fileURL;
    } else {
      setCurrentMediaType('audio');
      setMediaIcon('fas fa-music');
      audioRef.current.src = fileURL;
    }
  }, [videoRef, audioRef]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (currentMediaType === 'video') {
      videoRef.current.pause();
    } else {
      audioRef.current.pause();
    }
  }, [currentMediaType, videoRef, audioRef]);

  return {
    videoRef,
    audioRef,
    currentMediaType,
    trackTitle,
    trackDescription,
    mediaIcon,
    isPlaying,
    currentTime,
    duration,
    volume,
    handlePlayPause,
    handleTimeUpdate,
    handleVolumeChange,
    handleTimeJump,
    handleFileSelect,
    pause,
    setCurrentMediaType,
    setDuration
  };
};