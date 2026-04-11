interface CourseBannerProps {
  bannerUrl?: string | null;
  title: string;
  logoUrl?: string | null;
}

const CourseBanner = ({ bannerUrl, title, logoUrl }: CourseBannerProps) => {
  if (!bannerUrl) return null;

  return (
    <div className="relative w-full h-[45vh] max-h-[500px] overflow-hidden">
      <img
        src={bannerUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      
      {/* Course logo centered */}
      {logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={logoUrl}
            alt={title}
            className="max-h-[40%] max-w-[60%] object-contain drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default CourseBanner;
