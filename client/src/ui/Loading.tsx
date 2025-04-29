import loadingGif from "../assets/IMG_0835.GIF";

const Loading = () => {
  return (
    <div className="w-full h-full bg-black/80 absolute top-0 left-0 flex flex-col gap-1 items-center justify-center">
      <img
        src={loadingGif}
        alt="Loading..."
        className="w-96 h-96 object-contain"
      />
    </div>
  );
};

export default Loading;
