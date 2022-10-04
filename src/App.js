import './App.css';
import {useEffect, useRef, useState} from "react";
import Renderer from "./engine/renderer";

function App() {

    const [renderer] = useState(new Renderer())

    const [isMeshView, setIsMeshView] = useState(false)
    const [isAnimation, setIsAnimation] = useState(false)

    const [rotationX, setRotationX] = useState(180)
    const [rotationY, setRotationY] = useState(180)
    const [rotationZ, setRotationZ] = useState(180)

    const [positionX, setPositionX] = useState(50)
    const [positionY, setPositionY] = useState(50)
    const [positionZ, setPositionZ] = useState(50)

    const canvasRef = useRef()

    const OBJECTS = {
        MONKEY: "obj/suzanne.obj",
        TEAPOT: "obj/teapot.obj",
        TORUS: "obj/torus.obj",
        COW: "obj/cow.obj",
    }

    useEffect(() => {
        if (canvasRef.current && !renderer.initialized) {
            renderer.init(canvasRef.current)
            loadObj(OBJECTS.TORUS).then(() => {
                toggleAnimation(true)
            })
        }
    }, [])

    const rotateX = (value) => {
        renderer.rotateX(rotationX - value);
        setRotationX(value);
    }

    const rotateY = (value) => {
        renderer.rotateY(rotationY - value);
        setRotationY(value)
    }

    const rotateZ = (value) => {
        renderer.rotateZ(rotationZ - value);
        setRotationZ(value)
    }

    const translateX = (value) => {
        renderer.translateX(positionX - value);
        setPositionX(value)
    }

    const translateY = (value) => {
        renderer.translateY(positionY - value);
        setPositionY(value)
    }

    const translateZ = (value) => {
        renderer.translateZ(positionZ - value);
        setPositionZ(value)
    }

    const toggleMeshView = () => {
        renderer.setMeshView(!isMeshView);
        setIsMeshView(!isMeshView)
    }

    const toggleAnimation = (value) => {
        renderer.setAnimation();
        setIsAnimation(value)
    }

    const loadObj = (obj) => {
        return fetch(obj)
            .then((response) => response.text())
            .then((text) => {
                renderer.loadObj(text)
            });
    }

    const loadCustomObj = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            // get file content
            const content = event.target.result;
            renderer.loadObj(content)
        })
        // read file as text
        reader.readAsText(file);
    }

    return (
        <div>
            <div className="renderer-container">
                <h3 className="renderer-header">ASCII 3D Renderer</h3>

                <canvas id="canvas" ref={canvasRef}
                        width="360" height="360"
                        className="canvas-panel"></canvas>

                <div className="menu-container">
                    <div>
                        <div>Rotate</div>
                        <MenuSlider label="x" min={0} max={360} value={rotationX} onChange={rotateX}/>
                        <MenuSlider label="y" min={0} max={360} value={rotationY} onChange={rotateY}/>
                        <MenuSlider label="z" min={0} max={360} value={rotationZ} onChange={rotateZ}/>
                    </div>
                    <div>
                        <div>Translate</div>
                        <MenuSlider label="x" min={0} max={100} value={positionX} onChange={translateX}/>
                        <MenuSlider label="y" min={0} max={100} value={positionY} onChange={translateY}/>
                        <MenuSlider label="z" min={0} max={100} value={positionZ} onChange={translateZ}/>
                    </div>
                </div>

                <div className="objects-container">
                    <input type="button" value="Torus" onClick={() => loadObj(OBJECTS.TORUS)}/>
                    <input type="button" value="Teapot" onClick={() => loadObj(OBJECTS.TEAPOT)}/>
                    <input type="button" value="Monkey" onClick={() => loadObj(OBJECTS.MONKEY)}/>
                    <input type="button" value="Cow" onClick={() => loadObj(OBJECTS.COW)}/>
                </div>

                <div className="play-container">
                    <div>
                        <input type="file" id="file" style={{display: 'none'}} accept=".obj"
                               onChange={event => loadCustomObj(event)}/>
                        <input type="button" id="loadFileXml" value="Load custom OBJ..."
                               onClick={() => document.getElementById('file').click()}/>
                    </div>
                    <div>
                        <input type="button"
                               value={!isMeshView ? "Mesh View" : "Ascii View"}
                               onClick={toggleMeshView}/>
                        <input type="button" className="play-button"
                               value={!isAnimation ? "▶" : "II"}
                               onClick={() => toggleAnimation(!isAnimation)}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MenuSlider({label, min, max, value, onChange}) {
    return (
        <label className="menu-item">
            <div className="label">({label})</div>
            <input type="range" min={min} max={max}
                   onChange={event => onChange(parseInt(event.target.value))}
                   value={value} className="menu-item-input"/>
        </label>
    );
}

export default App;
