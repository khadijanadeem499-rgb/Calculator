// Calculator State
let currentInput = '0';
let previousInput = '';
let operator = '';
let expression = '';
let shouldReset = false;
let memory = 0;
let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
let currentMode = 'basic';
let currentTheme = localStorage.getItem('theme') || 'light';
let isDark = localStorage.getItem('theme') === 'dark';

// Unit Converter Data
const units = {
    'Length': {
        'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001,
        'mi': 1609.34, 'ft': 0.3048, 'in': 0.0254, 'yd': 0.9144
    },
    'Weight': {
        'kg': 1, 'g': 0.001, 'mg': 0.000001, 'lb': 0.453592,
        'oz': 0.0283495, 't': 1000
    },
    'Temperature': {
        'C': 1, 'F': 1, 'K': 1
    },
    'Area': {
        'm²': 1, 'km²': 1000000, 'cm²': 0.0001, 'ha': 10000,
        'ac': 4046.86, 'ft²': 0.092903
    },
    'Volume': {
        'L': 1, 'mL': 0.001, 'm³': 1000, 'gal': 3.78541,
        'qt': 0.946353, 'pt': 0.473176
    }
};

// DOM Elements
const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const memoryIndicator = document.getElementById('memoryIndicator');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initConverter();
    displayHistory();
    attachEventListeners();
    updateDisplay();
    initTrigTable();
});

function attachEventListeners() {
    // Number buttons
    document.getElementById('btn0').addEventListener('click', () => appendNumber('0'));
    document.getElementById('btn1').addEventListener('click', () => appendNumber('1'));
    document.getElementById('btn2').addEventListener('click', () => appendNumber('2'));
    document.getElementById('btn3').addEventListener('click', () => appendNumber('3'));
    document.getElementById('btn4').addEventListener('click', () => appendNumber('4'));
    document.getElementById('btn5').addEventListener('click', () => appendNumber('5'));
    document.getElementById('btn6').addEventListener('click', () => appendNumber('6'));
    document.getElementById('btn7').addEventListener('click', () => appendNumber('7'));
    document.getElementById('btn8').addEventListener('click', () => appendNumber('8'));
    document.getElementById('btn9').addEventListener('click', () => appendNumber('9'));

    // Operator buttons
    document.getElementById('btnAdd').addEventListener('click', () => appendOperator('+'));
    document.getElementById('btnSubtract').addEventListener('click', () => appendOperator('-'));
    document.getElementById('btnMultiply').addEventListener('click', () => appendOperator('*'));
    document.getElementById('btnDivide').addEventListener('click', () => appendOperator('/'));

    // Function buttons
    document.getElementById('btnClear').addEventListener('click', clearAll);
    document.getElementById('btnClearEntry').addEventListener('click', clearEntry);
    document.getElementById('btnBackspace').addEventListener('click', backspace);
    document.getElementById('btnToggleSign').addEventListener('click', toggleSign);
    document.getElementById('btnDecimal').addEventListener('click', appendDecimal);
    document.getElementById('btnEquals').addEventListener('click', calculate);

    // Memory buttons
    document.getElementById('memoryMC').addEventListener('click', () => handleMemory('MC'));
    document.getElementById('memoryMR').addEventListener('click', () => handleMemory('MR'));
    document.getElementById('memoryMPlus').addEventListener('click', () => handleMemory('M+'));
    document.getElementById('memoryMMinus').addEventListener('click', () => handleMemory('M-'));
    document.getElementById('memoryMS').addEventListener('click', () => handleMemory('MS'));
    document.getElementById('memoryMMultiply').addEventListener('click', () => handleMemory('M*'));
    document.getElementById('memoryMDivide').addEventListener('click', () => handleMemory('M/'));

    // Scientific buttons
    document.getElementById('sciSin').addEventListener('click', () => addScientific('sin'));
    document.getElementById('sciCos').addEventListener('click', () => addScientific('cos'));
    document.getElementById('sciTan').addEventListener('click', () => addScientific('tan'));
    document.getElementById('sciLog').addEventListener('click', () => addScientific('log'));
    document.getElementById('sciLn').addEventListener('click', () => addScientific('ln'));
    document.getElementById('sciSqrt').addEventListener('click', () => addScientific('sqrt'));
    document.getElementById('sciSquare').addEventListener('click', () => addScientific('^2'));
    document.getElementById('sciCube').addEventListener('click', () => addScientific('^3'));
    document.getElementById('sciPower').addEventListener('click', () => addScientific('^y'));
    document.getElementById('sciTenPower').addEventListener('click', () => addScientific('10^'));
    document.getElementById('sciEPower').addEventListener('click', () => addScientific('e^'));
    document.getElementById('sciPi').addEventListener('click', () => addScientific('pi'));
    document.getElementById('sciE').addEventListener('click', () => addScientific('e'));
    document.getElementById('sciFactorial').addEventListener('click', () => addScientific('fact'));
    document.getElementById('sciLeftParen').addEventListener('click', () => addScientific('('));
    document.getElementById('sciRightParen').addEventListener('click', () => addScientific(')'));
    document.getElementById('sciAbs').addEventListener('click', () => addScientific('abs'));
    document.getElementById('sciInverse').addEventListener('click', () => addScientific('inv'));
    document.getElementById('showTrigTable').addEventListener('click', toggleTrigTable);

    // Mode buttons
    document.getElementById('modeBasic').addEventListener('click', () => setMode('basic'));
    document.getElementById('modeScientific').addEventListener('click', () => setMode('scientific'));
    document.getElementById('modeConverter').addEventListener('click', () => setMode('converter'));
    document.getElementById('modeHistory').addEventListener('click', () => setMode('history'));

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // History button
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Converter inputs
    document.getElementById('converterFrom').addEventListener('input', convert);
    document.getElementById('converterFromUnit').addEventListener('change', convert);
    document.getElementById('converterToUnit').addEventListener('change', convert);

    // Close trig table button
    document.getElementById('closeTrigTable').addEventListener('click', toggleTrigTable);

    // Keyboard support
    document.addEventListener('keydown', handleKeyboard);
}

