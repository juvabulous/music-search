interface SuggestionChipsProps {
    suggestions: Array<{
      name: string;
      albumCover?: string;
    }>;
    onSuggestionClick: (suggestion: string) => void;
  }
  
  export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8">
        <p className="text-gray-600 text-sm mb-4">Vorschläge für dich:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              onClick={() => onSuggestionClick(suggestion.name)}
              className="aspect-square rounded-lg overflow-hidden relative group shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              {suggestion.albumCover ? (
                <img
                  src={suggestion.albumCover}
                  alt={suggestion.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
                <p className="text-white font-semibold text-sm leading-tight">
                  {suggestion.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }