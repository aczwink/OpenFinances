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

import { Injectable, Component, JSX_CreateElement, JSX_Fragment, ProgressSpinner, Select, FormField, BootstrapIcon } from "@aczwink/acfrontend";
import { APIService } from "./services/APIService";
import { TransactionDTO, TransactionStatistics, TransactionType } from "../dist/api";
import { RenderEuroAmount } from "./shared/money";
import { VerticalBarChartComponent } from "./charts/VerticalBarChartComponent";
import { DoughnutChartComponent } from "./charts/DoughnutChartComponent";
import { MonthToShortString } from "./shared/months";
import { TransactionsTableComponent } from "./TransactionsTableComponent";

@Injectable
export class ViewTransactionsComponent extends Component
{
    constructor(private apiService: APIService)
    {
        super();

        this.accounts = null;
        this.years = null;
        this.selectedAccountIndex = -1;
        this.selectedYear = 0;
        this.selectedMonth = 0;
        this.months = [];
        this.transactions = [];
        this.stats = null;
    }

    protected Render()
    {
        if((this.years === null) || (this.accounts === null))
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
                <div className="col">
                    <FormField title="Month">
                        <Select onChanged={this.OnMonthSelectionChanged.bind(this)}>
                            {this.months.map(x => <option selected={this.selectedMonth === x} value={x}>{MonthToShortString(x)}</option>)}
                        </Select>
                    </FormField>
                </div>
                <div className="col">
                    <FormField title="Account">
                        <Select onChanged={this.OnAccountSelectionChanged.bind(this)}>
                            <option selected={this.selectedAccountIndex === -1} value={-1}>All</option>
                            {this.accounts.map( (x, i) => <option selected={this.selectedAccountIndex === i} value={i}>{x}</option>)}
                        </Select>
                    </FormField>
                </div>
            </div>
            <div className="row justify-content-evenly">
                <div className="col-4">
                    {this.RenderIncomeOutcomeChart()}
                </div>
                <div className="col-2">
                    {this.RenderTagsSpendingsChart()}
                </div>
            </div>
            {this.RenderResults()}
        </>;
    }

    //Private methods
    private async LoadData()
    {
        this.transactions = null;
        this.stats = null;

        const query = (this.selectedAccountIndex === -1) ? {} : { accountName: this.accounts![this.selectedAccountIndex]! };

        const response = await this.apiService.years._any_.month._any_.transactions.get(this.selectedYear, this.selectedMonth, query);
        const loaded = response.data;
        
        const response2 = await this.apiService.years._any_.month._any_.stats.get(this.selectedYear, this.selectedMonth, query);
        this.stats = response2.data;
        
        loaded.SortByDescending(x => x.date);
        this.transactions = loaded;
    }

    private RenderIncomeOutcomeChart()
    {
        if(this.stats === null)
            return <ProgressSpinner />;

        return <VerticalBarChartComponent labels={["Income", "Outgoings"]} dataSets={[{ label: "", values: [this.stats.income, -this.stats.outgoings] }]} />;
    }

    private RenderResults()
    {
        if(this.transactions === null)
            return <ProgressSpinner />;

        return <TransactionsTableComponent transactions={this.transactions} />;
    }

    private RenderTagsSpendingsChart()
    {
        if(this.stats === null)
            return <ProgressSpinner />;

        const labels = this.stats.tagSpendings.map(x => x.tag);
        const values = this.stats.tagSpendings.map(x => x.amount);
        return <DoughnutChartComponent labels={labels} values={values} />;
    }

    private async SelectYear(year: number)
    {
        const response = await this.apiService.years._any_.months.get(year);
        response.data.SortBy(x => x);
        this.months = response.data;

        if(!this.months.Contains(this.selectedMonth))
            this.selectedMonth = this.months.Last();

        this.selectedYear = year;
        this.LoadData();
    }

    //Event handlers
    private OnAccountSelectionChanged(selection: string[])
    {
        this.selectedAccountIndex = parseInt(selection[0]!);

        this.LoadData();
    }

    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.data.years.get();

        response.data.SortBy(x => x)
        this.years = response.data;

        this.SelectYear(response.data.Last());

        const response2 = await this.apiService.accounts.get();
        this.accounts = response2.data;
    }

    private OnMonthSelectionChanged(selection: string[])
    {
        this.selectedMonth = parseInt(selection[0]!);

        this.LoadData();
    }

    private OnYearSelectionChanged(selection: string[])
    {
        this.SelectYear(parseInt(selection[0]!));
    }

    //State
    private accounts: string[] | null;
    private selectedAccountIndex: number;
    private selectedYear: number;
    private selectedMonth: number;
    private months: number[];
    private years: number[] | null;
    private transactions: TransactionDTO[] | null;
    private stats: TransactionStatistics | null;
}