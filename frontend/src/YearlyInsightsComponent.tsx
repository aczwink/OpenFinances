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

import { Injectable, Component, JSX_CreateElement, JSX_Fragment, ProgressSpinner, Select, FormField } from "@aczwink/acfrontend";
import { APIService } from "./services/APIService";
import { MonthlyBalance, TransactionStatistics } from "../dist/api";
import { VerticalBarChartComponent } from "./charts/VerticalBarChartComponent";
import { DoughnutChartComponent } from "./charts/DoughnutChartComponent";
import { LineChartComponent } from "./charts/LineChartComponent";
import { RenderEuroAmount } from "./shared/money";

interface MonthlyData extends TransactionStatistics
{
    month: number;
}

@Injectable
export class YearlyInsightsComponent extends Component
{
    constructor(private apiService: APIService)
    {
        super();

        this.years = null;
        this.monthlyData = null;
        this.monthlyBalances = null;
        this.selectedYear = 0;
        this.stats = null;
    }

    protected Render()
    {
        if((this.years === null) || (this.stats === null))
            return <ProgressSpinner />;

        return <>
            <div className="row">
                <div className="col">
                    <FormField title="Year">
                        <Select onChanged={this.OnYearSelectionChanged.bind(this)}>
                            {this.years.map(x => <option selected={this.selectedYear === x} value={x}>{x.toString()}</option>)}
                        </Select>
                    </FormField>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-6">
                    {this.RenderIncomeOutcomeCharts()}
                </div>
                <div className="col-6">
                    {this.RenderMonetaryDevelopment()}
                </div>
            </div>
            <div className="row justify-content-evenly mt-5">
                <div className="col">
                    {this.RenderMonthlyAverages()}
                </div>
                <div className="col-2">
                    {this.RenderTagsSpendingsChart()}
                </div>
            </div>
        </>;
    }

    //Private methods
    private async LoadData()
    {
        this.stats = null;
        this.monthlyData = null;
        
        const response = await this.apiService.years._any_.stats.get(this.selectedYear);
        this.stats = response.data;

        const response2 = await this.apiService.years._any_.months.get(this.selectedYear);
        response2.data.SortBy(x => x);
        const monthly: MonthlyData[] = [];
        for (const month of response2.data)
        {
            const response3 = await this.apiService.years._any_.month._any_.stats.get(this.selectedYear, month, {});

            monthly.push({
                month,
                ...response3.data
            });
        }
        this.monthlyData = monthly;

        const response4 = await this.apiService.balance.get();
        const monthlyBalances = response4.data;
        this.monthlyBalances = monthlyBalances.filter(x => x.date.startsWith(this.selectedYear + "-"));
    }

    private MonthToString(month: number)
    {
        const date = new Date(2000, month-1, 1);

        return date.toLocaleString('default', { month: 'long' });
    }

    private RenderIncomeOutcomeCharts()
    {
        if(this.monthlyData === null)
            return <ProgressSpinner />;

        const labels = this.monthlyData.map(x => this.MonthToString(x.month));
        const income = this.monthlyData.map(x => x.income);
        const outgoings = this.monthlyData.map(x => -x.outgoings);
        return <VerticalBarChartComponent labels={labels} dataSets={[{ label: "Income", values: income }, { label: "Outgoings", values: outgoings }]} />
    }

    private RenderMonetaryDevelopment()
    {
        if(this.monthlyBalances === null)
            return <ProgressSpinner />;

        const labels = this.monthlyBalances.map(x => x.date);
        const monthlyBalances = this.monthlyBalances.map(x => x.balance);

        return <LineChartComponent labels={labels} line={monthlyBalances} />
    }

    private RenderMonthlyAverages()
    {
        if(this.stats === null)
            return <ProgressSpinner />;

        return <>
            <h3>Average costs per month:</h3>
            <table className="table table-striped table-hover table-sm">
                <thead>
                    <tr>
                        <th>Tag</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {this.stats.tagSpendings.Values().OrderBy(x => x.monthlyAverage).ToArray().map(x => <tr>
                        <td>{x.tag}</td>
                        <td>{RenderEuroAmount(x.monthlyAverage)}</td>
                    </tr>)}
                </tbody>
            </table>
        </>;
    }

    private RenderTagsSpendingsChart()
    {
        if(this.stats === null)
            return <ProgressSpinner />;

        const labels = this.stats.tagSpendings.map(x => x.tag);
        const values = this.stats.tagSpendings.map(x => x.amount);
        return <DoughnutChartComponent labels={labels} values={values} />;
    }

    private SelectYear(year: number)
    {
        this.selectedYear = year;
        this.LoadData();
    }

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.data.years.get();

        response.data.SortBy(x => x)
        this.years = response.data;

        this.SelectYear(response.data.Last());
    }

    private OnYearSelectionChanged(selection: string[])
    {
        this.SelectYear(parseInt(selection[0]!));
    }

    //State
    private selectedYear: number;
    private monthlyData: MonthlyData[] | null;
    private monthlyBalances: MonthlyBalance[] | null;
    private years: number[] | null;
    private stats: TransactionStatistics | null;
}