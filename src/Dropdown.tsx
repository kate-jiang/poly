import { useState, useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}

export function Dropdown<T extends string>({ value, options, onChange }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<CSSProperties>({});

  const selected = options.find(o => o.value === value);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      position: 'fixed',
      left: rect.left,
      bottom: window.innerHeight - rect.top + 4,
      minWidth: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  return (
    <div className="dropdown">
      <button
        ref={triggerRef}
        className={`dropdown-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        {selected?.icon}
        <span className="dropdown-label">
          <span>{selected?.label}</span>
          <span className="dropdown-sizer" aria-hidden="true">
            {options.map(o => <span key={o.value}>{o.label}</span>)}
          </span>
        </span>
      </button>
      {open && createPortal(
        <div className="dropdown-menu" ref={menuRef} style={menuPos}>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`dropdown-item${opt.value === value ? ' active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              type="button"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
