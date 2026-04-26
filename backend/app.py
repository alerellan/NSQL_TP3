from redis import Redis
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

r = Redis(host='redis', port=6379, decode_responses=True)

def precarga():
    lugares = {
        "cervecerias": [
            ("Antares",-30.750, -57.983),
            ("Patagornia",-30.752, -57.981),
            ("Crunch",-30.755, -57.985)
        ],
        "universidades": [
            ("UADER",-30.759, -57.989),
            ("FCYT",-30.757, -57.987),
        ],
        "farmacias": [
            ("Sol",-30.751, -57.981),
            ("Del pueblo",-30.740, -57.973),
            ("Mi familia",-30.740, -57.983)
        ],
        "emergencias": [
            ("Servir",-30.760, -57.983),
            ("barbiei",-30.742, -57.983)
        ],
        "supermercados": [
            ("Super Fu",-30.743, -57.983),
            ("VEA",-30.744, -57.983)
        ]
    }
    for categoria, lista in lugares.items():
        for nombre, lat, lon in lista:
            r.geoadd(categoria, (lon, lat, nombre))



@app.route("/agregar", methods=['POST'])
def agregar():
    data = request.get_json(force=True)
    
    categoria = data.get("categoria").lower().replace("í","i")
    nombre = data.get("nombre")
    lat = data.get("lat")
    lon = data.get("lon")
     
    if not categoria or not nombre or not lat or not lon:
        return jsonify({"error": "Faltan parametros"}), 400
    
    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({"error":"Lat/Lon invalidos"}), 400
    
    #guardamos en redis
    r.geoadd(categoria, (lon, lat, nombre))
    return jsonify({"mensaje":f"{nombre} agregado en {categoria}"})


@app.route("/buscar", methods=["POST"])
def buscar():
    data = request.json
    categoria = data["categoria"]
    lon = float(data["lon"])
    lat = float(data["lat"])

    if not r.exists(categoria):
        return jsonify({"error": "Categoria no existe"}), 400
    
    lugares = r.georadius(categoria, lon, lat, 50, unit="km", withdist=True)
    resultado = []

    for lugar in lugares:
        nombre = lugar[0]
        dist = lugar[1]
        
        resultado.append({
            "nombre": nombre,
            "distancia_km": float(dist),
            "cercano": float(dist) <= 5
        })

    return jsonify(resultado)

@app.route('/')
def home():
    return jsonify({"mensaje":"Api Turismo funcionando"})

precarga()

#print("cervecerias",r.zrange("cervecerias", 0 ,-1))

if __name__== '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)