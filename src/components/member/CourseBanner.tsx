interface CourseBannerProps {
  bannerUrl?: string | null;
  title: string;
  logoUrl?: string | null;
}

const CourseBanner = ({ bannerUrl, title, logoUrl }: CourseBannerProps) => {
  if (!bannerUrl) return null;

  return (
    <div className="relative w-full h-[80vh] max-h-[900px] overflow-hidden">
      <img
        src={bannerUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      
      {logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={logoUrl}
            alt={title}
            className="max-h-[60%] max-w-[70%] object-contain drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default CourseBanner;
