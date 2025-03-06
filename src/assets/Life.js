import { useEffect, useState } from "react";
import { Image } from "react-native"

function Life({ body, isVisible }) {
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
        <Image source={require("../assets/imgaes/heart.png")} style={{ width: 30, height: 30, marginHorizontal: 4, marginLeft: 0, opacity: isVisible ? 1 : blinking }} resizeMode='contain' />
    )
}

export default Life
