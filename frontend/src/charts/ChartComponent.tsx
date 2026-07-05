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

declare const Chart: any;

export class ChartComponent extends Component<{ config: any; }>
{
    constructor()
    {
        super();

        this.id = "chart" + Math.random();
    }

    protected Render()
    {
        setTimeout(this.OnInitChart.bind(this), 200);
        return <canvas id={this.id}>
        </canvas>;
    }

    //Event handlers
    private OnInitChart()
    {
        new Chart(
            document.getElementById(this.id),
            this.input.config
        );
    }

    //State
    private id: string;
}

const defaultColors = [
  "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
  "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
  "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
];

export function GetChartColors()
{
    return defaultColors;
}