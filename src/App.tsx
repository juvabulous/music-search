import { useEffect, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { ArtistCard } from "./components/ArtistCard";
import type { Artist } from "./components/ArtistCard";
import { SuggestionChips } from "./components/SuggestionChips";
import { Download, Loader2 } from "lucide-react";

const POPULAR_ARTISTS = [
  "Taylor Swift",
  "Queen",
  "Drake",
  "Adele",
  "Imagine Dragons",
  "Beyoncé",
  "Coldplay",
  "Ariana Grande",
];

// ---------- Types ----------
type ITunesArtistResult = {
  artistId: number;
  artistName: string;
  artistLinkUrl?: string;
  primaryGenreName?: string;
};

type ITunesAlbum = {
  wrapperType?: string;
  releaseDate?: string;
  artworkUrl100?: string;
  collectionName?: string;
};

// ---------- Helpers ----------
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isITunesAlbum(x: unknown): x is ITunesAlbum {
  return isObject(x);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// fetch albums sorted by release date
async function fetchNewestAlbum(artistId: number): Promise<ITunesAlbum | null> {
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=200&sort=recent`
  );
  if (!res.ok) return null;

  const json: unknown = await res.json();
  const results =
    isObject(json) && Array.isArray((json as any).results)
      ? ((json as any).results as unknown[])
      : [];

  const albums: ITunesAlbum[] = results.filter(isITunesAlbum);

  let newest: ITunesAlbum | null = null;
  let newestDate = new Date(0);

  for (const item of albums) {
    if (item.wrapperType === "collection" && item.releaseDate) {
      const d = new Date(item.releaseDate);
      if (d > newestDate) {
        newestDate = d;
        newest = item;
      }
    }
  }

  return newest;
}

// fetch album cover of the first result
async function fetchSongArtwork(term: string): Promise<string | undefined> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`
  );
  if (!res.ok) return undefined;

  const data = await res.json();
  const first = data.results?.[0];
  const url = first?.artworkUrl100 ? String(first.artworkUrl100) : undefined;
  return url ? url.replace("100x100", "200x200") : undefined;
}

// create csv
function toCsvRow(values: string[]) {
  return values.map((v) => `"${(v ?? "").replaceAll(`"`, `""`)}"`).join(",");
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(toCsvRow).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [suggestions, setSuggestions] = useState<
    Array<{ name: string; albumCover?: string }>
  >(POPULAR_ARTISTS.map((name) => ({ name })));
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  // search for an artist
  const searchArtists = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const artistResponse = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          trimmed
        )}&entity=musicArtist`
      );

      if (!artistResponse.ok) throw new Error(`HTTP ${artistResponse.status}`);

      const artistJson: unknown = await artistResponse.json();
      const rawResults =
        isObject(artistJson) && Array.isArray((artistJson as any).results)
          ? ((artistJson as any).results as unknown[])
          : [];

      const baseArtists: ITunesArtistResult[] = rawResults
        .filter(isObject)
        .map((a) => ({
          artistId: Number((a as any).artistId),
          artistName: String((a as any).artistName ?? ""),
          artistLinkUrl: (a as any).artistLinkUrl,
          primaryGenreName: (a as any).primaryGenreName,
        }))
        .filter(
          (a) =>
            Number.isFinite(a.artistId) &&
            a.artistId > 0 &&
            a.artistName.length > 0
        );

      setArtists(
        baseArtists.map((a) => ({
          artistId: a.artistId,
          artistName: a.artistName,
          artistLinkUrl: a.artistLinkUrl ?? "",
          primaryGenreName: a.primaryGenreName ?? "",
        }))
      );

      const enriched: Artist[] = [];

      for (const a of baseArtists) {
        await sleep(120);

        try {
          const newestAlbum = await fetchNewestAlbum(a.artistId);

          let artworkUrl =
            newestAlbum?.artworkUrl100?.replace("100x100", "200x200");

          if (!artworkUrl) {
            artworkUrl = await fetchSongArtwork(a.artistName);
          }

          enriched.push({
            artistId: a.artistId,
            artistName: a.artistName,
            artistLinkUrl: a.artistLinkUrl ?? "",
            primaryGenreName: a.primaryGenreName ?? "",
            artworkUrl100: artworkUrl,
            collectionName: newestAlbum?.collectionName,
            releaseDate: newestAlbum?.releaseDate,
          });
        } catch {
          enriched.push({
            artistId: a.artistId,
            artistName: a.artistName,
            artistLinkUrl: a.artistLinkUrl ?? "",
            primaryGenreName: a.primaryGenreName ?? "",
          });
        }
      }

      setArtists(enriched);
    } catch (error) {
      console.error("Error searching artists:", error);
      setArtists([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => searchArtists(searchQuery);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    searchArtists(suggestion);
  };

  const handleResetToHome = () => {
    setHasSearched(false);
    setArtists([]);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportCsv = () => {
    const header = [
      "Id",
      "Künstlername",
      "Genre",
      "Link zu iTunes",
      "Neustes Album",
      "Erscheinungsdatum neustes Album",
      "Bild URL",
    ];

    const rows = artists.map((a) => [
      String(a.artistId),
      a.artistName ?? "",
      a.primaryGenreName ?? "",
      a.artistLinkUrl ?? "",
      a.collectionName ?? "",
      a.releaseDate ?? "",
      a.artworkUrl100 ?? "",
    ]);

    const safeName = (searchQuery.trim() || "artists").replaceAll(/\s+/g, "_");
    downloadCsv(`klangkompass_${safeName}.csv`, [header, ...rows]);
  };

  const loadSuggestions = async () => {
    if (suggestionsLoaded) return;

    const artistSuggestions: Array<{ name: string; albumCover?: string }> = [];

    for (const artistName of POPULAR_ARTISTS) {
      try {
        const cover = await fetchSongArtwork(artistName);

        artistSuggestions.push({
          name: artistName,
          albumCover: cover,
        });

        await sleep(150);
      } catch {
        artistSuggestions.push({ name: artistName });
      }
    }

    setSuggestions(artistSuggestions);
    setSuggestionsLoaded(true);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="pt-16 pb-10 text-center">
        <div className="container mx-auto px-6 py-6">
          <h1
            onClick={handleResetToHome}
            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
          >
            Klangkompass
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Auf Kurs zu deinem nächsten Lieblingskünstler
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Suche nach Interpreten..."
          />
        </div>

        {!hasSearched && (
          <SuggestionChips
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {isSearching && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        )}

        {!isSearching && hasSearched && (
          <div className="max-w-4xl mx-auto">
            {artists.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">
                    Gefunden: {artists.length}{" "}
                    {artists.length === 1 ? "Ergebnis" : "Ergebnisse"}
                  </p>

                  <button
                    onClick={handleExportCsv}
                    disabled={artists.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Ergebnisse herunterladen
                  </button>
                </div>

                <div className="grid gap-4">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.artistId} artist={artist} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  Leider wurde kein Künstler unter diesem Namen gefunden :(
                </p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && !isSearching && (
          <div className="text-center mt-20">
            <p className="text-gray-500 text-lg">
              Entdecke alte und neue Lieblingskünstler
            </p>
          </div>
        )}
      </main>
    </div>
  );
}