// Basic Calculator Functions
function appendNumber(num) {
    if (shouldReset) {
        currentInput = '';
        shouldReset = false;
    }
    if (currentInput === '0') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function appendDecimal() {
    if (shouldReset) {
        currentInput = '0';
        shouldReset = false;
    }
    if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay();
    }
}

function appendOperator(op) {
    if (operator && !shouldReset) {
        calculate();
    }
    previousInput = currentInput;
    operator = op;
    expression = currentInput + ' ' + getSymbol(op) + ' ';
    currentInput = '0';
    shouldReset = false;
    updateDisplay();
}

function getSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return symbols[op] || op;
}

function calculate() {
    try {
        let result;
        const prev = parseFloat(previousInput || currentInput);
        const curr = parseFloat(currentInput);

        if (operator === '+') result = prev + curr;
        else if (operator === '-') result = prev - curr;
        else if (operator === '*') result = prev * curr;
        else if (operator === '/') {
            if (curr === 0) {
                showToast('Cannot divide by zero');
                return;
            }
            result = prev / curr;
        } else return;

        result = parseFloat(result.toFixed(10));
        
        const historyEntry = (expression || prev) + ' ' + (operator || '') + ' ' + curr + ' = ' + result;
        addToHistory(historyEntry, result);
        
        expression = historyEntry;
        currentInput = result.toString();
        previousInput = '';
        operator = '';
        shouldReset = true;
        updateDisplay();
    } catch (e) {
        showToast('Error');
    }
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    expression = '';
    shouldReset = false;
    updateDisplay();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function backspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function toggleSign() {
    if (currentInput !== '0') {
        currentInput = currentInput.startsWith('-') ? 
            currentInput.substring(1) : '-' + currentInput;
        updateDisplay();
    }
}

function updateDisplay() {
    display.textContent = currentInput;
    expressionEl.textContent = expression;
}

// Memory Functions
function handleMemory(op) {
    const current = parseFloat(currentInput) || 0;
    switch(op) {
        case 'MC': memory = 0; showToast('Memory cleared'); break;
        case 'MR': currentInput = memory.toString(); showToast(`Recalled: ${memory}`); break;
        case 'M+': memory += current; showToast(`Added: ${current}`); break;
        case 'M-': memory -= current; showToast(`Subtracted: ${current}`); break;
        case 'MS': memory = current; showToast(`Stored: ${current}`); break;
        case 'M*': memory *= current; showToast(`Multiplied: ${current}`); break;
        case 'M/': 
            if (current !== 0) {
                memory /= current; 
                showToast(`Divided: ${current}`);
            } else showToast('Cannot divide by zero');
            break;
    }
    updateDisplay();
    memoryIndicator.style.display = memory !== 0 ? 'inline-block' : 'none';
}

// Scientific Functions
function addScientific(func) {
    if (shouldReset) {
        currentInput = '';
        shouldReset = false;
    }
    
    const num = parseFloat(currentInput) || 0;
    let result;

    try {
        switch(func) {
            case 'sin': result = Math.sin(num * Math.PI / 180); break;
            case 'cos': result = Math.cos(num * Math.PI / 180); break;
            case 'tan': result = Math.tan(num * Math.PI / 180); break;
            case 'log': result = Math.log10(num); break;
            case 'ln': result = Math.log(num); break;
            case 'sqrt': result = Math.sqrt(num); break;
            case '^2': result = Math.pow(num, 2); break;
            case '^3': result = Math.pow(num, 3); break;
            case '^y': 
                operator = '^';
                previousInput = currentInput;
                expression = currentInput + ' ^ ';
                currentInput = '0';
                updateDisplay();
                return;
            case '10^': result = Math.pow(10, num); break;
            case 'e^': result = Math.exp(num); break;
            case 'pi': currentInput = Math.PI.toString(); updateDisplay(); return;
            case 'e': currentInput = Math.E.toString(); updateDisplay(); return;
            case 'fact': 
                if (num < 0) throw 'Negative number';
                if (num > 170) throw 'Too large';
                result = 1;
                for (let i = 2; i <= num; i++) result *= i;
                break;
            case 'abs': result = Math.abs(num); break;
            case 'inv': result = 1 / num; break;
            case '(': currentInput += '('; updateDisplay(); return;
            case ')': currentInput += ')'; updateDisplay(); return;
        }
        
        if (result !== undefined) {
            addToHistory(`${func}(${num})`, result);
            currentInput = result.toString();
            shouldReset = true;
            updateDisplay();
        }
    } catch (e) {
        showToast('Error: ' + e);
    }
}

// Converter Functions
function initConverter() {
    const grid = document.getElementById('categoryGrid');
    const categories = Object.keys(units);
    
    grid.innerHTML = categories.map((cat, i) => 
        `<button class="category-btn ${i === 0 ? 'active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');

    document.querySelectorAll('[data-category]').forEach(btn => {
        btn.addEventListener('click', () => selectCategory(btn.textContent));
    });
    
    selectCategory(categories[0]);
}

function selectCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === category);
    });
    
    const unitList = Object.keys(units[category]);
    const fromSelect = document.getElementById('converterFromUnit');
    const toSelect = document.getElementById('converterToUnit');
    
    fromSelect.innerHTML = unitList.map(u => `<option value="${u}">${u}</option>`).join('');
    toSelect.innerHTML = unitList.map(u => `<option value="${u}">${u}</option>`).join('');
    
    if (unitList.length > 1) toSelect.value = unitList[1];
    convert();
}

function convert() {
    const category = document.querySelector('.category-btn.active')?.textContent;
    if (!category) return;
    
    const fromVal = parseFloat(document.getElementById('converterFrom').value) || 0;
    const fromUnit = document.getElementById('converterFromUnit').value;
    const toUnit = document.getElementById('converterToUnit').value;
    
    let result;
    if (category === 'Temperature') {
        let celsius;
        if (fromUnit === 'C') celsius = fromVal;
        else if (fromUnit === 'F') celsius = (fromVal - 32) * 5/9;
        else celsius = fromVal - 273.15;
        
        if (toUnit === 'C') result = celsius;
        else if (toUnit === 'F') result = celsius * 9/5 + 32;
        else result = celsius + 273.15;
    } else {
        result = fromVal * units[category][fromUnit] / units[category][toUnit];
    }
    
    document.getElementById('converterResult').textContent = result.toFixed(6);
}

// History Functions
function addToHistory(expr, result) {
    history.unshift({ expr, result, time: new Date().toLocaleTimeString() });
    if (history.length > 50) history.pop();
    localStorage.setItem('calcHistory', JSON.stringify(history));
    if (currentMode === 'history') displayHistory();
}

function displayHistory() {
    const list = document.getElementById('historyList');
    if (history.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-tertiary);">No history yet</div>';
        return;
    }
    
    list.innerHTML = history.map((item, i) => `
        <div class="history-item" data-history-index="${i}">
            <div class="history-expr">${item.expr}</div>
            <div class="history-result">${item.result}</div>
            <div class="history-time">${item.time}</div>
        </div>
    `).join('');

    document.querySelectorAll('[data-history-index]').forEach(item => {
        item.addEventListener('click', () => {
            const index = item.getAttribute('data-history-index');
            recallHistory(history[index].result);
        });
    });
}

function recallHistory(val) {
    currentInput = val;
    shouldReset = true;
    updateDisplay();
    setMode('basic');
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calcHistory');
    displayHistory();
    showToast('History cleared');
}

// Mode Functions
function setMode(mode) {
    currentMode = mode;
    localStorage.setItem('defaultMode', mode);
    updateModeUI();
}

function updateModeUI() {
    document.getElementById('modeBasic')?.classList.toggle('active', currentMode === 'basic');
    document.getElementById('modeScientific')?.classList.toggle('active', currentMode === 'scientific');
    document.getElementById('modeConverter')?.classList.toggle('active', currentMode === 'converter');
    document.getElementById('modeHistory')?.classList.toggle('active', currentMode === 'history');
    
    const scientificPanel = document.getElementById('scientificPanel');
    const converterPanel = document.getElementById('converterPanel');
    const historyPanel = document.getElementById('historyPanel');
    
    if (scientificPanel) scientificPanel.style.display = currentMode === 'scientific' ? 'grid' : 'none';
    if (converterPanel) converterPanel.style.display = currentMode === 'converter' ? 'block' : 'none';
    if (historyPanel) historyPanel.style.display = currentMode === 'history' ? 'block' : 'none';
    
    if (currentMode === 'history') displayHistory();
}

// Theme Functions
function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const icon = document.querySelector('.theme-toggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    
    showToast(isDark ? 'Dark mode activated' : 'Light mode activated');
}

function loadTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Keyboard Support
function handleKeyboard(e) {
    const key = e.key;
    if (/[0-9]/.test(key)) appendNumber(key);
    else if (key === '.') appendDecimal();
    else if (key === '+') appendOperator('+');
    else if (key === '-') appendOperator('-');
    else if (key === '*') appendOperator('*');
    else if (key === '/') appendOperator('/');
    else if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); }
    else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') backspace();
}

// Toast
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Trigonometry Table Functions
function initTrigTable() {
    const trigPanel = document.getElementById('trigPanel');
    if (trigPanel) {
        document.querySelectorAll('.trig-table td:not(.func-name)').forEach(cell => {
            cell.addEventListener('click', function() {
                const value = this.textContent;
                const func = this.parentElement.querySelector('.func-name').textContent;
                const angle = getAngleFromColumn(this.cellIndex);
                
                if (value !== '—') {
                    const decimalValue = convertTrigValue(value);
                    if (decimalValue !== null) {
                        appendNumber(decimalValue.toString());
                        addToHistory(`${func}(${angle}°)`, decimalValue);
                        showToast(`${func}(${angle}°) = ${decimalValue}`);
                    }
                } else {
                    showToast(`${func}(${angle}°) is undefined`);
                }
            });
            
            const value = cell.textContent;
            if (value !== '—') {
                const decimal = convertTrigValue(value);
                if (decimal !== null) {
                    cell.setAttribute('title', `≈ ${decimal.toFixed(6)}`);
                }
            }
        });
    }
}

function getAngleFromColumn(colIndex) {
    const angles = [0, 30, 45, 60, 90, 180, 270, 360];
    return angles[colIndex - 1] || 0;
}

function convertTrigValue(value) {
    if (value === '0') return 0;
    if (value === '1') return 1;
    if (value === '-1') return -1;
    if (value === '1/2') return 0.5;
    if (value === '-1/2') return -0.5;
    if (value === '√2/2') return Math.sqrt(2)/2;
    if (value === '-√2/2') return -Math.sqrt(2)/2;
    if (value === '√3/2') return Math.sqrt(3)/2;
    if (value === '-√3/2') return -Math.sqrt(3)/2;
    if (value === '1/√3') return 1/Math.sqrt(3);
    if (value === '-1/√3') return -1/Math.sqrt(3);
    if (value === '√3') return Math.sqrt(3);
    if (value === '-√3') return -Math.sqrt(3);
    if (value === '—') return null;
    return null;
}

function toggleTrigTable() {
    const panel = document.getElementById('trigPanel');
    if (panel) {
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }
}