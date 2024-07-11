import references from "./references.js";

export default {

    steps: [
        {
            "text": "Hola, soy Silb.io, el robot que se pone en la cola para hacer cita en la administración pública por tí.\nSi en cualquier momento tienes dudas escribe 'ayuda', y te explicaré como usarme, o presiona el botón de ayuda aquí arriba.",
            "short": "Administración",
            "options": {"type": "info"}
        },
        {
            "text": "¿Con qué administración necesitas la cita?",
            "short": "Administración",
            "options": {"type": "buttons", "content": Object.keys(references.authorities)}
        },
        {
            "text": "Genial, con eso puedo ayudarte. ¿Con qué delegación necesitas la cita?",
            "short": "Delegación",
            "options": {"type": "buttons", "content": references.authorities['Delegaciones del Gobierno']}
        },
        {
            "text": "Entendido, buscaré citas para Extranjería. ¿Necesitas la cita en la provincia de Barcelona o en alguna otra? ,",
            "short": "Provincia",
            "options": {"type": "map", "expert": references.provinces}
        },
        {
            "text": "Cerca de casa, así mejor. ¿Qué trámite necesitas hacer? Con eso podré decirte en qué oficinas lo hacen.",
            "short": "Trámite",
            "options": {"type": "buttons", "content": references.procedures.extranjeria.barcelona.procedures}
        },
        {
            "text": "Perfecto, estas son las oficinas donde lo hacen. Selecciona tantas como te vengan bien.",
            "short": "Oficinas",
            "options": {
                "type": "checkbox",
                "content": references.procedures.extranjeria.barcelona.addresses.filter((address) => {
                    if (Math.random() < 0.75) {
                        return address
                    }
                })
            }
        },
        {
            "text": "Vale, pues para ese trámite me hacen falta los datos del Solicitante. ¿Pasaporte o DNI?",
            "short": "¿Pasaporte o DNI?",
            "options": {"type": "buttons", "content": ["DNI", "Pasaporte"]}
        },
        {
            "text": "¿Qué país ha emitido el pasaporte?",
            "short": "País de emisión",
            "options": {"type": "dropdown", "content": references.countries}
        },
        {
            "text": "Número de pasaporte",
            "options": {"type": "text"}
        },
        {
            "text": "Nombre y Apellidos",
            "options": {"type": "text"}
        },
        {
            "text": "Con esto tengo suficiente información. Me pongo a la cola y te aviso cuando haya encontrado citas disponibles. Si necesitas hacer más citas pulsa aquí.",
            "short": "¿Otra cita?",
            "options": {"type": "reset", "content": "Otra Cita"}
        }
    ]
}

