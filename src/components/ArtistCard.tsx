import { ExternalLink, Music } from "lucide-react";

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
  return (
    <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-4 text-white">
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
          <h3 className="font-semibold text-xl text-gray-900 truncate mb-1">
            {artist.artistName}
          </h3>
          {artist.collectionName && (
            <p className="text-gray-500 text-xs mb-1 truncate">
              Neuste Veröffentlichung: {artist.collectionName}
            </p>
          )}
          <p className="text-gray-600 text-sm mb-3">
            {artist.primaryGenreName}
          </p>
          <a
            href={artist.artistLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Auf iTunes entdecken
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}