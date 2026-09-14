# NexusTours — Mexico Trivia

Trivia mobile-first de 10 preguntas para una campaña QR de NexusTours. Es 100% estática: no requiere app, cuenta, base de datos ni servidor, por lo que funciona muy bien en GitHub Pages.

## Qué incluye

- ES / EN con selector de idioma.
- 10 preguntas, una por pantalla.
- No permite avanzar sin responder.
- Feedback inmediato correcto / incorrecto.
- Puntaje automático.
- Regla promocional:
  - 0–3: sin beneficio; permite reintentar.
  - 4–5: 10% OFF, código interno `VIVA10`.
  - 6–10: 15% OFF, código interno `VIVA15`.
- CTA final a NexusTours con UTM.
- Diseño responsive para iOS / Android.
- Eventos listos para Google Tag Manager mediante `window.dataLayer`.
- `qr.html` para generar el QR de la URL pública una vez desplegada.

## Estructura

```text
index.html
styles.css
questions.js   <- aquí se editan preguntas y respuestas
app.js         <- lógica, scoring, promo y redirección
qr.html        <- generador de QR de producción
assets/
.github/workflows/pages.yml
```

## IMPORTANTE antes de publicar

El requisito dice que el usuario no debe copiar manualmente el cupón. El código ya envía el beneficio en la URL final usando un parámetro centralizado:

```js
promoParamName: 'promocode'
```

El parámetro confirmado es `promocode`. El CTA final agrega automáticamente `promocode=VIVA10` o `promocode=VIVA15` al URL de NexusTours, junto con los UTM configurados, para que el usuario no tenga que copiar el código manualmente.

## Cambiar preguntas

Edita `questions.js`. Cada pregunta debe conservar:

```js
{
  image: 'assets/archivo.png', // o null
  emoji: '🇲🇽',               // fallback opcional
  q: { es: '...', en: '...' },
  options: {
    es: ['A', 'B', 'C'],
    en: ['A', 'B', 'C']
  },
  correct: 0 // índice 0, 1 o 2
}
```

## Probar localmente

Con Python:

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `nexus-mexico-trivia`.
2. Sube todo el contenido de esta carpeta a `main`.
3. En GitHub: **Settings → Pages → Source → GitHub Actions**.
4. El workflow incluido desplegará la página automáticamente.
5. Abre la URL publicada y después visita `/qr.html` para crear el QR.

## Analytics disponibles

Si después agregas Google Tag Manager, ya se emiten estos eventos:

- `trivia_start`
- `trivia_answer`
- `trivia_complete`
- `trivia_book_now`

No se recolectan datos personales por defecto.
