import SearchBarNew from "./SearchBarNew";

interface SearchBarProps {
  compact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ compact = false }) => {
  return <SearchBarNew compact={compact} />;
};

export default SearchBar;