import React, { useState, useRef, useEffect } from "react";
import "./ActionDropdown.css";

const ActionDropdown = ({
  label = "",
  icon = "",
  items = [],
  children, // ✅ custom trigger support
}) => {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  const handleClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }

    setOpen(false);
  };

  // ✅ Close on outside click

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="action-dropdown" ref={dropdownRef}>
      {/* ✅ Trigger */}

      {children ? (
        <div
          onClick={toggleDropdown}
          className="action-dropdown-custom-trigger"
        >
          {children}
        </div>
      ) : (
        <button className="action-dropdown-btn" onClick={toggleDropdown}>
          {icon && <i className={`bi bi-${icon}`} />}

          {label && <span>{label}</span>}
        </button>
      )}

      {/* ✅ Menu */}

      {open && (
        <ul className="action-dropdown-menu">
          {items.map((item, index) => (
            <li
              key={index}
              onClick={() => handleClick(item)}
              className="action-dropdown-item"
            >
              {item.icon && <i className={`bi bi-${item.icon}`} />}

              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActionDropdown;
