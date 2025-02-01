const Button = ({ onClick, disabled, children, variant = 'primary' }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
