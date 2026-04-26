import './App.css';
import React, { useState, useEffect} from "react";

function App() {
  //const para la ubicaicon y lugares
  const [ubicacion, setUbicacion] = useState(null);
  const [lugares, setLugares] = useState([]);

  //const para el agregado de lugares
  const [categoria, setCategoria] = useState("cervecerias");
  const [nombre, setNombre] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  //obtenemos unicacion del user
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setUbicacion({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    });
  }, []);

  //buscamos lugares por categoria
  const buscar = (categoria) => {
    if (!ubicacion) return;

    fetch("http://localhost:5000/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoria,
        lat: ubicacion.lat,
        lon: ubicacion.lon
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log("respuesta del back", data);
        setLugares(data);
      })
      .catch(err => console.error("Error al buscar lugar". err));
    }

  //agregar lugar
  const agregarLugar = async () => {
    const data = { categoria, nombre, lon, lat};

    try {
      const response = await fetch("http://localhost:5000/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Respuesta backend:", result);
      alert(`Se envio: ${JSON.stringify(data)}\nRespuesta: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error("Error al agregar lugar", error);
      alert("no se pudo agrgar el lugar");
    }
  };

  return (
    <div className="container">
      <h1>Ver lugares por categoria</h1>

      {!ubicacion && <p>obteniendo ubicacion...</p>}
      {ubicacion && (
        <>
          <div className="categorias">
              <button onClick={()=> buscar("cervecerias")}>Cervecerias</button>
              <button onClick={()=> buscar("universidades")}>Unieversidades</button>
              <button onClick={()=> buscar("farmacias")}>Farmacias</button>
              <button onClick={()=> buscar("emergencias")}>Emergecias</button>
              <button onClick={()=> buscar("supermercados")}>SuperMercados</button>
          </div>
          <ul>
            {lugares.map((l, i) => (
              <li key={i} className="lugar">
              <strong>{l.nombre}</strong><br />
              Distancia: {l.distancia_km?.toFixed(2)} km 
              {l.cercano && <span style={{color: "green"}}> (cerca)</span>}
              </li>
            ))}
          </ul>
          <h1>Agregar punto de interes</h1>
          <form>
            <label>
              Categoria
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="cervecerias">Cervecerias</option>
                <option value="universidades">Universidades</option>
                <option value="farmacias">Farmacias</option>
                <option value="emergencias">Emergencias</option>
                <option value="supermercados">Supermercados</option>
              </select>
            </label>
            <label>
              nombre 
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label>
              Latitud 
              <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} />
            </label>
            <label>
              Longitud 
              <input type="text" value={lon} onChange={(e) => setLon(e.target.value)} />
            </label>
            <button type="button" onClick={agregarLugar}>Agregar</button>
        </form>
      </>
      )}
    </div>
  );
}

export default App;
