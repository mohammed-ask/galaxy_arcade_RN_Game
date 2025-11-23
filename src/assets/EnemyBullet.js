import * as React from "react"
import { Image } from "react-native"
import Svg, { Path } from "react-native-svg"

function EnemyBullet({ body }) {
  return (
    <Image source={require("../assets/imgaes/enemybullet.png")} style={{ width: 20, height: 60, position: 'absolute', left: body.position.x - 5, top: body.position.y - 10 }} resizeMode='contain' />
  )
}

export default EnemyBullet
