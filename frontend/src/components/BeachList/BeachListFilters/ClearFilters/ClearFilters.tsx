import { useState } from "react";
import { FaFilterCircleXmark } from "react-icons/fa6";
import type { ClearFiltersProps } from "./interfaces/ClearFilters.interface";
import { getClearFiltersStyles } from "./styles/ClearFilters.styles";

export const ClearFilters = ({ onClear }: ClearFiltersProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const styles = getClearFiltersStyles({ isHovered });

  return (
    <button
      type="button"
      style={styles.button}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClear}
    >
      <FaFilterCircleXmark style={styles.icon} />
      Clear filters
    </button>
  );
};
