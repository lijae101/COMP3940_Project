import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function ChartComponent({ data, options, type }) {
    return (
        <>
            {type === 'line' && <Line data={data} options={options} />}
            {type === 'bar' && <Bar data={data} options={options} />}
        </>
    );
}

export default ChartComponent;
