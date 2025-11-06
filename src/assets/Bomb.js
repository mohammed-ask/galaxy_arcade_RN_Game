import * as React from "react"
import { Image } from "react-native"
import { gifAssets } from "../screens/constants"

function Bomb({ body }) {
    return (
        <>
            <Image source={gifAssets[4]} style={{ width: 60, height: 60, position: 'absolute', left: body.position.x - 20, top: body.position.y - 20 }} resizeMode='contain' />
            {/* <Image source={require("../assets/imgaes/enemyshield.gif")} style={{ width: 180, height: 180, position: 'absolute', left: body.position.x - 75, top: body.position.y - 80 }} resizeMode='contain' /> */}
        </>
    )
}

export default Bomb
