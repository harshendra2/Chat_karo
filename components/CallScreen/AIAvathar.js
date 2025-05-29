export default function AIAvathar() {
  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 text-center">
      <div className="w-10 h-10 md:w-20 md:h-20 rounded-full border-2 border-white overflow-hidden mx-auto bg-gray-800">
        <video
          src="/AI.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <p className="mt-1 text-xs md:text-sm font-semibold text-white/80">
        AI Assistant Listening...
      </p>
    </div>
  );
}
