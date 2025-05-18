document.getElementById('integralForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const func = document.getElementById('function').value;
    const lowerBound = parseFloat(document.getElementById('lowerBound').value);
    const upperBound = parseFloat(document.getElementById('upperBound').value);
    const thickness = parseFloat(document.getElementById('thickness').value);

    try {
        const result = trapezoidalRule(func, lowerBound, upperBound, 1000);
        const roundedResult = result.toFixed(2); // Redondear a 2 decimales
        const area = roundedResult; // Área total en unidades cuadradas
        const volume = area * thickness; // Volumen en unidades cúbicas

        const explanation = `El resultado de la integral de ${func} desde ${lowerBound} hasta ${upperBound} es: ${roundedResult}.`;
        const materialNeeded = `Se requiere un volumen de ${volume.toFixed(2)} unidades cúbicas de material para la fabricación de la pieza.`;

        document.getElementById('result').innerText = `${explanation} ${materialNeeded}`;
    } catch (error) {
        document.getElementById('result').innerText = 'Error en el cálculo: ' + error.message;
    }
});