import os
from openai import OpenAI

from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

chat_api = Blueprint("chat_api", __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Asegúrate de que la API key esté en tu archivo .env y cargada correctamente

@chat_api.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@chat_api.route("/api/openai/chat", methods=["OPTIONS"])
def chat_options():
    return '', 204

@chat_api.route("/api/openai/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "El mensaje está vacío."}), 400
    
    if os.getenv("DEVELOPMENT_MODE","true").lower() == "true":
    
            user_lower = user_message.lower()
            
            if any(word in user_lower for word in ['receta', 'cocinar', 'preparar', 'ingredientes']):
                simulated_reply = f"🍳 **Receta sugerida para '{user_message}':**\n\n**Ingredientes:**\n- Proteína magra (pollo, pescado o tofu)\n- Verduras frescas de temporada\n- Granos integrales (quinoa, arroz integral)\n- Especias naturales\n\n**Preparación:**\n1. Cocina la proteína a la plancha con hierbas\n2. Saltea las verduras ligeramente\n3. Acompaña con granos integrales\n\n💡 **Tip nutricional:** Esta combinación aporta proteínas completas, fibra y vitaminas esenciales."
            
            elif any(word in user_lower for word in ['dieta', 'adelgazar', 'peso', 'calorías']):
                simulated_reply = f"⚖️ **Consejos nutricionales para '{user_message}':**\n\n**Principios clave:**\n- Déficit calórico moderado (300-500 cal/día)\n- 5-6 comidas pequeñas al día\n- Hidratación abundante (2-3L agua/día)\n- Proteína en cada comida\n\n**Alimentos recomendados:**\n- Verduras de hoja verde\n- Proteínas magras\n- Frutas con fibra\n- Frutos secos (moderadamente)\n\n🎯 **Meta:** Pérdida sostenible de 0.5-1kg por semana."
            
            elif any(word in user_lower for word in ['alergia', 'intolerancia', 'celíaco', 'lactosa']):
                simulated_reply = f"🚨 **Adaptación para alergias/intolerancias:**\n\n**Para '{user_message}':**\n- Sin gluten: usa harinas de almendra, coco o quinoa\n- Sin lactosa: leches vegetales (avena, almendra)\n- Sin frutos secos: semillas de girasol o calabaza\n- Sin huevo: substitutos como chía o lino\n\n**Alternativas seguras:**\n- Proteínas: pescado, legumbres, quinoa\n- Carbohidratos: batata, arroz, avena\n- Grasas: aguacate, aceite de oliva\n\n✅ **Siempre verifica etiquetas de ingredientes**"
            
            elif any(word in user_lower for word in ['desayuno', 'mañana']):
                simulated_reply = f"🌅 **Desayuno nutritivo para '{user_message}':**\n\n**Opción 1: Bowl energético**\n- Avena con frutas rojas\n- Yogur griego natural\n- Nueces y semillas\n- Miel o stevia\n\n**Opción 2: Tostada saludable**\n- Pan integral\n- Aguacate machacado\n- Huevo pochado\n- Tomate cherry\n\n⚡ **Beneficios:** Energía sostenida, saciedad prolongada, vitaminas y minerales esenciales."
            
            elif any(word in user_lower for word in ['cena', 'noche', 'dormir']):
                simulated_reply = f"🌙 **Cena ligera para '{user_message}':**\n\n**Principios para la noche:**\n- Comida ligera 2-3h antes de dormir\n- Rica en triptófano (favorece el sueño)\n- Baja en grasas saturadas\n\n**Sugerencias:**\n- Salmón con verduras al vapor\n- Sopa de verduras con proteína\n- Ensalada con pollo y aguacate\n- Infusión relajante (manzanilla, valeriana)\n\n😴 **Para mejor descanso:** Evita cafeína, alcohol y comidas pesadas."
            
            elif any(word in user_lower for word in ['ejercicio', 'deporte', 'entrenamiento', 'gym']):
                simulated_reply = f"💪 **Nutrición deportiva para '{user_message}':**\n\n**Pre-entreno (1-2h antes):**\n- Carbohidratos complejos\n- Poca fibra y grasa\n- Hidratación\n\n**Post-entreno (30min después):**\n- Proteína (20-30g)\n- Carbohidratos simples\n- Rehidratación\n\n**Ejemplos:**\n- Pre: Banana con avena\n- Post: Batido de proteína con frutas\n\n🏃‍♂️ **Hidratación:** 500ml agua 2h antes, 200ml cada 15-20min durante ejercicio."
            
            else:
                simulated_reply = f"👨‍🍳 **Chef Bot responde sobre '{user_message}':**\n\nComo chef especializado en nutrición, mi enfoque es crear comidas que sean tanto deliciosas como saludables. \n\n**Principios que sigo:**\n- Ingredientes frescos y de temporada\n- Técnicas de cocción que preserven nutrientes\n- Balance de macronutrientes en cada plato\n- Adaptación a necesidades individuales\n\n💡 **Tip del día:** La clave de una alimentación saludable está en la variedad, el color en el plato y la moderación.\n\n¿Te gustaría que profundice en algún aspecto específico de la nutrición o cocina saludable?"
            print ("Respuesta simulada:", simulated_reply)
            return {"reply": simulated_reply, "status": "success"},200
    
    
    try:
        response = client.chat.completions.create(model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "Eres un chef profesional experto en nutrición. Da recetas sanas y personalizadas según los gustos y alergias del usuario."
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        max_tokens=500,
        temperature=0.7)

        ai_reply = response.choices[0].message.content.strip()
        print("Respuesta de OpenAI:", ai_reply)  # DEBUG en consola backend
        return jsonify({ "reply": ai_reply })

    except Exception as e:
        print("OpenAI error:", e)
        return jsonify({ "reply": "Error al conectar con OpenAI." }), 500
