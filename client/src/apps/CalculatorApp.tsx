import { useState } from 'react';

export function CalculatorApp() {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleNumber = (num: string) => {
        setDisplay(display === '0' ? num : display + num);
    };

    const handleOperator = (op: string) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const calculate = () => {
        try {
            const result = eval(equation + display);
            setDisplay(String(result));
            setEquation('');
        } catch {
            setDisplay('Error');
        }
    };

    const clear = () => {
        setDisplay('0');
        setEquation('');
    };

    return (
        <div className="h-full bg-[#1e1e1e] text-white p-4 flex flex-col gap-4 select-none">
            <div className="flex-1 flex flex-col justify-end items-end p-2">
                <div className="text-white/40 text-sm h-6">{equation}</div>
                <div data-testid="display" className="text-4xl font-light">{display}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <button onClick={clear} className="h-10 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">AC</button>
                <button className="h-10 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">+/-</button>
                <button className="h-10 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">%</button>
                <button onClick={() => handleOperator('/')} className="h-10 rounded-lg bg-orange-500 hover:bg-orange-400 transition-colors">÷</button>

                {[7, 8, 9].map(n => (
                    <button key={n} onClick={() => handleNumber(String(n))} className="h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">{n}</button>
                ))}
                <button onClick={() => handleOperator('*')} className="h-10 rounded-lg bg-orange-500 hover:bg-orange-400 transition-colors">×</button>

                {[4, 5, 6].map(n => (
                    <button key={n} onClick={() => handleNumber(String(n))} className="h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">{n}</button>
                ))}
                <button onClick={() => handleOperator('-')} className="h-10 rounded-lg bg-orange-500 hover:bg-orange-400 transition-colors">−</button>

                {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => handleNumber(String(n))} className="h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">{n}</button>
                ))}
                <button onClick={() => handleOperator('+')} className="h-10 rounded-lg bg-orange-500 hover:bg-orange-400 transition-colors">+</button>

                <button onClick={() => handleNumber('0')} className="col-span-2 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors px-4 text-left">0</button>
                <button onClick={() => handleNumber('.')} className="h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">.</button>
                <button onClick={calculate} className="h-10 rounded-lg bg-orange-500 hover:bg-orange-400 transition-colors">=</button>
            </div>
        </div>
    );
}
