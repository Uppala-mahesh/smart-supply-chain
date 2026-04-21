const notificationStyles = {
  success: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900 shadow-lg shadow-emerald-500/20',
  error: 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-200 text-rose-900 shadow-lg shadow-rose-500/20',
  info: 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 text-sky-900 shadow-lg shadow-sky-500/20'
};

const notificationIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ'
};

export const Notifications = ({ notifications }) => (
  <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-md flex-col gap-3 p-2">
    {notifications.map((note, index) => (
      <div
        key={`${note.message}-${index}`}
        className={`animate-slide-up rounded-2xl border backdrop-blur-sm p-4 flex gap-3 items-start ${notificationStyles[note.type]}`}
      >
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-lg font-bold">{notificationIcons[note.type]}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{note.type.toUpperCase()}</p>
          <p className="mt-1 text-sm leading-6 opacity-90">{note.message}</p>
        </div>
      </div>
    ))}
  </div>
);
