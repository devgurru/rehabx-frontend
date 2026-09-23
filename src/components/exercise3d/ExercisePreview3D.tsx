import { Canvas } from '@react-three/fiber';
import { Pause, Play, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChildAvatar } from './ChildAvatar';
import { MOTIONS, hasMotion } from './motion';

interface ExercisePreview3DProps {
  motionKey: string | null;
  className?: string;
  compact?: boolean;
}

/** Looping 3D demonstration of an exercise — the same guide caregivers follow on mobile. */
export default function ExercisePreview3D({
  motionKey,
  className,
  compact,
}: ExercisePreview3DProps) {
  const [playing, setPlaying] = useState(true);

  if (!hasMotion(motionKey)) {
    return (
      <div
        className={cn(
          'bg-muted/40 text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm',
          className,
        )}
      >
        <Sparkles className="text-primary size-5" aria-hidden />
        3D guide for this exercise is on the roadmap. Step-by-step instructions are shown to the
        caregiver.
      </div>
    );
  }

  const motion = MOTIONS[motionKey];
  return (
    <div
      className={cn(
        'ring-border relative overflow-hidden rounded-xl bg-gradient-to-b from-[#eaf5f6] to-[#f8fafc] ring-1',
        className,
      )}
    >
      <Canvas
        camera={{ position: [1.9, 1.55, 4.1], fov: 38 }}
        dpr={[1, 2]}
        onCreated={({ camera }) => camera.lookAt(0, 1.05, 0)}
        aria-label={`3D demonstration: ${motion.label}`}
        role="img"
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <ChildAvatar motion={motion} playing={playing} />
      </Canvas>
      {!compact && (
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="text-accent-foreground rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
            AI / 3D guide · demo
          </span>
          <Button
            size="icon-sm"
            variant="secondary"
            className="bg-white/85 shadow-sm backdrop-blur"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause demonstration' : 'Play demonstration'}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
        </div>
      )}
    </div>
  );
}
