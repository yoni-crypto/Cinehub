export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <img src="/logo.png" alt="CineHub" className="max-w-none h-20 mb-8 opacity-80" style={{objectFit: 'contain'}} />
      <div className="flex space-x-2">
        <div className="w-3 h-12 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
        <div className="w-3 h-12 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
        <div className="w-3 h-12 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
      </div>
    </div>
  );
}