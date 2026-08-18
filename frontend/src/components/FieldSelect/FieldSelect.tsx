import { useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import type { FieldSelectProps } from "./interfaces/FieldSelect.interface";
import { useDismissibleMenu } from "../../shared/hooks/useDismissibleMenu";
import {
  getFieldSelectOptionStyle,
  getFieldSelectStyles,
} from "./styles/FieldSelect.styles";

export function FieldSelect<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
}: FieldSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<T | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useDismissibleMenu(containerRef, open, setOpen);

  const styles = getFieldSelectStyles();

  const selectedOption = options.find((option) => option.value === value);
  const label = selectedOption?.label ?? placeholder ?? "";

  function handlePick(option: T) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div style={styles.container} ref={containerRef}>
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{label}</span>

        <FaChevronDown style={styles.chevron} aria-hidden="true" />
      </button>

      {open && (
        <ul
          style={styles.menu}
          role="listbox"
          aria-label={ariaLabel}
          onMouseLeave={() => setHoveredOption(null)}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
            >
              <button
                type="button"
                style={getFieldSelectOptionStyle({
                  selected: value === option.value,
                  hovered: hoveredOption === option.value,
                  position:
                    index === 0
                      ? "first"
                      : index === options.length - 1
                        ? "last"
                        : "middle",
                })}
                onMouseEnter={() => setHoveredOption(option.value)}
                onClick={() => handlePick(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
