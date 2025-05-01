import loadingGif from "../assets/loading.GIF";

const Loading = () => {
  return (
    <div className="w-full h-full bg-black/80 absolute top-0 left-0 flex flex-col gap-1 items-center justify-center">
      <img
  src={loadingGif}
  alt="Loading..."
  className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-[32rem] max-h-[80vh] object-contain mb-10"
/>
      <p className="text-white text-2xl font-bold tracking-widest">
        Loading...
      </p>
    </div>
  );
};

export default Loading;
