import * as React from "react"
import { Image } from "react-native"

function Bomb({ body }) {
    return (
        <Image source={require("../assets/imgaes/bomb.gif")} style={{ width: 70, height: 70, position: 'absolute', left: body.position.x - 20, top: body.position.y - 20 }} resizeMode='contain' />
    )
}

export default Bomb
