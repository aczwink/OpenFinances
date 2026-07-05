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

const tag2ColorMap = new Map<string, string>;
let tag2ColorMapIndex = 0;

function CreateColorArray(tags: string[])
{
    function GetColor(tag: string)
    {
        const color = tag2ColorMap.get(tag);
        if(color === undefined)
        {
            const newColor = GetChartColors()[tag2ColorMapIndex++]!;
            tag2ColorMap.set(tag, newColor);
            return newColor;
        }

        return color;
    }

    return tags.map(GetColor);
}

export class DoughnutChartComponent extends Component<{ labels: string[]; values: number[]; }>
{
    protected Render()
    {
        const data = {
            labels: this.input.labels,
            datasets: [
                {
                    label: '',
                    data: this.input.values,
                    backgroundColor: CreateColorArray(this.input.labels),
                    borderColor: "black"
                }
            ]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false,
                    }
                }
            },
        };

        return <ChartComponent config={config} />;
    }
}