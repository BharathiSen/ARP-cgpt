export default function HeroVideoBackground() {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div 
        className="absolute inset-0 z-0" 
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.45), rgba(0,0,0,0.65))'
        }}
      ></div>
    </>
  );
}
