import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dataImage, setDataImage] = useState({});
  fetch('https://jsonplaceholder.typicode.com/photos')
  .then(response => response.json())
  .then(data => {
    // Hacer algo con los datos obtenidos
    setDataImage(data);
  })
  .catch(error => {
    // Manejar errores de la solicitud
    console.error('Error:', error);
  });

  const addMoveable = () => {
    const fills= ["fill", "cover", "contain"];
    const randomFit= fills[Math.floor(Math.random()*fills.length)];
    const randomImageUrl = dataImage[Math.floor(Math.random() * dataImage.length)];
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        Image: randomImageUrl,
        fill:randomFit,
        updateEnd: true
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "90vh", width: "90vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        className="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  Image,
  fill,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    fill,
    Image,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    console.log(e);
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = `${e.width}px`;
    let newHeight = `${e.height}px`;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;


    if (positionMaxTop > parentBounds?.height){
      newHeight = parentBounds?.height - top;
    }
    if (positionMaxLeft > parentBounds?.width){
      newWidth = parentBounds?.width - left;
    }

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      Image,
      fill
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    setNodoReferencia({
      ...nodoReferencia,
      top: positionMaxTop,
      left: positionMaxLeft,
    });

  };
  const [dragTarget, setDragTarget] = React.useState();

  React.useEffect(() => {
    setDragTarget(document.querySelector(".parent"));
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position:"absolute",
          top:top,
          left:left,
          width:width,
          height:height,
          backgroundImage:`url(${Image.url})`,
          backgroundSize: fill,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        dragTarget={dragTarget}
        draggable
        snappable
        bounds={{ left: 0, top:0, right: 1536, bottom:806}}
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            Image,
            fill
          });
        }}
        onResize={onResize}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
     
      />
    </>
  );
};
