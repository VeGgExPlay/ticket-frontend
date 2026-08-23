export default function IosCheckbox({
  checked,
  onChange,
  size = 28,
  variant = 'red',
  id,
  ariaLabel,
  disabled = false,
}) {
  const handleChange = onChange ? (e) => onChange(e.target.checked) : () => {};
  return (
    <span
      className={`ios-checkbox ${variant}`}
      style={{ '--checkbox-size': `${size}px` }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <span className="checkbox-wrapper">
        <span className="checkbox-bg"></span>
        <svg className="checkbox-icon" viewBox="0 0 24 24" fill="none">
          <path
            className="check-path"
            d="M4 12L10 18L20 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </span>
    </span>
  );
}
