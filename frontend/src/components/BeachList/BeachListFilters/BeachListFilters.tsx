import type { FlagColor } from "../../../shared/types/Beach";
import { Tooltip } from "../../Tooltip/Tooltip";
import type { BeachListFiltersProps } from "./interfaces/BeachListFilters.interface";
import { AreaSelect } from "./AreaSelect/AreaSelect";
import {
  getBeachListFiltersStyles,
  getFlagFilterChipStyle,
  getFlagFilterIconStyle,
} from "./styles/BeachListFilters.styles";
import { FaFlag, FaLocationDot, FaMagnifyingGlass } from "react-icons/fa6";

const FLAG_OPTIONS: { flagColor: FlagColor; label: string }[] = [
  { flagColor: "green", label: "Green" },
  { flagColor: "yellow", label: "Yellow" },
  { flagColor: "red", label: "Red" },
];

export function BeachListFilters({
  searchQuery,
  onSearchChange,
  selectedFlags,
  onToggleFlag,
  selectedArea,
  onAreaChange,
  isAreaAutoDetected,
}: BeachListFiltersProps) {
  const styles = getBeachListFiltersStyles();

  return (
    <div style={styles.container}>
      <div style={styles.searchWrapper}>
        <FaMagnifyingGlass style={styles.searchIcon} />
        <input
          type="search"
          value={searchQuery}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search beaches by name…"
          aria-label="Search beaches by name"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.areaRow}>
        <AreaSelect value={selectedArea} onChange={onAreaChange} />

        {isAreaAutoDetected && (
          <span style={styles.areaHint}>
            <FaLocationDot style={{ verticalAlign: "-1.5px", marginRight: 4 }} />
            Near you
          </span>
        )}
      </div>

      <div style={styles.flagRow} role="group" aria-label="Filter by flag color">
        {FLAG_OPTIONS.map(({ flagColor, label }) => {
          const isSelected = selectedFlags.includes(flagColor);
          return (
            <Tooltip key={flagColor} text={`${label} flag`} align="center">
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`${label} flag`}
                style={getFlagFilterChipStyle(flagColor, isSelected)}
                onClick={() => onToggleFlag(flagColor)}
              >
                <FaFlag style={getFlagFilterIconStyle(flagColor, isSelected)} />
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
