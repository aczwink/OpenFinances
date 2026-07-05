/**
 * OpenFinances
 * Copyright (C) 2026 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */

import { Component, JSX_CreateElement } from "@aczwink/acfrontend";
import { ChartComponent } from "./ChartComponent";

export class LineChartComponent extends Component<{ labels: string[]; line: number[]; }>
{
    protected Render()
    {
        const data = {
            labels: this.input.labels,
            datasets: [
                {
                    label: '',
                    data: this.input.line,
                    borderColor: "red",
                    backgroundColor: "white",
                },
            ],
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false,
                        text: ''
                    }
                }
            },
        };

        return <ChartComponent config={config} />;
    }
}