import React, { useState } from 'react';
import Shimmer from './Shimmer';

interface Participant {
  id: string;
  image: string;
  name?: string;
}

interface ParticipantListProps {
  participants: Participant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const getImageKey = (participant: Participant) => `${participant.id}:${participant.image}`;

  const handleImageLoad = (participantId: string) => {
    setLoadedImages((prev) => ({ ...prev, [participantId]: true }));
  };

  const handleImageError = (participantId: string) => {
    setLoadedImages((prev) => ({ ...prev, [participantId]: true }));
  };

  return (
    <div>
      {participants.map((participant) => (
        <div key={participant.id}>
          {!loadedImages[getImageKey(participant)] && <Shimmer />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={participant.image}
            onLoad={() => handleImageLoad(getImageKey(participant))}
            onError={() => handleImageError(getImageKey(participant))}
            alt={participant.name || 'Participant'}
          />
        </div>
      ))}
    </div>
  );
};

export default ParticipantList;






  
