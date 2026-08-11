import { useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { BEACH_AREAS } from "../../../../shared/types/Beach";
import { useDismissibleMenu } from "../../../../shared/hooks/useDismissibleMenu";
import type { SelectedArea } from "../../hooks/useBeachFilters";
import type { AreaSelectProps } from "./interfaces/AreaSelect.interface";
import { getAreaSelectStyles, getAreaSelectOptionStyle } from "./styles/AreaSelect.styles";

const ALL_AREAS_LABEL = "All Areas";

// Stands in for a native <select> so the open list can actually be styled — a native <select>'s
// popup is OS/browser chrome that page CSS can't reach (e.g. can't be given rounded corners).
export function AreaSelect({ value, onChange }: AreaSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<SelectedArea | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissibleMenu(containerRef, open, setOpen);
  const styles = getAreaSelectStyles();

  const label = value === "all" ? ALL_AREAS_LABEL : value;

  function handlePick(area: SelectedArea) {
    onChange(area);
    setOpen(false);
  }

  return (
    <div style={styles.container} ref={containerRef}>
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setOpen(wasOpen => !wasOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by area"
      >
        <span>{label}</span>
        <FaChevronDown style={styles.chevron} aria-hidden="true" />
      </button>

      {open && (
        <ul style={styles.menu} role="listbox" aria-label="Filter by area" onMouseLeave={() => setHoveredArea(null)}>
          <li role="option" aria-selected={value === "all"}>
            <button
              type="button"
              style={getAreaSelectOptionStyle({ selected: value === "all", hovered: hoveredArea === "all", position: "first" })}
              onMouseEnter={() => setHoveredArea("all")}
              onClick={() => handlePick("all")}
            >
              {ALL_AREAS_LABEL}
            </button>
          </li>
          {BEACH_AREAS.map((area, index) => (
            <li key={area} role="option" aria-selected={value === area}>
              <button
                type="button"
                style={getAreaSelectOptionStyle({
                  selected: value === area,
                  hovered: hoveredArea === area,
                  position: index === BEACH_AREAS.length - 1 ? "last" : "middle",
                })}
                onMouseEnter={() => setHoveredArea(area)}
                onClick={() => handlePick(area)}
              >
                {area}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
