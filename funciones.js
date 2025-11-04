

    /* Unicode de piezas */
    const PIECE_UNICODE = {
    'K':'\u2654','Q':'\u2655','R':'\u2656','B':'\u2657','N':'\u2658','P':'\u2659',
    'k':'\u265A','q':'\u265B','r':'\u265C','b':'\u265D','n':'\u265E','p':'\u265F'
};

    /* Elementos UI */
    const fenEl = document.getElementById('fen');
    const analyzeBtn = document.getElementById('analyze');
    const clearBtn = document.getElementById('clear');
    const errorsEl = document.getElementById('errors');
    const okEl = document.getElementById('ok');
    const boardEl = document.getElementById('board');
    const valPlacement = document.getElementById('valPlacement');
    const valSide = document.getElementById('valSide');
    const valCast = document.getElementById('valCast');
    const valEpp = document.getElementById('valEpp');
    const valHalf = document.getElementById('valHalf');
    const valFull = document.getElementById('valFull');
    const semanticNotesEl = document.getElementById('semanticNotes');

    document.querySelectorAll('.example').forEach(b => b.addEventListener('click', () => fenEl.value = b.dataset.fen));
    clearBtn.addEventListener('click', () => { fenEl.value=''; clearUI(); });

    function clearUI(){
    errorsEl.style.display='none'; errorsEl.innerHTML='';
    okEl.style.display='none';
    boardEl.innerHTML='';
    valPlacement.textContent=''; valSide.textContent=''; valCast.textContent=''; valEpp.textContent=''; valHalf.textContent=''; valFull.textContent='';
    semanticNotesEl.style.display='none'; semanticNotesEl.innerHTML='';
}

    /* MAIN */
    analyzeBtn.addEventListener('click', () => {
    clearUI();
    const fen = fenEl.value.trim();
    if (!fen) return showErrors(['Introduce una cadena FEN.']);
    const parser = new FENRecursiveParser(fen);
    const res = parser.parseFEN();
    if (!res.valid) {
    showErrors(res.errors);
} else {
    okEl.style.display='block';
    showParsed(res);
    renderBoard(res.board);
    if (res.semanticNotes.length) {
    semanticNotesEl.style.display='block';
    semanticNotesEl.innerHTML = '<strong>Notas semánticas:</strong><br>' + res.semanticNotes.map(s=>`• ${escapeHtml(s)}`).join('<br>');
}
}
});

    /* Mostrar errores */
    function showErrors(list){
    errorsEl.style.display='block';
    errorsEl.innerHTML = list.map(l=>`• ${escapeHtml(l)}`).join('<br>');
}

    /* Mostrar parsed fields */
    function showParsed(res){
    valPlacement.textContent = res.parts[0];
    valSide.textContent = res.parts[1];
    valCast.textContent = res.parts[2];
    valEpp.textContent = res.parts[3];
    valHalf.textContent = res.parts[4];
    valFull.textContent = res.parts[5];
}

    /* Dibujar tablero (matrix 8x8 with '' or piece letters) */
    function renderBoard(board){
    boardEl.innerHTML = '';
    for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
    const sq = document.createElement('div');
    sq.className = 'square ' + (((r + c) % 2 === 0) ? 'light' : 'dark');
    const p = board[r][c];
    if (p) sq.textContent = PIECE_UNICODE[p] || p;
    boardEl.appendChild(sq);
}
}
}

    /* Escape html pour seguridad */
    function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

    /* ---------- Parser ---------- */

    class FENRecursiveParser {
    constructor(fen){
    this.input = fen;
    // parts split by whitespace but we'll keep original for errors
    this.parts = fen.split(/\s+/);
    this.errors = [];
    this.semanticNotes = [];
    // board matrix row 0 => rank8, ... row7 => rank1
    this.board = Array.from({length:8}, ()=> Array.from({length:8}, ()=> ''));
}

    /* parseFEN: controla la gramática general recursivamente */
    parseFEN(){
    // Esperamos exactamente 6 campos; en vez de solo comprobar longitud, usamos función recursiva que consume campo por campo
    if (this.parts.length !== 6) {
    this.errors.push(`La cadena FEN debe tener 6 campos separados por espacios. Encontrados: ${this.parts.length}.`);
    return this._result(false);
}

    // Aplicar parsing recursivo por campos: llamamos a parseFields(0)
    const ok = this.parseFields(0);
    if (!ok) return this._result(false);

    // Si no hubo errores sintácticos, realizar comprobaciones semánticas
    this.semanticChecks();

    return this._result(true);
}

    /* parseFields(i): parsea recursivamente el i-ésimo campo (0..5) */
    parseFields(i){
    if (i >= this.parts.length) return true; // base: todo consumido
    const field = this.parts[i];
    switch(i){
    case 0: // Piece Placement (usamos parser recursivo para ranks)
    if (!this.parsePiecePlacement(field)) return false;
    break;
    case 1: // Side to move
    if (!this.parseSide(field)) return false;
    break;
    case 2: // Castling
    if (!this.parseCastling(field)) return false;
    break;
    case 3: // En passant
    if (!this.parseEnPassant(field)) return false;
    break;
    case 4: // Halfmove clock
    if (!this.parseHalfmove(field)) return false;
    break;
    case 5: // Fullmove counter
    if (!this.parseFullmove(field)) return false;
    break;
    default:
    this.errors.push(`Campo desconocido en posición ${i}: "${field}"`);
    return false;
}
    // recursión al siguiente campo
    return this.parseFields(i+1);
}

    /* ---------- Campo 0: Piece Placement  ---------- */
    parsePiecePlacement(text){
    // Debe haber 8 ranks separados por '/'
    const ranks = text.split('/');
    if (ranks.length !== 8) {
    this.errors.push(`<Piece Placement> debe contener 8 filas separadas por '/'. Encontradas: ${ranks.length}.`);
    return false;
}
    // parseRankList recursivo: procesa ranks index 0..7
    return this.parseRankList(ranks, 0);
}

    // parseRankList(ranks, idx) -> procesa rank idx y recursa
    parseRankList(ranks, idx){
    if (idx >= ranks.length) return true; // ya procesadas todas
    const rankStr = ranks[idx];
    if (rankStr.length === 0) {
    this.errors.push(`Fila ${8-idx}: vacía.`);
    return false;
}
    // Validar caracteres (solo piezas y dígitos 1-8)
    if (!/^[PNBRQKpnbrqk1-8]+$/.test(rankStr)) {
    // encontrar primer carácter inválido
    for (let j=0;j<rankStr.length;j++){
    if (!/^[PNBRQKpnbrqk1-8]$/.test(rankStr[j])) {
    this.errors.push(`Fila ${8-idx}: carácter inválido '${rankStr[j]}' en posición ${j+1} (contenido: "${rankStr}").`);
    return false;
}
}
    this.errors.push(`Fila ${8-idx}: contiene caracteres inválidos (contenido: "${rankStr}").`);
    return false;
}
    // parseRank recursivo por caracteres: devuelve count de casillas ocupadas por la fila
    const result = this.parseRankChars(rankStr, 0, 0, idx);
    if (!result.ok) {
    // parseRankChars agrega su propio error
    return false;
}
    if (result.count !== 8) {
    this.errors.push(`Fila ${8-idx}: total de casillas = ${result.count} (debe ser 8). Contenido: "${rankStr}".`);
    return false;
}
    // siguiente fila (recursión)
    return this.parseRankList(ranks, idx+1);
}

    // parseRankChars(str, pos, count, rowIndex) -> recursivo char-by-char
    parseRankChars(str, pos, count, rowIndex){
    // caso base: fin de cadena de la fila
    if (pos >= str.length) {
    return { ok:true, count };
}
    const ch = str[pos];
    if (/\d/.test(ch)) {
    const n = parseInt(ch,10);
    // dígitos 1..8; nota: la BNF permite 1..7 como <digit17> pero filas pueden tener '8' solo como caso especial; sin embargo permitimos 1-8 para flexibilidad.
    if (n < 1 || n > 8) {
    this.errors.push(`Fila ${8-rowIndex}: dígito fuera de rango '${ch}' en posición ${pos+1}.`);
    return { ok:false, count };
}
    count += n;
} else { // pieza
    // si la casilla destino excede 8 -> error
    if (count >= 8) {
    this.errors.push(`Fila ${8-rowIndex}: desbordamiento de casillas (intento de colocar pieza en columna ${count+1}) en "${str}".`);
    return { ok:false, count };
}
    // colocar pieza en la matriz: rowIndex -> r, column = count
    this.board[rowIndex][count] = ch;
    count += 1;
}
    // recursión al siguiente carácter
    return this.parseRankChars(str, pos+1, count, rowIndex);
}

    /* ---------- Campo 1: Side to move ---------- */
    parseSide(text){
    if (!/^[wb]$/.test(text)) {
    this.errors.push(`<Side to move> inválido: debe ser 'w' o 'b'. Encontrado: "${text}".`);
    return false;
}
    return true;
}

    /* ---------- Campo 2: Castling ability ---------- */
    parseCastling(text){
    if (text === '-') return true;
    if (!/^[KQkq]{1,4}$/.test(text)) {
    this.errors.push(`<Castling ability> inválido: debe ser '-' o combinación de K,Q,k,q. Encontrado: "${text}".`);
    return false;
}
    // comprobar repeticiones (recursivo simple)
    function checkDup(s, i, seen){
    if (i >= s.length) return true;
    const ch = s[i];
    if (seen.has(ch)) return false;
    seen.add(ch);
    return checkDup(s, i+1, seen);
}
    if (!checkDup(text, 0, new Set())) {
    this.errors.push(`<Castling ability> inválido: letras repetidas en "${text}".`);
    return false;
}
    return true;
}

    /* ---------- Campo 3: En passant target square ---------- */
    parseEnPassant(text){
    if (text === '-') return true;
    if (!/^[a-h][36]$/.test(text)) {
    this.errors.push(`<En passant> inválido: debe ser '-' o una casilla a3..h3 o a6..h6. Encontrado: "${text}".`);
    return false;
}
    return true;
}

    /* ---------- Campo 4: Halfmove clock ---------- */
    parseHalfmove(text){
    if (!/^\d+$/.test(text)) {
    this.errors.push(`<Halfmove clock> inválido: debe ser un número >= 0. Encontrado: "${text}".`);
    return false;
}
    return true;
}

    /* ---------- Campo 5: Fullmove counter ---------- */
    parseFullmove(text){
    if (!/^[1-9]\d*$/.test(text)) {
    this.errors.push(`<Fullmove counter> inválido: debe ser entero >= 1 sin ceros a la izquierda. Encontrado: "${text}".`);
    return false;
}
    return true;
}

    /* ---------- Comprobaciones semánticas básicas ---------- */
    semanticChecks(){
    // Contar reyes y peones
    let whiteKing = 0, blackKing = 0, whiteP = 0, blackP = 0;
    const pieceCounts = {};
    for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
    const p = this.board[r][c];
    if (!p) continue;
    pieceCounts[p] = (pieceCounts[p]||0) + 1;
    if (p === 'K') whiteKing++;
    if (p === 'k') blackKing++;
    if (p === 'P') whiteP++;
    if (p === 'p') blackP++;
}
}
    if (whiteKing !== 1) this.semanticNotes.push(`Rey blanco presente: ${whiteKing} (debe ser exactamente 1).`);
    if (blackKing !== 1) this.semanticNotes.push(`Rey negro presente: ${blackKing} (debe ser exactamente 1).`);
    if (whiteP > 8) this.semanticNotes.push(`Peones blancos: ${whiteP} (rara posición, normalmente ≤ 8).`);
    if (blackP > 8) this.semanticNotes.push(`Peones negros: ${blackP} (rara posición, normalmente ≤ 8).`);

    // Comprobación
    const enp = this.parts[3];
    if (enp !== '-') {
    const file = 'abcdefgh'.indexOf(enp[0]);
    const rank = parseInt(enp[1],10);
    let plausible = false;
    if (rank === 3) {
    const rowPawns = 4; // index for rank4
    const left = file-1, right = file+1;
    if (left>=0 && (this.board[rowPawns][left] === 'P')) plausible = true;
    if (right<=7 && (this.board[rowPawns][right] === 'P')) plausible = true;
} else if (rank === 6) {
    const rowPawns = 3; // index para rank5/6
    const left = file-1, right = file+1;
    if (left>=0 && (this.board[rowPawns][left] === 'p')) plausible = true;
    if (right<=7 && (this.board[rowPawns][right] === 'p')) plausible = true;
}
    if (!plausible) {
    this.semanticNotes.push(`En passant="${enp}" parece poco probable según la disposición actual (nota heurística).`);
}
}

    // Extra: comprobar suma total de casillas (ya hecho), y que no haya más de 16 piezas por color
    let whiteCount = 0, blackCount = 0;
    for (const [k,v] of Object.entries(pieceCounts)) {
    if (k === k.toUpperCase()) whiteCount += v; else blackCount += v;
}
    if (whiteCount > 16) this.semanticNotes.push(`Total de piezas blancas = ${whiteCount} (norma: ≤ 16).`);
    if (blackCount > 16) this.semanticNotes.push(`Total de piezas negras = ${blackCount} (norma: ≤ 16).`);
}

    _result(valid){
    return {
    valid,
    errors: this.errors,
    semanticNotes: this.semanticNotes,
    parts: this.parts,
    board: this.board
    };
    }
}
