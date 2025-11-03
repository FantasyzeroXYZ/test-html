import { useState, useCallback } from 'react';

export const useSubtitle = () => {
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const [videoSubtitlesVisible, setVideoSubtitlesVisible] = useState(true);
  const [audioSubtitlesVisible, setAudioSubtitlesVisible] = useState(false);
  const [audioSubtitles, setAudioSubtitles] = useState([]);

  const parseSubtitle = useCallback((content) => {
    const newSubtitles = [];
    const blocks = content.split(/\n\s*\n/);
    
    blocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const timeMatch = timeLine.match(/(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)/);
        
        if (timeMatch) {
          const startTime = 
            parseInt(timeMatch[1]) * 3600 + 
            parseInt(timeMatch[2]) * 60 + 
            parseInt(timeMatch[3]) + 
            parseInt(timeMatch[4]) / 1000;
          
          const endTime = 
            parseInt(timeMatch[5]) * 3600 + 
            parseInt(timeMatch[6]) * 60 + 
            parseInt(timeMatch[7]) + 
            parseInt(timeMatch[8]) / 1000;
          
          const text = lines.slice(2).join(' ').trim();
          
          if (text) {
            newSubtitles.push({
              start: startTime,
              end: endTime,
              text: text
            });
          }
        }
      }
    });
    
    newSubtitles.sort((a, b) => a.start - b.start);
    setSubtitles(newSubtitles);
    setAudioSubtitles(newSubtitles);
  }, []);

  const updateSubtitle = useCallback((currentTime) => {
    if (subtitles.length === 0) {
      setCurrentSubtitleIndex(-1);
      return;
    }
    
    let foundIndex = -1;
    for (let i = 0; i < subtitles.length; i++) {
      if (currentTime >= subtitles[i].start && currentTime < subtitles[i].end) {
        foundIndex = i;
        break;
      }
    }
    
    setCurrentSubtitleIndex(foundIndex);
  }, [subtitles]);

  const getCurrentSubtitle = useCallback(() => {
    return currentSubtitleIndex >= 0 ? subtitles[currentSubtitleIndex] : null;
  }, [currentSubtitleIndex, subtitles]);

  const jumpToSubtitle = useCallback((index, onTimeJump) => {
    if (index >= 0 && index < subtitles.length) {
      onTimeJump(subtitles[index].start);
      setCurrentSubtitleIndex(index);
    }
  }, [subtitles]);

  return {
    subtitles,
    currentSubtitleIndex,
    subtitleVisible,
    videoSubtitlesVisible,
    audioSubtitlesVisible,
    audioSubtitles,
    parseSubtitle,
    updateSubtitle,
    getCurrentSubtitle,
    jumpToSubtitle,
    setSubtitleVisible,
    setVideoSubtitlesVisible,
    setAudioSubtitlesVisible
  };
};