import { Music } from "lucide-react";

export interface Artist {
  artistId: number;
  artistName: string;
  artistLinkUrl: string;
  primaryGenreName: string;
  artworkUrl100?: string;
  collectionName?: string;
  releaseDate?: string;
}

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const url = `https://music.apple.com/artist/id${artist.artistId}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all p-4 cursor-pointer" >
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {artist.artworkUrl100 ? (
            <img
              src={artist.artworkUrl100}
              alt={artist.artistName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xl text-gray-900 mb-1">
            {artist.artistName}
          </h3>
          {artist.collectionName && (
            <p className="text-gray-500 text-xs mb-1">
              Neuste Veröffentlichung: {artist.collectionName}
            </p>
          )}
          <p className="text-gray-600 text-sm mb-3">
            {artist.primaryGenreName}
          </p>
        </div>
      </div>
    </a>
  );
}