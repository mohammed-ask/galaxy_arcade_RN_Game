import { useEffect, useState } from "react";
import { Image } from "react-native"

function Spaceship({ body, isVisible }) {
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
      <Image source={require('../assets/imgaes/spaceship.png')} style={{ position: 'absolute', left: body.position.x - 50 / 2, top: body.position.y - 50 / 2, height: 50, width: 50, opacity: isVisible ? 1 : blinking }} />
      {/* <Image source={require("../assets/imgaes/shipshield.gif")} style={{ width: 100, height: 100, position: 'absolute', left: body.position.x - 50, top: body.position.y - 50 }} resizeMode='contain' /> */}
    </>
  )
}

export default Spaceship
