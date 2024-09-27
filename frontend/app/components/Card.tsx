import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { IoMdAddCircle, IoMdRemoveCircle } from "react-icons/io";

interface CardProps {
  image_uri: string;
  width?: number;
  card_id: string;
  onClick: (c_id: string) => void;
  onAdd: (c_id: string) => void;
  onDiscard: (c_id: string) => void;
  selected: boolean;
  preview: boolean;
}

const Card: React.FC<CardProps> = ({
  image_uri,
  width,
  card_id,
  onClick,
  onAdd,
  onDiscard,
  preview,
  selected,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [textureUri, setTextureUri] = useState("");
  const [isLoading, setIsLoading] = useState(true); // State to manage loading

  useEffect(() => {
    const textureUris = [
      "/img/vmaxbg.jpg",
      "/img/ancient.png",
      "/img/angular.png",
      "/img/cosmos-top-trans.png",
      "/img/geometric.png",
      "/img/illusion.png",
      "/img/metal.png",
      "/img/wave.png",
      "/img/stylish.png",
    ];

    const randomTextureUri =
      textureUris[Math.floor(Math.random() * textureUris.length)];

    setTextureUri(randomTextureUri);
  }, []);

  const stiffness = 100;
  const damping = 30;

  const min_value = -100;
  const max_value = 100;

  const min_rotation = 15;
  const max_rotation = -15;

  const x = useSpring(0, { stiffness, damping });
  const y = useSpring(0, { stiffness, damping });

  const rotateX = useTransform(
    y,
    [min_value, max_value],
    [min_rotation, max_rotation]
  );
  const rotateY = useTransform(
    x,
    [min_value, max_value],
    [min_rotation, max_rotation]
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);

      setMousePosition({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setMousePosition({ x: 50, y: 50 });
  };

  return (
    <div
      className="flex flex-col gap-10 items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(card_id)} // Add this line to handle clicks
    >
      <div
        className={`relative flex shadow-2xl justify-center ${
          preview ? "rounded-lg" : "rounded-2xl"
        }`}
        style={{ perspective: "2000px" }}
      >
        <motion.div
          ref={cardRef}
          className={`w-full h-full relative flex overflow-hidden group`}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, scale: 2 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: selected ? 1.2 : 1,
            transition: { duration: 1.0 }, // Moved transition here
          }} // Modified animate prop with controlled speed
          whileHover={{ scale: selected ? 1.2 : 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }} // Adjusted transition
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner spinner-lg animate-spin"></div>{" "}
              {/* Added animate-spin class */}
            </div>
          )}
          <motion.img
            src={image_uri}
            alt="Card image"
            width={width}
            className={`${preview ? "rounded-lg" : "rounded-2xl"}`}
            style={{
              filter: selected
                ? "brightness(1.1) blur(1px)"
                : "brightness(0.9)",
            }}
            onLoad={() => setIsLoading(false)} // Set loading to false when image loads
          />
          {/* Rainbow Holographic Effect Based on Card Rotation */}
          <motion.div
            className={`${
              preview ? "rounded-lg" : "rounded-2xl"
            } absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 ease-in-out`}
            style={{
              background: `
                conic-gradient(
                  from ${rotateX.get() * 3 + rotateY.get() * 3}deg at 50% 50%, 
                  #ff6ec7, #a45deb, #5bbff7, #28efc2, #f3ff7b, #ff6ec7
                )
              `,
              mixBlendMode: "overlay",
            }}
          />

          {/* Mouse-based Vignette Light Spot */}
          <div
            className={`${
              preview ? "rounded-lg" : "rounded-2xl"
            } absolute inset-0 pointer-events-none opacity-100`}
            style={{
              background: `
                radial-gradient(
                  circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(255, 255, 255, 0.1) 0%, 
                  rgba(255, 255, 255, 0) 50%
                )
              `,
              mixBlendMode: "screen",
            }}
          />

          {/* Texture Layer with Displacement Effect and Mask */}
          <motion.div
            className={`${
              preview ? "rounded-lg" : "rounded-2xl"
            } absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 ease-in-out`}
            style={{
              backgroundImage: `url(${textureUri})`,
              backgroundSize: "60px 60px",
              backgroundRepeat: "repeat",
              mixBlendMode: "screen",
              maskImage: `
                radial-gradient(
                  circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(0, 0, 0, 1) 0%, 
                  rgba(0, 0, 0, 0) 50%
                )
              `,
              WebkitMaskImage: `
                radial-gradient(
                  circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(0, 0, 0, 1) 0%, 
                  rgba(0, 0, 0, 0) 50%
                )
              `,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </motion.div>
        {!preview && selected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: selected ? 1 : 0, y: selected ? 0 : -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(card_id);
                }}
                className="btn text-xs min-w-[120px] btn-success text-white  flex items-center gap-1 shadow-2xl"
              >
                <IoMdAddCircle size={12} />
                <p>Add</p>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard(card_id);
                }}
                className="btn text-xs min-w-[120px] btn-error text-white flex items-center gap-1 bg-zinc-600 border-none shadow-2xl"
              >
                <IoMdRemoveCircle size={12} />
                <p>Discard</p>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Card;
