let chart = null;

function parseUserFunction(input) {
    return input
        .replace(/\^/g, '**') // x^2 -> x**2
        .replace(/(\d)(x)/g, '$1*$2') // 3x -> 3*x
        .replace(/x(?=\d)/g, 'x*') // x2 -> x*2
        .replace(/(\))(\()/g, '$1*$2') // )( -> )*(
        .replace(/(\d)(Math\.)/g, '$1*$2') // 2Math.sin(x) -> 2*Math.sin(x)
        .replace(/\bsin\(/gi, 'Math.sin(')
        .replace(/\bcos\(/gi, 'Math.cos(')
        .replace(/\btan\(/gi, 'Math.tan(')
        .replace(/\bsqrt\(/gi, 'Math.sqrt(')
        .replace(/\bln\(/gi, 'Math.log(')
        .replace(/\bexp\(/gi, 'Math.exp(')
        .replace(/\be\^/gi, 'Math.exp')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\be\b/gi, 'Math.E');
}

document.getElementById('shape').addEventListener('change', function () {
    const shape = this.value;
    const functionInput = document.getElementById('function1');
    const functionInput2 = document.getElementById('function2');

    switch (shape) {
        case 'cilindro':
            functionInput.value = 'pi * x^2';
            functionInput2.value = '';
            break;
        case 'triangulo':
            functionInput.value = '0.5 * x * (x + 1)';
            functionInput2.value = '';
            break;
        case 'aro':
            functionInput.value = 'pi * x^2';
            functionInput2.value = 'pi * (x - 1)^2';
            break;
        case 'cuadrado':
            functionInput.value = 'x^2';
            functionInput2.value = '';
            break;
        default:
            functionInput.value = '';
            functionInput2.value = '';
    }
});

document.getElementById('integralForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const func1 = document.getElementById('function1').value.trim();
    const func2 = document.getElementById('function2').value.trim();
    const lowerBound = parseFloat(document.getElementById('lowerBound').value);
    const upperBound = parseFloat(document.getElementById('upperBound').value);
    const thickness = parseFloat(document.getElementById('thickness').value);

    const loader = document.getElementById('loader');
    const resultDiv = document.getElementById('result');
    const canvas = document.getElementById('grafica');

    loader.style.display = 'block';
    resultDiv.innerHTML = '';
    canvas.style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    setTimeout(() => {
        try {
            let area;
            if (!func2) {
                area = trapezoidalRule(x => evaluateFunction(func1, x), lowerBound, upperBound, 1000);
                const volume = area * thickness;
                resultDiv.innerHTML = `
                    <h5>Resultados</h5>
                    <p><strong>Función:</strong> ${func1}</p>
                    <p><strong>Límites:</strong> desde ${lowerBound} hasta ${upperBound}</p>
                    <p><strong>Área bajo la curva:</strong> ${area.toFixed(4)}</p>
                    <p><strong>Espesor:</strong> ${thickness}</p>
                    <p><strong>Volumen:</strong> ${volume.toFixed(4)} unidades cúbicas</p>
                `;
                plotSingleFunction(func1, lowerBound, upperBound);
            } else {
                function diffFunc(x) {
                    return Math.abs(evaluateFunction(func1, x) - evaluateFunction(func2, x));
                }
                area = trapezoidalRule(diffFunc, lowerBound, upperBound, 1000);
                const volume = area * thickness;
                resultDiv.innerHTML = `
                    <h5>Resultados</h5>
                    <p><strong>Función 1 (superior):</strong> ${func1}</p>
                    <p><strong>Función 2 (inferior):</strong> ${func2}</p>
                    <p><strong>Límites:</strong> desde ${lowerBound} hasta ${upperBound}</p>
                    <p><strong>Área entre curvas:</strong> ${area.toFixed(4)}</p>
                    <p><strong>Espesor:</strong> ${thickness}</p>
                    <p><strong>Volumen:</strong> ${volume.toFixed(4)} unidades cúbicas</p>
                `;
                plotFunctionsWithArea(func1, func2, lowerBound, upperBound);
            }

            document.getElementById('exportSection').style.display = 'block';
        } catch (error) {
            resultDiv.innerText = 'Error en el cálculo: ' + error.message;
        } finally {
            loader.style.display = 'none';
        }
    }, 300);
});

function evaluateFunction(func, x) {
    try {
        const parsedFunc = parseUserFunction(func);
        const finalExpr = parsedFunc.replace(/x/g, `(${x})`);
        return eval(finalExpr);
    } catch {
        throw new Error('Error evaluando la función. Verifica la sintaxis.');
    }
}

function trapezoidalRule(func, a, b, n) {
    const h = (b - a) / n;
    let sum = 0.5 * (func(a) + func(b));
    for (let i = 1; i < n; i++) {
        sum += func(a + i * h);
    }
    return sum * h;
}

function plotSingleFunction(func, a, b) {
    const canvas = document.getElementById('grafica');
    canvas.style.display = 'block';

    const n = 200;
    const step = (b - a) / n;
    const xValues = [];
    const yValues = [];

    for (let i = 0; i <= n; i++) {
        const x = a + i * step;
        xValues.push(x.toFixed(3));
        yValues.push(evaluateFunction(func, x));
    }

    if (chart !== null) {
        chart.destroy();
    }

    chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: 'Función',
                data: yValues,
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.3)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                zoom: {
                    pan: { enabled: true, mode: 'xy', modifierKey: 'ctrl' },
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
                }
            },
            scales: {
                x: { title: { display: true, text: 'x' } },
                y: { title: { display: true, text: 'f(x)' } }
            }
        }
    });
}

function plotFunctionsWithArea(func1, func2, a, b) {
    const canvas = document.getElementById('grafica');
    canvas.style.display = 'block';

    const n = 200;
    const step = (b - a) / n;

    const xValues = [];
    const y1Values = [];
    const y2Values = [];

    for (let i = 0; i <= n; i++) {
        const x = a + i * step;
        xValues.push(x.toFixed(3));
        y1Values.push(evaluateFunction(func1, x));
        y2Values.push(evaluateFunction(func2, x));
    }

    if (chart !== null) {
        chart.destroy();
    }

    chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [
                {
                    label: 'Función 1 (superior)',
                    data: y1Values,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'Función 2 (inferior)',
                    data: y2Values,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: '-1',
                    backgroundColor: 'rgba(75, 192, 192, 0.3)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                zoom: {
                    pan: { enabled: true, mode: 'xy', modifierKey: 'ctrl' },
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
                }
            },
            scales: {
                x: { title: { display: true, text: 'x' } },
                y: { title: { display: true, text: 'f(x)' } }
            }
        }
    });
}

// Exportar PDF
document.getElementById('downloadPDF').addEventListener('click', async () => {
    const exportElement = document.getElementById('resultadoCompleto');

    const canvasImage = await html2canvas(exportElement, {
        useCORS: true,
        scale: 2,
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const imgData = canvasImage.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('resultado_integral.pdf');
});

// Exportar PNG
document.getElementById('downloadPNG').addEventListener('click', async () => {
    const exportElement = document.getElementById('resultadoCompleto');

    const canvasImage = await html2canvas(exportElement, {
        useCORS: true,
        scale: 2,
    });

    const imgData = canvasImage.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'resultado_integral.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
document.getElementById('darkModeToggle').addEventListener('change', function () {
    document.body.classList.toggle('dark-mode', this.checked);
});
