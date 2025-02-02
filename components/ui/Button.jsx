/**
 * Button.jsx
 * A reusable, customizable button component with multiple variants and states.
 * Provides consistent styling across the application while allowing for flexible usage.
 * 
 * Features:
 * - Three style variants: primary (blue), secondary (gray), danger (red)
 * - Built-in disabled state handling with visual feedback
 * - Smooth CSS transitions for interactive states
 * - Accessibility-friendly markup
 * 
 * Props:
 * @param {Function} onClick - Callback for click events
 * @param {boolean} [disabled=false] - Controls button interactivity
 * @param {ReactNode} children - Button content (text/elements)
 * @param {string} [variant='primary'] - Style variant (primary/secondary/danger)
 * 
 * Usage Examples:
 * <Button variant="primary" onClick={handleClick}>Submit</Button>
 * <Button variant="danger" disabled={true}>Cancel</Button>
 */

const Button = ({ onClick, disabled, children, variant = 'primary' }) => {
  // Base styling applied to all button variants
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
  
  // Style variants configuration object
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300"
  };

  return (
    <button
      onClick={onClick}  // Click handler passed from parent component
      disabled={disabled}  // Native disabled attribute for accessibility
      className={`
        ${baseStyles}  // Always include base styles
        ${variants[variant]}  // Apply selected variant styles
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}  // Enhanced disabled visuals
      `}
      // Note: Class order matters for Tailwind specificity. 
      // Disabled state styles override normal variants through utility classes
    >
      {children}  {/* Render button content passed between tags */}
    </button>
  );
};

export default Button;
