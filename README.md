# Proyecto Final – Tablero de Ajedrez y Parser FEN (JavaScript)

Este proyecto es una aplicación web realizada en **HTML, CSS y JavaScript** que muestra un **tablero de ajedrez** y permite cargar una posición usando la notación **FEN (Forsyth–Edwards Notation)**.  
El programa **valida la cadena FEN** que ingresa el usuario y, si es correcta, dibuja las piezas en el tablero.

---

## Características principales

- Generación dinámica de un **tablero de 8×8** con etiquetas de filas (1–8) y columnas (A–H).
- Entrada de una **cadena FEN** mediante un campo de texto en la página.
- **Parser y validador FEN** que revisa los 6 campos estándar:
  1. Colocación de piezas (piece placement).
  2. Lado al que le toca mover (`w` / `b`).
  3. Posibilidades de enroque.
  4. Casilla de captura al paso.
  5. Contador de medias jugadas (halfmove clock).
  6. Número de jugada completa (fullmove counter).
- Uso de una **función recursiva** (`verificarLetras`) para validar el campo de enroque, comprobando que solo contenga letras válidas.
- Representación de las piezas con **caracteres Unicode** (♟, ♜, ♞, ♝, ♛, ♚, ♙, ♖, ♘, ♗, ♕, ♔).
- Mensajes de error claros cuando la FEN no cumple con el formato esperado (por ejemplo: cantidad incorrecta de casillas en una fila, caracteres inválidos, campos con valores no permitidos, etc.).

> Nota importante: en la versión actual **no se implementa** movimiento interactivo de piezas ni validación de jugadas.  
> El objetivo principal del proyecto es el **análisis y validación de la cadena FEN** y la visualización correspondiente en el tablero.

---

## Archivos del proyecto

- `index.html`  
  Contiene:
  - La estructura de la interfaz (campo de texto para la FEN, botón para procesarla y contenedor del tablero).
  - El código JavaScript que:
    - Construye el tablero en forma de tabla.
    - Parsea y valida la cadena FEN.
    - Dibuja las piezas en las casillas correspondientes cuando la FEN es válida.
    - Muestra mensajes de error cuando la FEN es inválida.

- `style.css`  
  Define los estilos generales de la página:
  - Centrado del contenido en la ventana del navegador.
  - Estilo del contenedor del tablero.
  - Colores de las casillas blancas y negras.
  - Estilo de las etiquetas (filas y columnas).
  - Tipografía y tamaño de las casillas.

---

## Cómo ejecutar el proyecto

1. Coloca todos los archivos del proyecto (`index.html`, `style.css` y cualquier otro recurso adicional) en una misma carpeta.
2. Abre el archivo **`index.html`** con tu navegador web (Chrome, Firefox, Edge, etc.).  
   - No es necesario instalar nada adicional ni levantar un servidor.

---

## Cómo usar la aplicación

1. En el campo de texto de la parte superior de la página, escribe o pega una **cadena FEN** válida.  
   - Ejemplo (posición inicial estándar):

     ```text
     rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
     ```

2. Haz clic en el botón asociado al análisis/procesamiento de la FEN (el botón que está junto al campo de texto).
3. Si la FEN es **válida**:
   - El tablero se rellenará con las piezas correspondientes en cada casilla.
   - No se muestran mensajes de error.

4. Si la FEN es **inválida**:
   - Se limpia el tablero (o no se actualiza la posición).
   - Se muestra un mensaje describiendo el error detectado, por ejemplo:
     - “FEN debe tener 6 campos separados por espacios.”
     - “El campo de piezas debe tener 8 filas separadas por '/'."
     - “Carácter inválido en la descripción de una fila.”
     - “La fila X tiene más/menos de 8 casillas.”

---

## Detalles técnicos importantes

- **Función recursiva `verificarLetras(str, index)`**  
  Se utiliza para validar el campo de enroque.  
  - Caso base: si `index` es mayor o igual que la longitud de la cadena, devuelve `true`.
  - Caso recursivo: verifica que el carácter actual sea una letra (`a–z` o `A–Z`) y llama a la función con `index + 1`.
  - Si encuentra un carácter que no sea letra, devuelve `false`.

- **Matriz interna del tablero**  
  Internamente se maneja una estructura 8×8 (`boardMatrix`) que representa el contenido de cada casilla:
  - `null` para casillas vacías.
  - Letras FEN (`'p'`, `'P'`, `'k'`, `'K'`, etc.) para las piezas.
  Esta matriz es la que se usa luego para dibujar las piezas en la tabla HTML.

- **Validación de los campos FEN**  
  El código revisa:
  - Que haya exactamente 8 filas en el campo de colocación de piezas.
  - Que cada fila describa exactamente 8 casillas (sumando dígitos y piezas).
  - Que el campo del turno sea `w` o `b`.
  - Que el campo de enroque sea `-` o una combinación correcta de letras.
  - Que el campo de captura al paso sea `-` o una casilla válida.
  - Que los contadores de halfmove y fullmove sean números enteros válidos.

---

## Autor

- **Nombre:** Stephanie Jaramillo Alzate y Jaisson Steven Merchán Ardila  
- **Curso:** Lenguajes de Programación  
- **Descripción:** Proyecto final que integra HTML, CSS y JavaScript para trabajar con notación FEN, recursividad y validación de cadenas de entrada.
