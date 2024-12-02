// Referencias a elementos del DOM
const phpCode = document.getElementById('phpCode');
const jsCode = document.getElementById('jsCode');
const btnDelete = document.getElementById('btnDelete');
const btnGenerate = document.getElementById('btnGenerate');
const btnCopy = document.getElementById('btnCopy');

// Función para validar que el código PHP contiene algo válido dentro de las etiquetas <?php ... ?>
const esCodigoPhpValido = (codigo) => {
    // Verificar que el código tenga las etiquetas de apertura y cierre PHP
    const phpRegex = /<\?php([\s\S]*?)\?>/;
    const match = phpCode.value.trim().match(phpRegex);

    if (!match) {
        return false; // Si no contiene <?php ... ?>
    }

    // Obtener el código dentro de las etiquetas <?php ... ?>
    const codigoPhp = match[1].trim();

    // Validar que el código PHP contenga algo significativo, como una variable, función, o clase
    const validPhpContentRegex = /(\$[a-zA-Z_][a-zA-Z0-9_]*|\bfunction\b|\bclass\b|\becho\b)/;
    if (!validPhpContentRegex.test(codigoPhp)) {
        return false; // Si no contiene código PHP válido, como variables, funciones, clases, etc.
    }

    return true; // Si pasa las validaciones
};

// Función para convertir código PHP a JavaScript
const convertirPhpAJs = () => {
    const phpTexto = phpCode.value.trim();

    // Validar que el código PHP sea válido
    if (!esCodigoPhpValido(phpTexto)) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'El código PHP ingresado no es válido. Asegúrese de que contenga código PHP estructuralmente válido.',
        });
        return;
    }

    // Realizar la conversión de PHP a JavaScript
    const jsTexto = phpTexto
        .replace(/<\?php|<\?|\?>/g, '') // Eliminar etiquetas PHP
        .replace(/echo\s+(.*?);/g, 'console.log($1);') // echo a console.log
        .replace(/->/g, '.') // Operador de acceso de objetos
        .replace(/class\s+(\w+)\s*\{/g, 'class $1 {') // Clases
        .replace(/public\s+function\s+(\w+)\((.*?)\)/g, '$1($2)') // Métodos
        .replace(/private\s+function\s+(\w+)\((.*?)\)/g, '#$1($2)') // Métodos privados (# en JS)
        .replace(/function\s+(\w+)\((.*?)\)/g, '$1($2)') // Funciones
        .replace(/array\((.*?)\)/g, '[$1]') // Array PHP a JS
        .replace(/=>/g, ':') // Clave => valor a clave: valor
        .replace(/foreach\s*\((.*?)\s+as\s+\$(\w+)\)/g, 'for (const $2 of $1)') // foreach a for...of
        .replace(/define\((['"`])([a-zA-Z_][a-zA-Z0-9_]*)\1,\s*(.*?)\)/g, 'const $2 = $3') // Constantes
        .replace(/if\s*\((.*?)\):/g, 'if ($1) {') // if estructural
        .replace(/endif;/g, '}') // Cierre de if
        .replace(/else:/g, 'else {') // else
        .replace(/endforeach;/g, '}') // Cierre de foreach
        .replace(/while\s*\((.*?)\):/g, 'while ($1) {') // while estructural
        .replace(/endwhile;/g, '}') // Cierre de while
        .replace(/for\s*\((.*?)\):/g, 'for ($1) {') // for estructural
        .replace(/endfor;/g, '}') // Cierre de for
        .replace(/(\$[a-zA-Z_]\w*)/g, (match, variable, offset, text) => {
            // Excluir parámetros de funciones de la conversión
            const insideFunctionParams = text.substring(0, offset).match(/function\s+\w*\s*\([^)]+$/);
            if (insideFunctionParams) return variable.substring(1); // Mantener como está
            return `let ${variable.substring(1)}`; // Convertir a let
        })
        .replace(/\blet\s+(.*?\(.+?\))/g, '$1') // Corrige variables dentro de parámetros.
        .replace(/(\$[\w]+)\s*\.\=\s*(.*?);/g, '$1 += $2;') // Concatenación en cadenas
        .replace(/(\$[\w]+)\s*\.\s*(.*?);/g, '$1 + $2;') // Concatenación con operador .
        .replace(/strlen\((.*?)\)/g, '$1.length') // strlen a .length
        .replace(/isset\((.*?)\)/g, '$1 !== undefined') // isset a !== undefined
        .replace(/empty\((.*?)\)/g, '(!$1 || $1.length === 0)') // empty a validación de vacío
        .replace(/print\s+(.*?);/g, 'console.log($1);') // print a console.log
        .replace(/\$_(GET|POST|SERVER|COOKIE|SESSION|FILES)\['(.*?)'\]/g, '$1["$2"]'); // Superglobales PHP a objetos JS

    jsCode.value = jsTexto.trim();
};

// Función para limpiar los campos
const limpiarCampos = () => {
    phpCode.value = '';
    jsCode.value = '';
};

// Función para copiar al portapapeles
const copiarTexto = () => {
    if (!jsCode.value) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'No hay código JavaScript para copiar.',
        });
        return;
    }

    navigator.clipboard.writeText(jsCode.value)
        .then(() => Swal.fire({
            icon: 'success',
            title: '¡Copiado!',
            text: 'Código copiado al portapapeles.',
        }))
        .catch(() => Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Error al copiar el texto.',
        }));
};

// Eventos
btnGenerate.addEventListener('click', convertirPhpAJs);
btnDelete.addEventListener('click', limpiarCampos);
btnCopy.addEventListener('click', copiarTexto);
