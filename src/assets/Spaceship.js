import { useEffect, useState } from "react";
import { Image } from "react-native"
import { gifAssets } from "../screens/constants";

function Spaceship({ body, isVisible, showShield, showMagnet, activeShipIcon }) {
  const [blinking, setBlinking] = useState(0.5)

  useEffect(() => {
    if (!isVisible) {
      const interval = setInterval(() => {
        setBlinking((prev) => (prev === 1 ? 0.5 : 1));
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 600);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible]);

  return (
    <>
      <Image source={activeShipIcon} style={{ position: 'absolute', left: body.position.x - 50 / 2, top: body.position.y - 50 / 2, height: 50, width: 50, opacity: isVisible ? 1 : blinking, zIndex: 1 }} />
      {showShield ?
        <Image source={gifAssets[1]} style={{ width: 100, height: 100, position: 'absolute', left: body.position.x - 50, top: body.position.y - 50 }} resizeMode='contain' /> : null}
      {showMagnet ?
        <Image source={gifAssets[2]} style={{ width: 150, height: 150, position: 'absolute', left: body.position.x - 75, top: body.position.y - 75, zIndex: 0 }} resizeMode='contain' /> : null}
    </>
  )
}

export default Spaceship
