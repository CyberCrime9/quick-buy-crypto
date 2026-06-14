import videoAsset from "@/assets/etsy-vintage-intro.mp4.asset.json";

export function VideoBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <video
        src={videoAsset.url}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-white/70" />
    </div>
  );
}
