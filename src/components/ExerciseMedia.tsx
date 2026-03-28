// src/components/ExerciseMedia.tsx
import { useState } from 'react';

interface ExerciseMediaProps {
  name: string;
  hasVideo?: boolean;
  videoUrl: string | null;
  posterUrl?: string;
  fallbackImageUrl: string | null;
}

export const ExerciseMedia: React.FC<ExerciseMediaProps> = ({
  name,
  hasVideo,
  videoUrl,
  posterUrl,
  fallbackImageUrl,
}) => {
  const [videoError, setVideoError] = useState(false);

  const showVideo = hasVideo !== false && videoUrl && !videoError;

  console.log('MEDIA: ',name); 
  console.log('MEDIA: ',hasVideo); 
  console.log('MEDIA: ',videoUrl); 
  console.log('MEDIA: ',fallbackImageUrl); 

  return (
    <div className="lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        Play Exercise Demo
      </h3>
      {showVideo ? (
        <video
          src={videoUrl}
          controls
          poster={posterUrl}
          className="w-full rounded-xl shadow-2xl"
          preload="metadata"
          onError={() => setVideoError(true)}
        >
          Your browser does not support the video tag.
        </video>
      ) : fallbackImageUrl ? (
        <img
          src={fallbackImageUrl}
          alt={name}
          className="w-full rounded-xl shadow-2xl"
        />
      ) : (
        <div className="aspect-video bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center">
          <p className="text-gray-500">No video available</p>
        </div>
      )}
    </div>
  );
};
