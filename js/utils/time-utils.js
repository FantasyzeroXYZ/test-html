// 时间工具模块 - 负责时间格式化、计算和转换
export class TimeUtils {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        this.init();
    }

    init() {
        console.log('时间工具模块初始化完成');
    }

    // 格式化时间为 MM:SS 或 HH:MM:SS 格式
    formatTime(seconds, showHours = false) {
        if (isNaN(seconds) || seconds < 0) {
            return showHours ? '00:00:00' : '00:00';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (showHours || hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // 格式化时间为毫秒精度
    formatTimeWithMillis(seconds, showHours = false) {
        if (isNaN(seconds) || seconds < 0) {
            return showHours ? '00:00:00.000' : '00:00.000';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        
        if (showHours || hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
        }
    }

    // 解析时间字符串为秒数
    parseTime(timeString) {
        if (!timeString || typeof timeString !== 'string') {
            return 0;
        }
        
        // 处理 MM:SS 格式
        let match = timeString.match(/^(\d+):(\d+)$/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            return minutes * 60 + seconds;
        }
        
        // 处理 HH:MM:SS 格式
        match = timeString.match(/^(\d+):(\d+):(\d+)$/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            return hours * 3600 + minutes * 60 + seconds;
        }
        
        // 处理 MM:SS.mmm 格式
        match = timeString.match(/^(\d+):(\d+)\.(\d+)$/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const millis = parseInt(match[3]);
            return minutes * 60 + seconds + millis / 1000;
        }
        
        // 处理 HH:MM:SS.mmm 格式
        match = timeString.match(/^(\d+):(\d+):(\d+)\.(\d+)$/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const millis = parseInt(match[4]);
            return hours * 3600 + minutes * 60 + seconds + millis / 1000;
        }
        
        // 处理纯数字（秒）
        const seconds = parseFloat(timeString);
        if (!isNaN(seconds)) {
            return seconds;
        }
        
        return 0;
    }

    // 解析SRT时间格式 (HH:MM:SS,mmm)
    parseSRTTime(timeString) {
        const match = timeString.match(/(\d+):(\d+):(\d+),(\d+)/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const millis = parseInt(match[4]);
            return hours * 3600 + minutes * 60 + seconds + millis / 1000;
        }
        return 0;
    }

    // 解析VTT时间格式 (HH:MM:SS.mmm)
    parseVTTTime(timeString) {
        const match = timeString.match(/(\d+):(\d+):(\d+)\.(\d+)/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const millis = parseInt(match[4]);
            return hours * 3600 + minutes * 60 + seconds + millis / 1000;
        }
        return 0;
    }

    // 格式化为SRT时间格式
    formatSRTTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
    }

    // 格式化为VTT时间格式
    formatVTTTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }

    // 计算时间差
    timeDifference(time1, time2) {
        return Math.abs(time1 - time2);
    }

    // 时间加法
    addTime(baseTime, secondsToAdd) {
        return baseTime + secondsToAdd;
    }

    // 时间减法
    subtractTime(baseTime, secondsToSubtract) {
        return Math.max(0, baseTime - secondsToSubtract);
    }

    // 计算百分比位置
    calculatePercentage(currentTime, totalTime) {
        if (totalTime <= 0) return 0;
        return Math.min(100, Math.max(0, (currentTime / totalTime) * 100));
    }

    // 根据百分比计算时间
    calculateTimeFromPercentage(percentage, totalTime) {
        return (percentage / 100) * totalTime;
    }

    // 计算字幕持续时间
    calculateSubtitleDuration(startTime, endTime) {
        return Math.max(0, endTime - startTime);
    }

    // 检查时间是否在范围内
    isTimeInRange(time, startTime, endTime) {
        return time >= startTime && time < endTime;
    }

    // 查找最近的时间点
    findNearestTime(targetTime, timePoints) {
        if (!timePoints || timePoints.length === 0) {
            return -1;
        }
        
        let nearestIndex = 0;
        let minDifference = Math.abs(timePoints[0] - targetTime);
        
        for (let i = 1; i < timePoints.length; i++) {
            const difference = Math.abs(timePoints[i] - targetTime);
            if (difference < minDifference) {
                minDifference = difference;
                nearestIndex = i;
            }
        }
        
        return nearestIndex;
    }

    // 生成时间范围
    generateTimeRange(startTime, endTime, step = 1) {
        const times = [];
        for (let time = startTime; time <= endTime; time += step) {
            times.push(time);
        }
        return times;
    }

    // 计算平均时间
    calculateAverageTime(times) {
        if (!times || times.length === 0) {
            return 0;
        }
        
        const sum = times.reduce((acc, time) => acc + time, 0);
        return sum / times.length;
    }

    // 计算时间中位数
    calculateMedianTime(times) {
        if (!times || times.length === 0) {
            return 0;
        }
        
        const sortedTimes = [...times].sort((a, b) => a - b);
        const middle = Math.floor(sortedTimes.length / 2);
        
        if (sortedTimes.length % 2 === 0) {
            return (sortedTimes[middle - 1] + sortedTimes[middle]) / 2;
        } else {
            return sortedTimes[middle];
        }
    }

    // 人性化时间显示
    formatHumanTime(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}秒`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}分${secs}秒`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return `${hours}小时${minutes}分${secs}秒`;
        }
    }

    // 格式化时间间隔
    formatTimeInterval(startTime, endTime) {
        const duration = this.calculateSubtitleDuration(startTime, endTime);
        return this.formatHumanTime(duration);
    }

    // 计算播放速度调整后的时间
    calculatePlaybackRateTime(originalTime, playbackRate) {
        if (playbackRate <= 0) {
            return originalTime;
        }
        return originalTime / playbackRate;
    }

    // 时间戳转换为日期时间
    timestampToDateTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }

    // 获取当前时间戳（秒）
    getCurrentTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    // 创建时间码对象
    createTimecode(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        
        return {
            totalSeconds: seconds,
            hours: hours,
            minutes: minutes,
            seconds: secs,
            milliseconds: millis,
            formatted: this.formatTime(seconds, hours > 0),
            formattedWithMillis: this.formatTimeWithMillis(seconds, hours > 0),
            srtFormat: this.formatSRTTime(seconds),
            vttFormat: this.formatVTTTime(seconds),
            humanReadable: this.formatHumanTime(seconds)
        };
    }

    // 验证时间格式
    validateTimeFormat(timeString, format = 'auto') {
        if (!timeString || typeof timeString !== 'string') {
            return false;
        }
        
        const formats = {
            mmss: /^\d{1,2}:\d{2}$/,
            hhmmss: /^\d{1,2}:\d{2}:\d{2}$/,
            mmssmmm: /^\d{1,2}:\d{2}\.\d{3}$/,
            hhmmssmmm: /^\d{1,2}:\d{2}:\d{2}\.\d{3}$/,
            srt: /^\d{1,2}:\d{2}:\d{2},\d{3}$/,
            vtt: /^\d{1,2}:\d{2}:\d{2}\.\d{3}$/,
            seconds: /^\d+(\.\d+)?$/
        };
        
        if (format === 'auto') {
            // 自动检测格式
            for (const [fmt, regex] of Object.entries(formats)) {
                if (regex.test(timeString)) {
                    return { isValid: true, format: fmt };
                }
            }
            return { isValid: false, format: 'unknown' };
        } else {
            // 检查特定格式
            const regex = formats[format];
            return { 
                isValid: regex ? regex.test(timeString) : false, 
                format: format 
            };
        }
    }

    // 时间四舍五入
    roundTime(seconds, precision = 1) {
        const factor = Math.pow(10, precision);
        return Math.round(seconds * factor) / factor;
    }

    // 时间取整
    floorTime(seconds, precision = 1) {
        const factor = Math.pow(10, precision);
        return Math.floor(seconds * factor) / factor;
    }

    // 时间向上取整
    ceilTime(seconds, precision = 1) {
        const factor = Math.pow(10, precision);
        return Math.ceil(seconds * factor) / factor;
    }

    // 计算帧率相关时间
    calculateFrameTime(frameNumber, frameRate = 30) {
        return frameNumber / frameRate;
    }

    // 计算时间对应的帧号
    calculateFrameNumber(time, frameRate = 30) {
        return Math.floor(time * frameRate);
    }

    // 生成时间轴标记
    generateTimelineMarks(totalDuration, interval = 30) {
        const marks = [];
        for (let time = 0; time <= totalDuration; time += interval) {
            marks.push({
                time: time,
                label: this.formatTime(time, totalDuration >= 3600),
                position: this.calculatePercentage(time, totalDuration)
            });
        }
        return marks;
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'timeFormatRequested':
                try {
                    const formattedTime = this.formatTime(data.seconds, data.showHours);
                    this.app.notifyModules('timeFormatResult', {
                        seconds: data.seconds,
                        formatted: formattedTime,
                        showHours: data.showHours
                    });
                } catch (error) {
                    console.error('时间格式化错误:', error);
                }
                break;
                
            case 'timeParseRequested':
                try {
                    const seconds = this.parseTime(data.timeString);
                    this.app.notifyModules('timeParseResult', {
                        timeString: data.timeString,
                        seconds: seconds
                    });
                } catch (error) {
                    console.error('时间解析错误:', error);
                }
                break;
                
            case 'timeCalculationRequested':
                try {
                    let result;
                    switch (data.operation) {
                        case 'add':
                            result = this.addTime(data.baseTime, data.value);
                            break;
                        case 'subtract':
                            result = this.subtractTime(data.baseTime, data.value);
                            break;
                        case 'difference':
                            result = this.timeDifference(data.time1, data.time2);
                            break;
                        case 'percentage':
                            result = this.calculatePercentage(data.currentTime, data.totalTime);
                            break;
                        default:
                            throw new Error(`不支持的时间计算操作: ${data.operation}`);
                    }
                    
                    this.app.notifyModules('timeCalculationResult', {
                        operation: data.operation,
                        result: result,
                        input: data
                    });
                } catch (error) {
                    console.error('时间计算错误:', error);
                }
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理资源（如果需要）
    }
}