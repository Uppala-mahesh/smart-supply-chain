const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative w-12 h-12">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
      {/* Middle pulsing ring */}
      <div className="absolute inset-2 rounded-full border-2 border-brand-100 border-t-brand-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      {/* Inner gradient circle */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-r from-brand-400 to-cyan-400 opacity-20 animate-pulse"></div>
    </div>
  </div>
);

export default Spinner;
