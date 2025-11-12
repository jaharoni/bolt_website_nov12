import React from "react";
import SearchBarNew from "./SearchBarNew";

interface SearchBarSimpleProps {
  compact?: boolean;
  onOpenChat?: (query: string) => void;
}

const SearchBarSimple: React.FC<SearchBarSimpleProps> = ({ compact = false }) => {
  return <SearchBarNew compact={compact} />;
};

export default SearchBarSimple;
