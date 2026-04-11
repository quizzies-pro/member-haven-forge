interface CourseBannerProps {
  bannerUrl?: string | null;
  title: string;
}

const CourseBanner = ({ bannerUrl, title }: CourseBannerProps) => {
  if (!bannerUrl) return null;

  return (
    <div className="relative w-full aspect-[3/1] max-h-[360px] overflow-hidden">
      <img
        src={bannerUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
    </div>
  );
};

export default CourseBanner;
