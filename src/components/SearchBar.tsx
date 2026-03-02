import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onSearch, placeholder }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-full border-2 border-gray-300 shadow-lg focus-within:border-purple-500 transition-all bg-white">
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder || "Search for an artist..."}
          className="w-full px-6 py-5 pr-16 text-lg bg-transparent outline-none rounded-full"
        />
  
        <button
          onClick={onSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
  
      </div>
    </div>
  );
}
