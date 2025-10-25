import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, X } from "lucide-react"

interface StudyModeProps {
  onExit: () => void
}

export function StudyMode({ onExit }: StudyModeProps) {
  const [isWorkSession, setIsWorkSession] = useState(true)
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 60 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)

  // Work session: 60 minutes, Break session: 5 minutes
  const WORK_TIME = 60 * 60
  const BREAK_TIME = 5 * 60

  useEffect(() => {
    let interval: number

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Session completed - play sound and switch
      playNotificationSound()
      
      if (isWorkSession) {
        // Switch to break
        setIsWorkSession(false)
        setTimeLeft(BREAK_TIME)
      } else {
        // Switch to work
        setIsWorkSession(true)
        setTimeLeft(WORK_TIME)
      }
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isWorkSession, WORK_TIME, BREAK_TIME])

  const playNotificationSound = () => {
    // Simple notification using Web Audio API
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(isWorkSession ? WORK_TIME : BREAK_TIME)
  }

  const switchMode = () => {
    setIsRunning(false)
    const newIsWork = !isWorkSession
    setIsWorkSession(newIsWork)
    setTimeLeft(newIsWork ? WORK_TIME : BREAK_TIME)
  }

  const progress = isWorkSession 
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100

  return (
    <div className="fixed inset-0 z-100 bg-background flex items-center justify-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 p-8">
        {/* Session type indicator */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {isWorkSession ? "🎯 Focus Time" : "☕ Break Time"}
          </h1>
          <p className="text-muted-foreground">
            {isWorkSession 
              ? "Stay focused and get your work done" 
              : "Take a break, you've earned it"}
          </p>
        </div>

        {/* Timer display */}
        <Card className="relative overflow-hidden">
          {/* Progress bar */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 progress-bar"
            style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
          />
          
          
          <div className="p-12">
            <div className="text-center">
              <div className="text-9xl font-bold tabular-nums tracking-tight mb-4">
                {formatTime(timeLeft)}
              </div>
              
              {/* Main controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className="h-14 w-14 rounded-full"
                >
                  {isRunning ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetTimer}
                  className="h-14 w-14 rounded-full"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Subtle controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={switchMode}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Switch to {isWorkSession ? "Break" : "Work"}
          </Button>
          <span className="text-muted-foreground">•</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Exit Study Mode
          </Button>
        </div>
      </div>
    </div>
  )
}
