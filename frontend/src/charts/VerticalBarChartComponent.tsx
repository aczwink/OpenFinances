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
import { ChartComponent, GetChartColors } from "./ChartComponent";

interface BarDataSet
{
    label: string;
    values: number[];
}

export class VerticalBarChartComponent extends Component<{ labels: string[]; dataSets: BarDataSet[]; }>
{
    protected Render()
    {
        const data = {
            labels: this.input.labels,
            datasets: this.input.dataSets.map( (x, i) => ({
                label: x.label,
                data: x.values,
                borderColor: "black",
                backgroundColor: GetChartColors()[i],
            })
            ),
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: (this.input.dataSets.length === 1) ? false : true
                    },
                    title: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                    },
                }
            }
        };

        return <ChartComponent config={config} />;
    }
}