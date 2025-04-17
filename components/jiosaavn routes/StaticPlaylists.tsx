"use client"
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { Songg } from '@/lib/Types'
import { LucideSkipBack, LucideSkipForward, Pause, Play } from 'lucide-react'

const StaticPlaylists = () => {
    const [songlist, setSonglist] = useState<Songg[]>([])
    const [currentSong, setCurrentSong] = useState<Songg | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)
    const progressInterval = useRef<NodeJS.Timeout>(null)

    const fetchPlaylists = async () => {
        try {
            const res = await axios.get('https://saavn.dev/api/search/songs?query=sonunigam&limit=100')
            const { data } = res.data
            console.log(data.results)
            setSonglist(data.results)
        } catch (error) {
            console.error('Error fetching playlists:', error)
        }
    }

    useEffect(() => {
        fetchPlaylists()
        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current)
        }
    }, [])

    const playSong = (song: Songg) => {
        setCurrentSong(song)
        setIsPlaying(true)

        // Wait for audio element to be ready
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play()
                startProgressTracker()
            }
        }, 0)
    }

    const togglePlayPause = () => {
        if (!currentSong) return

        if (isPlaying) {
            audioRef.current?.pause()
            if (progressInterval.current) clearInterval(progressInterval.current)
        } else {
            audioRef.current?.play()
            startProgressTracker()
        }
        setIsPlaying(!isPlaying)
    }

    const startProgressTracker = () => {
        if (progressInterval.current) clearInterval(progressInterval.current)

        progressInterval.current = setInterval(() => {
            if (audioRef.current) {
                const currentTime = audioRef.current.currentTime
                const duration = audioRef.current.duration || 1
                setProgress((currentTime / duration) * 100)

                if (currentTime >= duration) {
                    setIsPlaying(false)
                    clearInterval(progressInterval.current as NodeJS.Timeout)
                }
            }
        }, 1000)
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !currentSong) return

        const progressBar = e.currentTarget
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
        const progressBarWidth = progressBar.clientWidth
        const percentageClicked = (clickPosition / progressBarWidth) * 100

        const newTime = (percentageClicked / 100) * (audioRef.current.duration || 0)
        audioRef.current.currentTime = newTime
        setProgress(percentageClicked)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="flex flex-col">
            {/* Playlists */}
            <div className="flex-grow overflow-y-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Playlists</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {songlist?.length > 0 ? (
                        songlist.map((song: Songg) => (
                            <div
                                className={`flex flex-col p-3 rounded-lg cursor-pointer transition-all 
                                    ${currentSong?.id === song.id ? 'bg-[rgb(0,255,255)]' : 'hover:bg-[rgb(0,255,255)]'}`}
                                key={song.id}
                                onClick={() => playSong(song)}
                            >
                                <div className="relative aspect-square">
                                    <Image
                                        width={300}
                                        height={300}
                                        className="rounded-md object-cover"
                                        src={song.image[2].url}
                                        alt={song.name}
                                        priority
                                    />
                                </div>
                                <h3 className="font-semibold mt-2 truncate">{song.name}</h3>
                                <p className="text-gray-400 text-sm truncate">{song.primaryArtists}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">Loading songs...</p>
                    )}
                </div>
            </div>

            {/* Custom Playbar */}
            {currentSong && (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-3">
                    <div className="max-w-6xl mx-auto flex flex-col">
                        {/* Progress bar */}
                        <div
                            className="h-1 bg-gray-700 mb-2 cursor-pointer"
                            onClick={handleProgressClick}
                        >
                            <div
                                className="h-full bg-green-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Song info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative h-14 w-14 flex-shrink-0">
                                    <Image
                                        fill
                                        className="rounded-md object-cover"
                                        src={currentSong.image[2].url}
                                        alt={currentSong.name}
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-medium truncate text-white">{currentSong.name}</h4>
                                    <p className="text-gray-400 text-sm truncate">{currentSong.primaryArtists}</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4">
                                <button className="text-gray-400 hover:text-white">
                                    <LucideSkipBack />
                                </button>

                                <button
                                    className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
                                    onClick={togglePlayPause}
                                >
                                    {isPlaying ? (

                                        <Pause />
                                    ) : (

                                        <Play />
                                    )}
                                </button>

                                <button className="text-gray-400 hover:text-white">

                                    <LucideSkipForward />
                                </button>
                            </div>

                            {/* Time and volume */}
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>
                                    {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
                                </span>
                                <span>/</span>
                                <span>
                                    {audioRef.current && !isNaN(audioRef.current.duration)
                                        ? formatTime(audioRef.current.duration)
                                        : '0:00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hidden audio element */}
                    <audio
                        ref={audioRef}
                        src={currentSong.downloadUrl[4].url}
                        onEnded={() => {
                            setIsPlaying(false)
                            if (progressInterval.current) clearInterval(progressInterval.current)
                            setProgress(0)
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default StaticPlaylists