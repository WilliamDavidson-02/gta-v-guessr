import { useEffect, useState } from "react";

export default function useResize() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [resize, setResize] = useState(0);

  useEffect(() => {
    const handelResize = () => {
      if (dimensions.width !== window.innerWidth) setResize(window.innerWidth);
      if (dimensions.height !== window.innerHeight)
        setResize(window.innerHeight);

      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handelResize);

    return () => window.addEventListener("resize", handelResize);
  }, []);

  return resize;
}
