import logoByb from "@/assets/logo-byb.png";

interface CourseBannerProps {
  bannerUrl?: string | null;
  title: string;
  logoUrl?: string | null;
}

const CourseBanner = ({ bannerUrl, title }: CourseBannerProps) => {
  if (!bannerUrl) return null;

  return (
    <div className="relative w-full h-[45vh] max-h-[500px] overflow-hidden">
      <img
        src={bannerUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      
      {/* Logo centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={logoByb}
          alt="By'b"
          className="h-32 md:h-40 object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default CourseBanner;
