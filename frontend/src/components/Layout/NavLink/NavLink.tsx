import { useState } from "react";
import { Link } from "react-router-dom";
import type { NavLinkProps } from "./interfaces";
import { getNavLinkStyles } from "./styles/NavLink.styles";

/**
 * Header nav link — a pill that lifts on hover/focus. Collapses the three
 * near-identical Dashboard/Beaches/Saved links in Layout into one component
 * that owns its own hover/focus state, instead of Layout hoisting a
 * useState pair per link.
 */
export const NavLink = ({ to, children }: NavLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const style = getNavLinkStyles({ isHovered, isFocused });

  return (
    <Link
      to={to}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
    </Link>
  );
};
